import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, doc, setDoc, addDoc, collection, onSnapshot, serverTimestamp, query, orderBy, getDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

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
const createRoomBtn = document.getElementById("create-room-btn");
const joinRoomBtn = document.getElementById("join-room-btn");
const chatSection = document.getElementById("chat-section");
const authSection = document.getElementById("auth-section");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const leaveRoomBtn = document.getElementById("leave-room-btn");
const roomTitle = document.getElementById("room-id");
const privacyToggle = document.getElementById("privacy-toggle");
const roomOptions = document.getElementById("room-options");
const joinRoomList = document.getElementById("join-room-list");

let roomId;
let username;
let isPrivate = false;

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

        const usernameSpan = document.createElement("span");
        usernameSpan.style.color = "#1f51ff";
        usernameSpan.textContent = username;
        usernameSpan.style.fontWeight = "bold";

        const messageText = document.createTextNode(`: ${text}`);
        msgEl.appendChild(usernameSpan);
        msgEl.appendChild(messageText);
        chatBox.appendChild(msgEl);
      }
    });
  });
}

createRoomBtn.addEventListener("click", async () => {
  username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter a username!");
    return;
  }

  roomOptions.style.display = "block";  // Show the privacy toggle
});

privacyToggle.addEventListener("change", (e) => {
  isPrivate = e.target.checked;
});

joinRoomBtn.addEventListener("click", () => {
  joinRoomList.innerHTML = "";
  joinRoomList.style.display = "block";
  const q = query(collection(db, "rooms"), orderBy("timestamp"));
  onSnapshot(q, (snapshot) => {
    snapshot.docs.forEach((doc) => {
      const room = doc.data();
      const roomEl = document.createElement("div");
      const roomName = document.createElement("p");
      roomName.textContent = `Room Code: ${doc.id} (${room.isPrivate ? "Private" : "Public"})`;
      const joinBtn = document.createElement("button");
      joinBtn.textContent = "Join Room";
      joinBtn.addEventListener("click", async () => {
        roomId = doc.id;
        await setDoc(doc(db, "rooms", roomId, "users", username), { username, timestamp: serverTimestamp() });
        showChatSection();
        listenForMessages();
      });

      roomEl.appendChild(roomName);
      roomEl.appendChild(joinBtn);
      joinRoomList.appendChild(roomEl);
    });
  });
});

sendBtn.addEventListener("click", async () => {
  const message = messageInput.value.trim();
  if (!message) return;

  await addDoc(collection(db, "rooms", roomId, "messages"), {
    username,
    text: message,
    timestamp: serverTimestamp(),
  });
  messageInput.value = "";
});

leaveRoomBtn.addEventListener("click", () => {
  authSection.style.display = "block";
  chatSection.style.display = "none";
  clearChatBox();
});
