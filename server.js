const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
module.exports.io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
  },
});

server.listen(3000, () => {
  console.log(`server running`);
});
