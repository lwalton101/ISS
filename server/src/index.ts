import WebSocketServer from "ws"


const wss : WebSocketServer.Server = new WebSocketServer.Server({port: 25565});

wss.on("connection", (ws, message) => {
    console.log("ws connected");
});

