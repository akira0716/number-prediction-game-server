const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
module.exports.io = new Server(server);

server.listen(3000, () => {
  console.log(`server running`);
});
