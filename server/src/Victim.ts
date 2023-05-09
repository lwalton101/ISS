import { WebSocket } from "ws"

interface Victim{
    ws: WebSocket;
    debugLines: Array<String>;
    devName: string;
    fileNames: Array<String>;
}

export default Victim