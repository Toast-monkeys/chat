import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, doc, setDoc, addDoc, collection, onSnapshot, serverTimestamp, query, orderBy, getDoc, getDocs, updateDoc, deleteDoc, where } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDMGCzjVLZUVZHCCxBDql5npVz_wcKxEX4",
  authDomain: "chat-room-eda59.firebaseapp.com",
  projectId: "chat-room-eda59",
  storageBucket: "chat-room-eda59.appspot.com",
  messagingSenderId: "1063922969354",
  appId: "1:1063922969354:web:c1693925c907a1681368f3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

function showChatSection() {
  authSection.style.display = "none";
  chatSection.style.display = "block";
}

function clearChatBox() {
  chatBox.innerHTML = "";
}

function listenForMessages() {
  const q = query(collection(db, "rooms", roomId, "messages"), orderBy("timestamp"));
  onSnapshot(q, (snapshot) => {
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

function generateRoomCode() {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `${randomDigits}`;
}

function checkAdminPassword(inputPassword) {
  if (atob(encodedPassword) === inputPassword) {
    isAdmin = true;
    alert("Admin mode activated!");
    displayRoomsList();
  } else {
    alert("Incorrect password.");
  }
}

async function displayRoomsList() {
  const roomsQuery = query(collection(db, "rooms"), where("active", "==", true));
  const querySnapshot = await getDocs(roomsQuery);
  let roomsList = "Active Rooms:\n";
  querySnapshot.forEach((doc) => {
    if (doc.data().users.length > 0) {  // Only show rooms with users in them
      roomsList += `- Room Code: ${doc.id}\n`;
    }
  });
  const roomCode = prompt(`${roomsList}Enter the room code to join:`);
  if (roomCode) joinRoom(roomCode);
}

async function createRoom() {
  username = usernameInput.value.trim();
  if (!username) return alert("Please enter a username.");
  roomId = generateRoomCode();
  await setDoc(doc(db, "rooms", roomId), {
    active: true,
    users: [username] // Add the username to the users list when they create a room
  });

  roomTitle.textContent = `Room: ${roomId}`;
  showChatSection();
  listenForMessages();
}

async function joinRoom(roomCode) {
  username = usernameInput.value.trim();
  if (!username || !roomCode) return alert("Please enter both a username and room code.");

  const roomDoc = await getDoc(doc(db, "rooms", roomCode));
  if (!roomDoc.exists()) return alert("Room not found.");

  await updateDoc(doc(db, "rooms", roomCode), {
    users: [...roomDoc.data().users, username] // Add the username to the room's users list
  });

  roomId = roomCode;
  roomTitle.textContent = `Room: ${roomId}`;
  showChatSection();
  listenForMessages();
}

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;
  await addDoc(collection(db, "rooms", roomId, "messages"), {
    username,
    text: message,
    timestamp: serverTimestamp()
  });
  messageInput.value = "";
  messageInput.focus();
}

leaveRoomBtn.addEventListener("click", async () => {
  const roomDoc = await getDoc(doc(db, "rooms", roomId));
  const updatedUsers = roomDoc.data().users.filter(user => user !== username);

  await updateDoc(doc(db, "rooms", roomId), {
    users: updatedUsers
  });

  if (updatedUsers.length === 0) {
    await deleteDoc(doc(db, "rooms", roomId));
  }

  location.reload();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "`") {
    const adminPassword = prompt("Enter admin password:");
    checkAdminPassword(adminPassword);
  }
});
