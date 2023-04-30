import WebSocketServer, { WebSocket } from "ws"
import TaskVariable from "./TaskVariable";
import path from "path"
import express from "express"
import fs from "fs";
import Task from "./Task";
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
var cors = require("cors");
const app = express();
const apiPort = 8080; 
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


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
    var id = uniqueNamesGenerator(customConfig);

    var newTask : Task = {
        "name": id,
        "id": id,
        "content": "",
        variables: new Array<TaskVariable>()
    };

    tasks[newTask.name] = newTask

    saveTasks();

    var responseData: Response = {}
    
    responseData["message"] = "Task created successfully";
    responseData["data"] = {
        "taskID": newTask.name
    }

    res.send(JSON.stringify(responseData))
})

app.get("/getTasks", (req,res) => {
    var responseData: Response = {}
    
    responseData["message"] = "Tasks returned successfully";
    responseData["data"] = {
        "tasks": tasks
    }

    res.send(JSON.stringify(responseData))
})

app.get("/getTask", (req, res) => {
    var responseData: Response = {}

    if(!("task-id" in req.headers)){
        responseData["message"] = "Task-ID Not Found in Headers";
        res.status(400);
        res.send(JSON.stringify(responseData));
    } else{
        var taskName: string = req.headers["task-id"] as string
        responseData["message"] = "Task returned successfully";
        responseData["data"] = {
            "task": tasks[taskName]
        }
    
        res.send(JSON.stringify(responseData))
    }
});

app.post("/deleteTask", (req, res) => {
    console.log(req.body);

    if(!("taskID" in req.body)){
        res.status(400);
        var response: Response = {}
        response["message"] = "Malformed Request. No taskID in req body";
        res.send(response);
        return;
    }else{
        delete tasks[req.body["taskID"]];
        saveTasks();
    }

    var responseData: Response = {}
    responseData["message"] = "Task deleted successfully";
    res.send(JSON.stringify(responseData))
});

app.post("/editTask", (req, res) => {
    if(!("taskID" in req.body)){
        res.status(400);
        var response: Response = {};
        response["message"] = "Malformed Request. No taskID in req body";
        res.send(response);
        return;
    }

    if(!("taskJSON" in req.body)){
        res.status(400);
        var response: Response = {};
        response["message"] = "Malformed Request. No taskJSON in req body";
        res.send(response);
        return;
    }

    tasks[req.body["taskID"]] = req.body["taskJSON"];

    saveTasks();

    var responseData: Response = {}
    responseData["message"] = "Task edited successfully";
    res.send(JSON.stringify(responseData));
});

function saveTasks(){
    fs.writeFileSync(path.join(__dirname, "tasks.json"), JSON.stringify(tasks));
}


app.listen(apiPort, () => {
    console.log("express online");
});

