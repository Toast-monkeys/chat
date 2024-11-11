// Firebase configuration and imports
const firebaseConfig = {
  apiKey: "AIzaSyDMGCzjVLZUVZHCCxBDql5npVz_wcKxEX4",
  authDomain: "chat-room-eda59.firebaseapp.com",
  projectId: "chat-room-eda59",
  storageBucket: "chat-room-eda59.appspot.com",
  messagingSenderId: "1063922969354",
  appId: "1:1063922969354:web:c1693925c907a1681368f3"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM elements
const usernameInput = document.getElementById("username");
const roomCodeInput = document.getElementById("room-code");
const createRoomBtn = document.getElementById("create-room-btn");
const joinRoomBtn = document.getElementById("join-room-btn");
const chatSection = document.getElementById("chat-section");
const authSection = document.getElementById("auth-section");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const leaveRoomBtn = document.getElementById("leave-room-btn");
const roomTitle = document.getElementById("room-id");

const encodedPassword = "Q09PTEdVWS";
let roomId;
let username;
let isAdmin = false;

// Show chat section
function showChatSection() {
  authSection.style.display = "none";
  chatSection.style.display = "block";
}

// Clear chat box
function clearChatBox() {
  chatBox.innerHTML = "";
}

// Listen for incoming messages
function listenForMessages() {
  const q = db.collection("rooms").doc(roomId).collection("messages").orderBy("timestamp");
  q.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const { username, text } = change.doc.data();
        const msgEl = document.createElement("p");
        msgEl.textContent = `${username}: ${text}`;
        chatBox.appendChild(msgEl);
      }
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Generate random room code
function generateRoomCode() {
  return `${Math.floor(10000 + Math.random() * 90000)}`;
}

// Check admin password
function checkAdminPassword(inputPassword) {
  if (atob(encodedPassword) === inputPassword) {
    isAdmin = true;
    alert("Admin mode activated!");
    displayRoomsList();
  } else {
    alert("Incorrect password.");
  }
}

// Display active rooms list in admin mode
async function displayRoomsList() {
  const roomsQuery = db.collection("rooms").where("active", "==", true);
  const querySnapshot = await roomsQuery.get();
  let roomsList = "Active Rooms:\n";
  querySnapshot.forEach((doc) => {
    roomsList += `- Room Code: ${doc.id}\n`;
  });
  const chosenRoom = prompt(`${roomsList}\nEnter room code to join:`);
  if (chosenRoom) {
    joinRoomAdmin(chosenRoom.trim());
  }
}

// Admin joining room
async function joinRoomAdmin(roomCode) {
  const roomDoc = await db.collection("rooms").doc(roomCode).get();
  if (roomDoc.exists) {
    roomId = roomCode;
    roomTitle.textContent = `Room: ${roomId}`;
    showChatSection();
    listenForMessages();
  } else {
    alert("Room not found.");
  }
}

// Create a new room
createRoomBtn.addEventListener("click", async () => {
  username = usernameInput.value.trim();
  if (!username) return alert("Please enter a username.");

  roomId = generateRoomCode();
  await db.collection("rooms").doc(roomId).set({ active: true });

  roomTitle.textContent = `Room: ${roomId}`;
  showChatSection();
  listenForMessages();
});

// Join an existing room
joinRoomBtn.addEventListener("click", async () => {
  username = usernameInput.value.trim();
  roomId = roomCodeInput.value.trim();
  if (!username || !roomId) return alert("Please enter both a username and room code.");

  const roomDoc = await db.collection("rooms").doc(roomId).get();
  if (!roomDoc.exists()) return alert("Room not found.");

  roomTitle.textContent = `Room: ${roomId}`;
  showChatSection();
  listenForMessages();
});

// Send message
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  await db.collection("rooms").doc(roomId).collection("messages").add({
    username,
    text: message,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  });

  messageInput.value = "";
  messageInput.focus();
}

// Leave room
leaveRoomBtn.addEventListener("click", () => location.reload());

// Activate admin mode
document.addEventListener("keydown", (e) => {
  if (e.key === "`") {
    const adminPassword = prompt("Enter admin password:");
    checkAdminPassword(adminPassword);
  }
});
