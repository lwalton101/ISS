import { initExpress }  from "./express";
import { initTasks } from "./tasksModule";
import { initVictims } from "./victims";
import { initWebsockets } from './websocket';

initExpress();
initWebsockets();
initVictims();
initTasks();