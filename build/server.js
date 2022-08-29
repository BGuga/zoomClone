"use strict";

var _express = _interopRequireDefault(require("express"));

var _http = _interopRequireDefault(require("http"));

var _socket = require("socket.io");

var _adminUi = require("@socket.io/admin-ui");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();
var PORT = 3000;
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", _express["default"]["static"](__dirname + "/public"));
app.get("/", function (req, res) {
  return res.render("home");
});
app.get("/*", function (req, res) {
  return res.redirect("/");
});

var openserver = function openserver() {
  return console.log("server is listening in http://localhost:".concat(PORT));
};

var httpServer = _http["default"].createServer(app);

var wsServer = new _socket.Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});
(0, _adminUi.instrument)(wsServer, {
  auth: false
});

function publicRooms() {
  var _wsServer$sockets$ada = wsServer.sockets.adapter,
      sids = _wsServer$sockets$ada.sids,
      rooms = _wsServer$sockets$ada.rooms;
  var publicRooms = [];
  rooms.forEach(function (_, key) {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  var _wsServer$sockets$ada2;

  return (_wsServer$sockets$ada2 = wsServer.sockets.adapter.rooms.get(roomName)) === null || _wsServer$sockets$ada2 === void 0 ? void 0 : _wsServer$sockets$ada2.size;
}

wsServer.on("connection", function (socket) {
  socket.onAny(function (event) {
    console.log("Socket Event:".concat(event));
  });
  socket.on("enter_room", function (roomName, nickname, done) {
    socket.join(roomName);
    socket["nickname"] = nickname;
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", function () {
    socket.rooms.forEach(function (room) {
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
    });
  });
  socket.on("disconnect", function () {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message", function (msg, room, done) {
    socket.to(room).emit("new_message", "".concat(socket.nickname, ": ").concat(msg));
    done();
  });
  socket.on("nickname", function (nickname) {
    return socket["nickname"] = nickname;
  });
}); // const sockets = [];
// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "Anon";
//   console.log("Connected to Browser ✅");
//   socket.on("close", () => console.log("Disconnected from the Browser ❌"));
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}: ${message.payload}`)
//         );
//       case "nickname":
//         socket["nickname"] = message.payload;
//     }
//   });
// });

httpServer.listen(PORT, openserver);