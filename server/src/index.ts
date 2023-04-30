import WebSocketServer, { WebSocket } from "ws"
import express, { response } from "express"
var cors = require("cors");
const app = express();
const apiPort = 8080; 

const wss : WebSocketServer.Server = new WebSocketServer.Server({port: 25565});

interface WebsocketList {
    [key: string]: WebSocket;
}

interface Response{
    [key: string]: any;
}
const websockets = new Map();

wss.on("connection", (ws, message) => {
    if("device-name" in message.headers){
        var deviceName = message.headers["device-name"];
        websockets.set(deviceName, ws);  
    }
});

app.use(cors())

app.get("/devices", (req, res) => {
    var responseObj: Response = {}
    responseObj["message"] = "Device list";
    responseObj["data"] = new Array<string>();
    var keys = websockets.forEach((value, key, map) => {
        var devList: Array<string> = responseObj["data"];
        devList.push(key);
    })
    res.send(JSON.stringify(responseObj));
});

app.get("/device", (req, res) => {
    var responseObj: Response = {}
    
    if(!("device-id" in req.headers)){
        responseObj["message"] = "Device-ID Not Found in Headers";
        res.status(400);
        res.send(JSON.stringify(responseObj));
    }

    if(!websockets.has(req.headers["device-id"])){
        responseObj["message"] = "Device Not Found";
        res.status(400);
        res.send(JSON.stringify(responseObj));
    } 
    else {
        responseObj["message"] = "Device Found";

        var data: Response = {};
        data["deviceName"] = req.headers["device-id"];
        data["online"] = "true";
        
        responseObj["data"] = data;

        res.status(200);
        res.send(JSON.stringify(responseObj));
    }
})

app.listen(apiPort, () => {
    console.log("express online");
});

