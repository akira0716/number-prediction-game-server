const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
module.exports.io = new Server(server, {
  cors: {
    origin: "https://number-prediction-game.vercel.app",
    methods: ["GET", "POST"],
  },
});

server.listen(3000, () => {
  console.log(`server running`);
});
