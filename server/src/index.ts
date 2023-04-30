import WebSocketServer, { WebSocket } from "ws"
import TaskVariable from "./TaskVariable";
import path from "path"
import express, { response } from "express"
import fs from "fs";
import Task from "./Task";
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
var cors = require("cors");
const app = express();
const apiPort = 8080; 

const wss : WebSocketServer.Server = new WebSocketServer.Server({port: 25565});

interface Response{
    [key: string]: any;
}

var taskContent: Response = require("./tasks.json");
var tasks: Response = {};
for(let i in taskContent){
    let task: Task = taskContent[i] as Task;
    tasks[task.name] = task
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

app.post("/createTask", (req, res) => {

    const customConfig: Config = {
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        length: 3,
    };

    var newTask : Task = {
        "name": uniqueNamesGenerator(customConfig),
        "content": "",
        variables: new Array<TaskVariable>()
    };

    tasks[newTask.name] = newTask

    fs.writeFileSync(path.join(__dirname, "tasks.json"), JSON.stringify(tasks));

    res.send("test");
})


app.listen(apiPort, () => {
    console.log("express online");
});

