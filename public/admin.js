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

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

async function checkUserRole() {
    const username = getCookie("username");
    if (!username) {
        window.location.href = "login.html";
        return;
    }

    const userDocRef = firestore.doc(`users/${username}`);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
        const userData = userDoc.data();
        const roles = ["Helper", "Admin", "Mod", "Owner", "Co-Owner"];
        if (!roles.includes(userData.roles)) {
            window.location.href = "login.html";
        }
    } else {
        window.location.href = "login.html";
    }
}

async function searchUser() {
    const username = document.getElementById("username-search").value;
    const userDocRef = firestore.doc(`users/${username}`);
    const userDoc = await userDocRef.get();

    if (userDoc.exists) {
        const userData = userDoc.data();
        document.getElementById("user-username").textContent =
            `Username: ${userData.username}`;
        document.getElementById("user-info").style.display = "block";
        document.getElementById("username-search").value = "";
    } else {
        alert("User not found.");
    }
}

async function acceptUser() {
    const username = document
        .getElementById("user-username")
        .textContent.replace("Username: ", "");
    const userDocRef = firestore.doc(`users/${username}`);
    await userDocRef.update({ accepted: true });
    alert("User accepted.");
}

async function declineUser() {
    const username = document
        .getElementById("user-username")
        .textContent.replace("Username: ", "");
    const userDocRef = firestore.doc(`users/${username}`);
    await userDocRef.update({ accepted: false });
    alert("User declined.");
}

checkUserRole();
