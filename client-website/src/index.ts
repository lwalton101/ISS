import express from "express";
import path from "path"
const app = express();
const webPort = 8081; 

app.use(express.static(path.join(__dirname, 'public')));

app.listen(webPort, () => {
    console.log("Express ready");
})

app.get("/", (req, res) => {
    res.sendFile('index.html');
});

app.get("/tasks", (req, res) => {
    res.sendFile('public/tasks.html', {root: __dirname});
})


app.get("/editTask", (req, res) => {
    res.sendFile('public/editTask.html', {root: __dirname});
})

app.get("/upload", (req, res) => {
    //res.send("my mummy said you hate foreigners")
    res.sendFile('public/upload.html', {root: __dirname});
});