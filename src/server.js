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
    socket.to(roomName).emit("welcome", socket.id);
  });
  socket.on("offer", (offer, peerId) => {
    socket.to(peerId).emit("offer", offer, socket.id);
  });
  socket.on("answer", (answer, peerId) => {
    socket.to(peerId).emit("answer", answer, socket.id);
  });
  socket.on("ice", (ice, newmember) => {
    socket.to(newmember).emit("ice", ice, socket.id);
  });
});

httpServer.listen(PORT, Serveropen);
