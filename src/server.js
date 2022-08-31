import express from "express";
import http from "http";
import SocketIO from "socket.io";
const app = express();

const PORT = process.env.PORT || 3000;

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

app.use("/assets", express.static("src/public/"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const Serveropen = () =>
  console.log(`server is listening in http://localhost:${PORT}`);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

httpServer.listen(PORT, Serveropen);
