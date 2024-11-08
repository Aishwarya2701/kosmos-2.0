const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
require("dotenv").config();

const PORT = process.env.PORT || 2002;

// Serve static files
app.use(express.static(__dirname + '/client'));
app.use(express.static("./client/libs"));
app.use(express.static("./client/v3"));

// Routes for your pages
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});
app.get("/world", function (req, res) {
  res.sendFile(__dirname + "/client/world.html");
});
app.get("/cart", function (req, res) {
  res.sendFile(__dirname + "/client/cart.html");
});
app.get("/Chair", function (req, res) {
  res.sendFile(__dirname + `/client/ARViews/chair.html`);
});
app.get("/Hoddie", function (req, res) {
  res.sendFile(__dirname + `/client/ARViews/hoddie.html`);
});
app.get("/Headphones", function (req, res) {
  res.sendFile(__dirname + `/client/ARViews/headphones.html`);
});
app.get("/Lamp", function (req, res) {
  res.sendFile(__dirname + `/client/ARViews/lamp.html`);
});
app.get("/Sandal", function (req, res) {
  res.sendFile(__dirname + `/client/ARViews/sandal.html`);
});
app.get("/Almirah", function (req, res) {
  res.sendFile(__dirname + `/client/ARViews/almirah.html`);
});

io.sockets.on("connection", function (socket) {
  socket.userData = { x: 0, y: 0, z: 0, heading: 0 }; //Default values;

  console.log(`${socket.id} connected`);
  socket.emit("setId", { id: socket.id });
  socket.on("disconnect", function () {
    console.log(`${socket.id} disconnected`);
    socket.broadcast.emit("deletePlayer", { id: socket.id });
  });

  socket.on("init", function (data) {
    console.log(`socket.init ${data.model}`);
    socket.userData.model = data.model;
    socket.userData.colour = data.colour;
    socket.userData.x = data.x;
    socket.userData.y = data.y;
    socket.userData.z = data.z;
    socket.userData.heading = data.h;
    (socket.userData.pb = data.pb), (socket.userData.action = "Idle");
  });

  socket.on("update", function (data) {
    socket.userData.x = data.x;
    socket.userData.y = data.y;
    socket.userData.z = data.z;
    socket.userData.heading = data.h;
    (socket.userData.pb = data.pb), (socket.userData.action = data.action);
  });

  socket.on("added to cart", function (data) {
    socket.broadcast.emit("show added to cart", data);
  });

  socket.on("chat message", function (data) {
    console.log(`chat message:${data.id} ${data.message}`);
    io.to(data.id).emit("chat message", {
      id: socket.id,
      message: data.message,
    });
  });
});

http.listen(PORT, function () {
  console.log("listening on *:2002");
});

setInterval(function () {
  const nsp = io.of("/");
  let pack = [];

  for (let id in io.sockets.sockets) {
    const socket = nsp.connected[id];
    //Only push sockets that have been initialised
    if (socket.userData.model !== undefined) {
      pack.push({
        id: socket.id,
        model: socket.userData.model,
        colour: socket.userData.colour,
        x: socket.userData.x,
        y: socket.userData.y,
        z: socket.userData.z,
        heading: socket.userData.heading,
        pb: socket.userData.pb,
        action: socket.userData.action,
      });
    }
  }
  if (pack.length > 0) io.emit("remoteData", pack);
}, 40);
