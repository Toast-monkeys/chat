import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, doc, setDoc, addDoc, collection, onSnapshot, serverTimestamp, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDMGCzjVLZUVZHCCxBDql5npVz_wcKxEX4",
  authDomain: "chat-room-eda59.firebaseapp.com",
  projectId: "chat-room-eda59",
  storageBucket: "chat-room-eda59.appspot.com",
  messagingSenderId: "1063922969354",
  appId: "1:1063922969354:web:10a8f1c9f612feaf52a96a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const createRoomBtn = document.getElementById('create-room-btn');
const joinRoomBtn = document.getElementById('join-room-btn');
const usernameInput = document.getElementById('username');
const privacyToggle = document.getElementById('privacy-toggle');
const roomCodeInput = document.getElementById('room-code');
const roomOptions = document.getElementById('room-options');
const joinRoomList = document.getElementById('join-room-list');
const roomList = document.getElementById('room-list');
const chatSection = document.getElementById('chat-section');
const roomTitle = document.getElementById('room-title');
const leaveRoomBtn = document.getElementById('leave-room-btn');

let currentRoom = null;

createRoomBtn.addEventListener('click', async () => {
  if (usernameInput.value.trim() === '') {
    alert('Please enter a username!');
    return;
  }
  
  roomOptions.style.display = 'block';

  const privacySetting = privacyToggle.checked ? 'public' : 'private';
  const newRoomCode = Math.floor(Math.random() * 90000) + 10000;

  await setDoc(doc(db, 'rooms', newRoomCode.toString()), {
    privacy: privacySetting,
    creator: usernameInput.value,
    createdAt: serverTimestamp(),
  });

  alert(`${privacySetting.charAt(0).toUpperCase() + privacySetting.slice(1)} room created!`);
});

joinRoomBtn.addEventListener('click', async () => {
  joinRoomList.style.display = 'block';
  roomList.innerHTML = '';

  const q = query(collection(db, "rooms"), orderBy("createdAt"));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    let room = doc.data();
    const roomElement = document.createElement("li");
    roomElement.textContent = `Room code: ${doc.id} (Privacy: ${room.privacy})`;
    roomList.appendChild(roomElement);
  });
});
