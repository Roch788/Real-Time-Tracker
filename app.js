const express = require("express");
const app = express();
const http = require("http");
const path = require("path");


const socketio = require("socket.io");  //socket io runs on http server

const server = http.createServer(app);

const io = socketio(server);





app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
    socket.on("send-location", function (data) {
        io.emit("receive-location", { id: socket.id, ...data })  //from io.emit all the peoples will be able to get the location
    })
    console.log("connected");
    socket.on("disconnect", function () {
        io.emit("user-disconnected", socket.id)
    })
})

app.get("/", (req, res) => {
    res.render("index");
})

server.listen(3000);