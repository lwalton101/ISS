import express from 'express';
import * as core from 'express-serve-static-core';

const app: core.Express = express();
const expressPort: number = 8080;



export function initExpress(){
    app.listen(expressPort, () => console.log(`App listening to port ${expressPort}`));
    app.use(express.static('public'))
}

export default app;