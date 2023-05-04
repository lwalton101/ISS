import { WebSocket } from "ws"

interface Victim{
    ws: WebSocket;
    debugLines: Array<String>;
    devName: string;
}

export default Victim