const express = require('express')
const app = express()
const port = process.env.PORT || 3000;

const lobbies = {};
const lobbyMaxTime = 60*60*1000;

const uid = function(){
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/*setInterval(()=>{
    const keys = Object.keys(lobbies);
    keys.forEach(x=>{
        const lobby = lobbies[x];
        if(Date.now() > lobby.time + lobbyMaxTime){
            console.log("Deleted " + lobbies[x] + ", time over");
            delete lobbies[x];
        }
    });
},5*1000);*/

app.use(express.json());

app.get('/lobby', (req, res) => {
    let id = req.query.id;
    if(Object.keys(lobbies).length <= 0)
    {
        res.sendStatus(404);
        return;
    }
    if(!id || !lobbies[id])
        id = Object.keys(lobbies)[0];
    const lobby = lobbies[id];
    console.log("Sending lobby " + JSON.stringify(lobby));
    res.status(200).send(lobby);
})

app.post('/lobby', (req, res) => {
    const value = req.body;
    if(!value || !value.address || !value.port)
    {
        res.sendStatus(400)
        return;
    }
    const id = uid();
    lobbies[id] = {
        ...req.body,
        time: Date.now()
    };
    console.log("Created new lobby " + JSON.stringify(lobbies[id]));
    res.status(200).send(id);
})

app.delete('/lobby', (req, res) => {
    const id = req.query.id;
    if(!id)
    {
        res.sendStatus(400)
        return;
    }
    if(!lobbies[id]){
        res.sendStatus(404)
        return;
    }
    delete lobbies[id];
    console.log("Deleting lobby with id ",id);
    res.sendStatus(200);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})