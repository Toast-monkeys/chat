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
const encodedBannedWords = "WwogICJmdWNrIiwgImYqY2siLCAiZmNrIiwgImZAY2siLCAiZnUqayIsICJmdWsiLCAiZnVjIiwgImZ1a2MiLCAiZnVjKiIsCiAgInNoaXQiLCAic2gxdCIsICJzaHQiLCAic2ghdCIsICJzaEB0IiwgImJpdGNoIiwgImIxdGNoIiwgImIhdGNoIiwgImIqaXRjaCIsIAogICJhc3Nob2xlIiwgImEkJGhvbGUiLCAiYSoqaG9sZSIsICJhc3NoMGxlIiwgImFzcyIsICJhJHMiLCAiYmFzdGFyZCIsICJiQHN0YXJkIiwKICAiZGljayIsICJkIWNrIiwgImQxY2siLCAiZCFrYyIsICJkIWNrIiwgImN1bnQiLCAiYypudCIsICJjQG50IiwgImt1bnQiLCAiaypudCIsIAogICJwdXNzeSIsICJwKnNzeSIsICJwdXNzIiwgIndob3JlIiwgIndoMHJlIiwgInNsdXQiLCAiczF1dCIsICJzIXV0IiwgImZhZ2dvdCIsIAogICJmQGdnb3QiLCAiZkBnIiwgImZhKipvdCIsICJuaWdnZXIiLCAibiFnZ2VyIiwgIm5sZ2dyIiwgIm5pZ2dhIiwgIm4hZ2dhIiwgIm4xZ2dhIiwgCiAgImxnZ2EiLCAiY29jayIsICJjMGNrIiwgImNAY2siLCAiaml6eiIsICJjdW0iLCAiYyptIiwgImNsaXQiLCAicCpzcyIsICJwKnNzeSIsCiAgImJhc3RAcmQiLCAiYiFzdGFyZCIsICJkMWNraGVhZCIsICJkKmNraGVhZCIsICJmYWciLCAiZkBnIiwgIm1AdGhlcmZ1Y2tlciIsICJtb3RoZXJmKmNrZXIiLAogICJtdXRoYWZ1Y2thIiwgIm1mIiwgImJAc3RhcmQiLCAiYkBzdEByZCIsICJkMWNraGVhZCIsICJkIWNraGVhZCIsICJ0d2F0IiwgInR3QHQiLCAidHdhdGZhY2UiLAogICJkb3VjaGUiLCAiZDB1Y2hlIiwgImNvY2tzdWNrZXIiLCAiYypja3N1Y2tlciIsICJwaW1wIiwgInAxbXAiLCAicCFtcCIsICJiIXRjaCIsICJwcmljayIsIAogICJwQHNzIiwgImYqZ2dvdCIsICJzdWNrIiwgInMqY2siLCAicCptcCIsICJjQGNrIiwgIm4hZ2dlciIsICJhc3N3aXBlIiwgImJ1dHRoZWFkIiwgImZyZWFraW5nIiwgCiAgImZyZWFraW4iLCAid3RmIiwgInd0ZiIsICJoZWxsIiwgImgzbGwiLCAiaDNsbHoiLCAiZipja2luIiwgImZ1a2luIiwgImEkJCIsICJzaDF0dCIsICJiIXRjaCIsIAogICJiQHRjaCIsICJiMXRjaCIsICJiMXRjaGV6IiwgImYhY2tlZCIsICJhJCRob2xlIiwgImNAY2siLCAiZzBkIiwgImcwZGRhbW4iLCAiZCFjayIKXQ==";

// Decode the Base64 string and parse it as a JSON array
const bannedWords = JSON.parse(atob(encodedBannedWords));

let roomId;
let username;

// Function to detect profanity in the message
function containsProfanity(message) {
  return bannedWords.some((word) => {
    const escapedWord = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
    return regex.test(message);
  });
}

// Function to show toast notification
function showToast() {
  const toast = document.getElementById("toast");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 6000); // Toast disappears after 6 seconds
}

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
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// Generate a 5-digit room code
function generateRoomCode() {
  return Math.floor(10000 + Math.random() * 90000);  // Generates a 5-digit number
}

createRoomBtn.addEventListener("click", async () => {
  username = usernameInput.value.trim();
  if (!username) return alert("Please enter a username.");
  roomId = generateRoomCode();  // Generate a 5-digit room code
  await setDoc(doc(db, "rooms", roomId.toString()), {});  // Save the room in Firebase
  roomTitle.textContent = roomId;  // Display the room code
  showChatSection();
  listenForMessages();
});

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

sendBtn.addEventListener("click", async () => {
  const messageText = messageInput.value.trim();
  if (messageText === "" || containsProfanity(messageText)) {
    showToast();
    return;
  }
  await addDoc(collection(db, "rooms", roomId, "messages"), {
    username,
    text: messageText,
    timestamp: serverTimestamp()
  });
  messageInput.value = "";
});
