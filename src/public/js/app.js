const socket = io();
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let peers = {};
let newmember;
// let myPeerConnection;

const option = document.createElement("option");
option.value = "novalue";
option.innerText = "no camera";
camerasSelect.appendChild(option);

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    myStream.getVideoTracks().forEach((track) => (track.enabled = false));
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if (myPeerConnection) {
    console.log(myPeerConnection.getSenders());
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code

socket.on("welcome", async (newsocket) => {
  makeConnection(newsocket);
});

socket.on("offer", async (offer, peerId) => {
  console.log("received the offer");
  let myPeerConnection;
  myPeerConnection = new RTCPeerConnection();
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  console.log("send the answer");
  socket.emit("answer", answer, peerId);
  myPeerConnection.setLocalDescription(answer);
  peers[peerId] = myPeerConnection;
});

socket.on("answer", (answer, peerId) => {
  console.log("received the answer");
  peers[peerId].setRemoteDescription(answer);
});

socket.on("ice", (ice, peerId, iam) => {
  if (peers[peerId].currentTarget.remoteDescription === iam) {
    console.log("received candidate");
    peers[peerId].addIceCandidate(ice);
  }
});

// RTC Code

async function makeConnection(peerId) {
  let myPeerConnection;
  myPeerConnection = new RTCPeerConnection();
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
  const offer = await myPeerConnection.createOffer();
  console.log("send the offer");
  socket.emit("offer", offer, peerId);
  myPeerConnection.setLocalDescription(offer);
  peers[peerId] = myPeerConnection;
  newmember = peerId;
}

function handleIce(data) {
  const iam = data.currentTarget.localDescription;
  console.log("sent candidate");
  socket.emit("ice", data.candidate, roomName, iam);
}

function handleAddStream(data) {
  const newVideo = document.createElement("video");
  newVideo.srcObject = data.stream;
  newVideo.autoplay = true;
  call.appendChild(newVideo);

  // const peerFace = document.getElementById("peerFace");
  // console.log("Peer's Stream", data.stream);
  // peerFace.srcObject = data.stream;
}
