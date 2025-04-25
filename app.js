const express = require('express');
const net = require("net");
const crypto = require("crypto");
const app = express();
const port = process.env.PORT || 3000;

const lobbies = {};
const lobbyMaxTime = 60*60*1000;

const uid = function(){
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const token = function(){
    return crypto.randomBytes(64).toString('hex');
}

app.use(express.json());

app.post("/check-port", async (req, res) => {
    const { address, port } = req.body;
    
    if (!address || !port) {
        return res.status(400).json({ success: false, message: "IP and port required" });
    }

    const socket = new net.Socket();
    let connected = false;

    socket.setTimeout(3000); // 3-second timeout

    socket.on("connect", () => {
        connected = true;
        socket.destroy();
        res.json({ success: true, message: `Port ${port} is open on ${address}` });
    });

    socket.on("timeout", () => {
        socket.destroy();
        if (!connected) res.json({ success: false, message: "Connection timed out" });
    });

    socket.on("error", (err) => {
        socket.destroy();
        if (!connected) res.json({ success: false, message: "Port is closed or unreachable" });
    });

    socket.connect(port, address);
});

app.get('/lobby', (req, res) => {
    let id = req.query.id;
    if(Object.keys(lobbies).length <= 0)
    {
        res.sendStatus(404);
        return;
    }
    if(!id || !lobbies[id])
        id = Object.keys(lobbies)[0];
    const {address,port} = lobbies[id];
    const dto = {
        id: id,
        address: address,
        port: port
    };
    console.log("Sending lobby " + JSON.stringify(dto));
    res.status(200).send(dto);
})

app.post('/lobby', (req, res) => {
    const value = req.body;
    if(!value || !value.address || !value.port)
    {
        res.sendStatus(400)
        return;
    }
    const id = uid();
    const deletionToken = token();
    lobbies[id] = {
        ...req.body,
        id: id,
        deletion: deletionToken,
        time: Date.now()
    };
    res.setHeader("deletion-token", deletionToken);
    console.log("Created new lobby " + JSON.stringify(lobbies[id]));
    res.status(200).send(id);
})

app.delete('/lobby', (req, res) => {
    const id = req.query.id;
    const token = req.headers["deletion-token"];
    if(!id || !token)
    {
        res.sendStatus(400)
        return;
    }
    if(!lobbies[id]){
        res.sendStatus(404)
        return;
    }
    if(lobbies[id].deletion != token){
        res.sendStatus(400)
        return;
    }
    delete lobbies[id];
    console.log("Deleting lobby with id ",id);
    res.sendStatus(200);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})