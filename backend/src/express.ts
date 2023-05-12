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

const app: core.Express = express();
const expressPort: number = 8080;

export function initExpress(){
    console.log("Express online")
    app.listen(expressPort, () => console.log(`App listening to port ${expressPort}`));

    app.use(express.static(path.join(__dirname, 'public')));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({limit: '5000mb'}));
    app.use(cors());

    app.use(websiteRouter);
    app.use(authRouter);
    app.use(devicesRouter);
    app.use(tasksRouter);
    app.use(miscRouter);
}

export default app;