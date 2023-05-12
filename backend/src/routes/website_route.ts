import express from 'express';
import * as core from 'express-serve-static-core';
import path from 'path';
import { loggedIn } from '../util/util';

const websiteRouter = express.Router();

websiteRouter.get("/", loggedIn, (req, res) => {
    res.sendFile('public/index.html', {root: path.join(__dirname, "../")});
});

websiteRouter.get("/tasks", loggedIn, (req, res, next) => {
    res.sendFile('public/tasks.html', {root: path.join(__dirname, "../")});
})

websiteRouter.get("/editTask", loggedIn, (req, res) => {
    res.sendFile('public/editTask.html', {root: path.join(__dirname, "../")});
})

websiteRouter.get("/upload", loggedIn, (req, res) => {
    //res.send("my mummy said you hate foreigners")
    res.sendFile('public/upload.html', {root: path.join(__dirname, "../")});
});

websiteRouter.get("/devices", loggedIn, (req, res) => {
    res.sendFile('public/devices.html', {root: path.join(__dirname, "../")});
});

websiteRouter.get("/device", loggedIn, (req, res) => {
    res.sendFile('public/device.html', {root: path.join(__dirname, "../")});
});

export default websiteRouter;