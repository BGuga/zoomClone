const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

// function handleNicknameSubmit(event) {
//   event.preventDefault();
//   const input = room.querySelector("#name input");
//   const value = input.value;
//   socket.emit("nickname", input.value);
// }

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const nickname = form.querySelector("input[name=nickname]");
  const newroom = form.querySelector("input[name=room]");
  socket.emit("enter_room", newroom.value, nickname.value, showRoom);
  roomName = newroom.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

socket.on("welcome", (user) => {
  addMessage(`${user} arrived!`);
});

socket.on("bye", (left) => {
  addMessage(`${left} left`);
});

socket.on("new_message", (msg) => {
  addMessage(msg);
});
//addMessage만 넣어도 (meg)=>{addMessage(msg)}와 같음
