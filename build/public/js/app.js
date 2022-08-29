"use strict";

var socket = io();
var welcome = document.getElementById("welcome");
var form = welcome.querySelector("form");
var room = document.getElementById("room");
room.hidden = true;
var roomName;

function handleMessageSubmit(event) {
  event.preventDefault();
  var input = room.querySelector("#msg input");
  var value = input.value;
  socket.emit("new_message", input.value, roomName, function () {
    addMessage("You: ".concat(value));
  });
  input.value = "";
} // function handleNicknameSubmit(event) {
//   event.preventDefault();
//   const input = room.querySelector("#name input");
//   const value = input.value;
//   socket.emit("nickname", input.value);
// }


function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  var h3 = room.querySelector("h3");
  h3.innerText = "Room ".concat(roomName);
  var msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  var nickname = form.querySelector("input[name=nickname]");
  var newroom = form.querySelector("input[name=room]");
  socket.emit("enter_room", newroom.value, nickname.value, showRoom);
  roomName = newroom.value;
  nickname.value = "";
  newroom.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

function addMessage(message) {
  var ul = room.querySelector("ul");
  var li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

socket.on("welcome", function (user, newCount) {
  var h3 = room.querySelector("h3");
  h3.innerText = "Room ".concat(roomName, " (").concat(newCount, ")");
  addMessage("".concat(user, " arrived!"));
});
socket.on("bye", function (left, newCount) {
  var h3 = room.querySelector("h3");
  h3.innerText = "Room ".concat(roomName, " (").concat(newCount, ")");
  addMessage("".concat(left, " left"));
});
socket.on("new_message", function (msg) {
  addMessage(msg);
}); //addMessage만 넣어도 (meg)=>{addMessage(msg)}와 같음

socket.on("room_change", function (rooms) {
  var roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";

  if (rooms.length === 0) {
    return;
  }

  rooms.forEach(function (room) {
    var li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});