import express from 'express';
import * as core from 'express-serve-static-core';
import path from 'path';

const authRouter = express.Router();

authRouter.get('/auth/login', function(req, res, next) {
    res.sendFile('public/login.html', {root: path.join(__dirname, "../")});
});

export default authRouter;