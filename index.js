const express = require('express');
let bodyParser = require('body-parser');
const app = express();  
const router = express.Router();
const PORT = 80;
let cors = require('cors');
app.use(cors());
app.use('/api', bodyParser.json(), router);   //[use json]
app.use('/api', bodyParser.urlencoded({ extended: false }), router);
let bears = {
    list: [
        { "id": 1, "name": "Winnie", "weight": 50 },
        { "id": 2, "name": "Pooh", "weight": 66 }]
 }
 
router.route('/bears')
.get((req, res) => {
    res.send(bears)
})
.post((req,res) => {
    console.log(req.body)
       let newBear = {}
       newBear.id = (bears.list.length)?bears.list[bears.list.length - 1].id + 1:1
       newBear.name = req.body.name
       newBear.weight = req.body.weight
       bears = { "list": [...bears.list, newBear] }
       res.json(bears)

})

router.route('/bears/:bear_id')
.get((req,res) => {
    let id = bears.list.findIndex((item) => (item.id == +req.params.bear_id));
    res.json(bears.list[id])
})
.put((req,res) => {
    let id = bears.list.findIndex((item) => (item.id == +req.params.bear_id));
    console.log("id = ",id)
    if (id == -1){
        return res.json({message: "not found!"})
    }
    bears.list[id].name = req.body.name;
    bears.list[id].weight = req.body.weight;
    res.json(bears.list)
})
.delete((req, res) => {
    const bear_id = req.params.bear_id
    console.log('bearId: ',bear_id)
    let id = bears.list.findIndex((item) => (item.id == +req.params.bear_id));
    console.log("id = ",id)
    if (id == -1){
        return res.json({message: "not found!"})
    }
    else {
        bears.list = bears.list.filter(item => (+item.id !== +bear_id))
    }

    res.json(bears.list)
})

app.listen(PORT, () => {
    console.log("Server running at ", PORT)
})