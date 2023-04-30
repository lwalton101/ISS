import WebSocketServer from "ws"
import express from "express"
var cors = require("cors");
const app = express();
const apiPort = 8080; 

const wss : WebSocketServer.Server = new WebSocketServer.Server({port: 25565});

wss.on("connection", (ws, message) => {
    console.log("ws connected");
});

app.use(cors())
app.get("/online", (req, res) => {
    res.send("true");
});

app.listen(apiPort, () => {
    console.log("express online");
});

