import express from 'express';
import * as core from 'express-serve-static-core';
import path from 'path';

const websiteRouter = express.Router();

websiteRouter.get("/", (req, res) => {
    res.sendFile('public/index.html', {root: path.join(__dirname, "../")});
});

websiteRouter.get("/tasks", (req, res) => {
    res.sendFile('public/tasks.html', {root: path.join(__dirname, "../")});
})

websiteRouter.get("/editTask", (req, res) => {
    res.sendFile('public/editTask.html', {root: path.join(__dirname, "../")});
})

websiteRouter.get("/upload", (req, res) => {
    //res.send("my mummy said you hate foreigners")
    res.sendFile('public/upload.html', {root: path.join(__dirname, "../")});
});

websiteRouter.get("/devices", (req, res) => {
    res.sendFile('public/devices.html', {root: path.join(__dirname, "../")});
});

websiteRouter.get("/device", (req, res) => {
    res.sendFile('public/device.html', {root: path.join(__dirname, "../")});
});

export default websiteRouter;