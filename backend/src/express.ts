import express from 'express';
import * as core from 'express-serve-static-core';
import websiteRouter from './routes/website_route';
import path from 'path';
import bodyParser from 'body-parser';
import cors from "cors";
import devicesRouter from './routes/api/devices_route';
import tasksRouter from './routes/api/tasks_routes';
import miscRouter from './routes/api/misc_route';
import authRouter from './routes/auth_route';
import session from 'express-session';
import Config from './classes/Config';
import passport from 'passport';

const config: Config = require("./config.json");
const app: core.Express = express();
const expressPort: number = 8080;

export function initExpress(){
    console.log("Express online")
    app.listen(expressPort, () => console.log(`App listening to port ${expressPort}`));

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({limit: '5000mb'}));

    app.use(session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.authenticate('session'));

    app.use(websiteRouter);
    app.use(authRouter);
    app.use(devicesRouter);
    app.use(tasksRouter);
    app.use(miscRouter);

    app.use(express.static(path.join(__dirname, 'public')));
    
    app.use(cors());

    

    
}

export default app;