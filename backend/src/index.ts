import app, { initExpress }  from "./express";
import { initPassport } from "./middleware/passportIntegration";
import { initTasks } from "./tasksModule";
import { initVictims } from "./victims";
import { initWebsockets } from './websocket';

initExpress();
initPassport(app)
initWebsockets();
initVictims();
initTasks();