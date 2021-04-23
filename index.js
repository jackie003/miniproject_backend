const express = require("express"),
  app = express(),
  passport = require("passport"),
  port = process.env.PORT || 80,
  cors = require("cors"),
  cookie = require("cookie");

const bcrypt = require("bcrypt");

const db = require("./database.js");
let users = db.users;

require("./passport.js");

const router = require("express").Router(),
  jwt = require("jsonwebtoken");

app.use("/api", router);
router.use(cors({ origin: "http://localhost:3000", credentials: true }));
// router.use(cors())
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    console.log("Login: ", req.body, user, err, info);
    if (err) return next(err);
    if (user) {
        if (req.body.remember == true) {
          time_exp = "7d";
        } else time_exp = "1d";
        const token = jwt.sign(user, db.SECRET, {
          expiresIn: time_exp,
        });
        var decoded = jwt.decode(token);
        //let time = "" + new Date(decoded.exp * 1000);
        let time = new Date(decoded.exp * 1000);
        //let str = time.substring(0, 10);
        console.log(new Date(decoded.exp * 1000));
        res.setHeader(
          "Set-Cookie",
          cookie.serialize("token", token, {
              httpOnly: true,
              secure: process.env.NODE_ENV !== "development",
              maximdb: 60 * 60,
              sameSite: "strict",
              path: "/",
          })
      );
      res.statusCode = 200;
      return res.json({ user, token });
    } else return res.status(422).json(info);
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maximdb: -1,
      sameSite: "strict",
      path: "/",
    })
  );
  res.statusCode = 200;
  return res.json({ message: "Logout successful" });
});

/* GET user profile. */
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.send(req.user);
  }
);

router.post("/register", async (req, res) => {
  try {
    const SALT_ROUND = 10;
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.json({ message: "Cannot register with empty string" });
    if (db.checkExistingUser(username) !== db.NOT_FOUND)
      return res.json({ message: "Duplicated user" });

    let id = users.users.length
      ? users.users[users.users.length - 1].id + 1
      : 1;
    hash = await bcrypt.hash(password, SALT_ROUND);
    users.users.push({ id, username, password: hash, email });
    res.status(200).json({ message: "Register success" });
  } catch {
    res.status(422).json({ message: "Cannot register" });
  }
});

router.get("/alluser", (req, res) => res.json(db.users.users));

router.get("/", (req, res, next) => {
  res.send("Respond without authentication");
});

  let movie = {
    list: [
      { id: 1, type: "The Dark Knight (2008)", imdb: "9/10", 
      worldwide_gross: "$1,005,973,645", 
      storyline: "Set within a year after the events of Batman Begins (2005), Batman, Lieutenant James Gordon, and new District Attorney Harvey Dent successfully begin to round up the criminals that plague Gotham City, until a mysterious and sadistic criminal mastermind known only as The Joker appears in Gotham, creating a new wave of chaos. Batman's struggle against The Joker becomes deeply personal, forcing him to confront everything he believes and improve his technology to stop him. A love triangle develops between Bruce Wayne, Dent, and Rachel Dawes" },
      { id: 2, type: "The Shawshank Redemption (1994)", imdb: "9.3/10", 
      worldwide_gross: "$1,005,973,645", 
      storyline: "Chronicles the experiences of a formerly successful banker as a prisoner in the gloomy jailhouse of Shawshank after being found guilty of a crime he did not commit. The film portrays the man's unique way of dealing with his new, torturous life; along the way he befriends a number of fellow prisoners, most notably a wise long-term inmate named Red. Written" },
    ],
  };
  
  let income = 0;
  
  router
    .route("/movie")
    .get((req, res) => {
      res.send(movie);
    })
    .post((req, res) => {
      console.log(req.body);
      let newPet = {};
      //console.log(todo.list.length ? todo.list[todo.list.length - 1].id + 1 : 1);
      newPet.id = movie.list.length ? movie.list[movie.list.length - 1].id + 1 : 1;
      newPet.type = req.body.type;
      newPet.imdb = req.body.imdb;
      newPet.weight = req.body.weight;
      newPet.price = req.body.price;
      movie = { list: [...movie.list, newPet] };
      res.json(movie);
    });
  
  router
    .route("/movie/:petid")
    .get((req, res) => {
      let id = movie.list.findIndex((item) => +item.id == +req.params.petid)
      //console.log("id",id)
      res.json(movie.list[id]);
    })
    .put((req, res) => {
      let id = movie.list.findIndex((item) => item.id == +req.params.petid);
      movie.list[id].type = req.body.type;
      movie.list[id].imdb = req.body.imdb;
      movie.list[id].weight = req.body.weight;
      movie.list[id].price = req.body.price;
      res.json(movie.list);
    })
    .delete((req, res) => {
      movie.list = movie.list.filter((item) => +item.id !== +req.params.petid);
      res.json(movie.list);
    });
  
  router.route("/income")
  .get((req,res) => {
    console.log("sss")
    res.json(income)
  });
  
  router.route("/purchase/:petId")
  .post((req,res) => {
    let id = movie.list.findIndex((item) => +item.id == +req.params.petId)
    if (id == -1) {
      res.json({message: "Pet not found"})
    }
    else {
      income = movie.list[id].price;
      console.log(income)
      movie.list = movie.list.filter((item) => +item.id !== +req.params.petId);
      res.json(movie.list);
    }
  })

// Error Handler
app.use((err, req, res, next) => {
  let statusCode = err.status || 500;
  res.status(statusCode);
  res.json({
    error: {
      status: statusCode,
      message: err.message,
    },
  });
});

// Start Server
app.listen(port, () => console.log(`Server is running on port ${port}`));
