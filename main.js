// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, doc, setDoc, addDoc, collection, onSnapshot, serverTimestamp, query, orderBy, getDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMGCzjVLZUVZHCCxBDql5npVz_wcKxEX4",
  authDomain: "chat-room-eda59.firebaseapp.com",
  projectId: "chat-room-eda59",
  storageBucket: "chat-room-eda59.appspot.com",
  messagingSenderId: "1063922969354",
  appId: "1:1063922969354:web:c1693925c907a1681368f3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// UI elements
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

let roomId;
let username;

// Show chat section
function showChatSection() {
  authSection.style.display = "none";
  chatSection.style.display = "block";
}

// Clear chat box
function clearChatBox() {
  chatBox.innerHTML = "";
}

// Listen for new messages
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

    // Keep the chat scrolled to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Generate a random 5-digit room code
function generateRoomCode() {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);  // Generates a random 5-digit number
  return `${randomDigits}`;  // Returns the 5-digit number
}

// Create a new room
createRoomBtn.addEventListener("click", async () => {
  username = usernameInput.value.trim();
  if (!username) return alert("Please enter a username.");

  // Generate a room code and create a room
  roomId = generateRoomCode();
  await setDoc(doc(db, "rooms", roomId), {});
  roomTitle.textContent = roomId;
  showChatSection();
  listenForMessages();
});

// Join an existing room
joinRoomBtn.addEventListener("click", async () => {
  username = usernameInput.value.trim();
  roomId = roomCodeInput.value.trim();

  if (!username || !roomId) return alert("Please enter both a username and room code.");

  const roomDoc = await getDoc(doc(db, "rooms", roomId));
  if (!roomDoc.exists()) return alert("Room not found.");

  roomTitle.textContent = roomId;
  showChatSection();
  listenForMessages();
});

// Send a message
sendBtn.addEventListener("click", sendMessage);

// Handle Enter key to send message
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Function to send a message
async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return; // Don't send if the message is blank

  // Add message to Firestore
  await addDoc(collection(db, "rooms", roomId, "messages"), {
    username,
    text: message,
    timestamp: serverTimestamp()
  });

  // Clear the input field immediately after sending
  messageInput.value = "";
  messageInput.blur();  // Optionally remove focus from the input field to avoid lingering cursor
}

// Leave room
leaveRoomBtn.addEventListener("click", () => {
  location.reload();
});
