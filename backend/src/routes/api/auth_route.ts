import express from 'express';
import * as core from 'express-serve-static-core';
import path from 'path';

const authRouter = express.Router();

authRouter.get('/auth/login', function(req, res, next) {
    res.render('login');
});

export default authRouter;