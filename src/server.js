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

httpServer.listen(PORT, Serveropen);
