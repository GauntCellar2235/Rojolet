import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import {
    getDatabase,
    ref,
    onChildAdded,
    push,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js";
import {
    getAuth,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCOIKlP9YhtX9xa5aoggmsrWwavlW-XuzI",
    authDomain: "cosmik-7c124.firebaseapp.com",
    databaseURL: "https://cosmik-7c124-default-rtdb.firebaseio.com",
    projectId: "cosmik-7c124",
    storageBucket: "cosmik-7c124.appspot.com",
    messagingSenderId: "412506429662",
    appId: "1:412506429662:web:9ca3e17199297df7384a4f",
    measurementId: "G-R7K0LTHCK3",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);
const auth = getAuth(app);

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2)
        return decodeURIComponent(parts.pop().split(";").shift());
    return null;
}

const username = getCookie("username") || "Guest";
let userRoles = [];
let chatColor = "#000000"; // Default chat color

async function fetchUserData(username) {
    try {
        const docRef = doc(firestore, "users", username);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            userRoles = data.roles ? data.roles.split(",") : [];
            return data;
        } else {
            console.error("No such document!");
            return {
                profilePicture: "images/blooks/default.png",
                badges: [],
            };
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        return {
            profilePicture: "https://via.placeholder.com/40",
            badges: [],
        };
    }
}

function escapeHTML(input) {
    const element = document.createElement('div');
    element.innerText = input;
    return element.innerHTML;
}

async function addMessage(username, text, timestamp, color) {
    const { profilePicture, badges } = await fetchUserData(username);
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    
    const badgeElements = badges
        .map((badge) => `<img src="${badge}" class="badge" alt="Badge">`)
        .join("");

    messageDiv.innerHTML = `
    <img src="${profilePicture}" class="profile-picture" width="40" height="40">
    <div class="content" style="color: ${color};">
        <div class="badges">
            ${badgeElements}
        </div>
        <div class="username">${escapeHTML(username)}</div>
        <div class="text">${escapeHTML(text)}</div>
        <div class="timestamp">${escapeHTML(timestamp)}</div>
    </div>
`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if (userInteracted && text.includes(`@${username}`)) {
        notificationSound.play().catch((error) => {
            console.error("Error playing sound:", error);
        });
    }
}

function loadMessages() {
    const messagesRef = ref(database, "messages");
    onChildAdded(messagesRef, (snapshot) => {
        const message = snapshot.val();
        addMessage(
            message.username,
            message.text,
            message.timestamp,
            message.color || "#000000",
        );
    });
}

loadMessages();

const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const notificationSound = document.getElementById("notificationSound");
const colorPicker = document.getElementById("colorPicker"); // Color picker div

let userInteracted = false;
document.body.addEventListener("click", () => {
    userInteracted = true;
});

sendButton.addEventListener("click", async () => {
    const text = messageInput.value.trim();
    if (text) {
        const timestamp = new Date().toLocaleString();
        const message = {
            username,
            text,
            timestamp,
            color: userRoles.some((role) =>
                [
                    "Co-Owner",
                    "Owner",
                    "Admin",
                    "Mod",
                    "Helper",
                    "Tester",
                ].includes(role),
            )
                ? chatColor
                : "#000000",
        };
        const messagesRef = ref(database, "messages");
        push(messagesRef, message)
            .then(() => {
                messageInput.value = "";
                if (userInteracted) {
                    notificationSound.play().catch((error) => {
                        console.error("Error playing sound:", error);
                    });
                }
            })
            .catch((error) => {
                console.error("Error adding message:", error);
            });
    }
});

messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendButton.click();
    }
});

// Toggle visibility of color picker div when 'T' is pressed
    document.addEventListener("keydown", (e) => {
    if (
        e.key === "T" &&
        userRoles.some((role) =>
            ["Co-Owner", "Owner", "Admin", "Mod", "Helper", "Tester"].includes(
                role,
            ),
        )
    ) {
        if (colorPicker) {
            colorPicker.style.display =
                colorPicker.style.display === "none" ? "block" : "none";
        }
    }
});

// Change chat color based on selection
colorPicker.addEventListener("click", (e) => {
    if (e.target.classList.contains("color-option")) {
        chatColor = e.target.getAttribute("data-color");
        colorPicker.style.display = "none"; // Hide the picker after selection
    }
});