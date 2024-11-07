const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Kosmos!");
});

// Your other routes and middleware

module.exports = app;
