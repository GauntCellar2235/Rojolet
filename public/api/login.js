import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
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
const auth = getAuth(app);
const firestore = getFirestore(app);

function setCookie(name, value, minutes) {
    let expires = "";
    if (minutes) {
        const date = new Date();
        date.setTime(date.getTime() + minutes * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${value || ""}${expires}; path=/; Secure; SameSite=Strict`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
            return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure; SameSite=Strict`;
}

window.login = async function () {
    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");

    if (!usernameInput || !passwordInput) {
        console.error("Username or password input fields not found.");
        return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            username + "@example.com",
            password,
        );

        const uid = userCredential.user.uid;
        const idToken = await userCredential.user.getIdToken();

        console.log("Setting cookies", { uid, idToken });

        setCookie("uid", uid, 10000000000); 
        setCookie("idToken", idToken, 10000000); 

        window.location.href = "stats.html";
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Login Error",
            text: "Incorrect username or password.",
        });
    }
};

async function validateToken(idToken) {
    try {
        const decodedToken = await auth.verifyIdToken(idToken); // 
        return decodedToken;
    } catch (error) {
        console.error("Token validation error:", error);
        return null;
    }
}

window.addEventListener("load", async () => {
    const uid = getCookie("uid");
    const idToken = getCookie("idToken");

    if (!uid || !idToken) {
        console.error("User not logged in or missing ID token!");
        return;
    }

    try {
        const tokenValid = await validateToken(idToken);
        if (!tokenValid) {
            console.error("Invalid token!");
            return;
        }

        console.log("Fetching user data with", { uid, idToken });

        const userRef = doc(firestore, "users", uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.roles || "User";

            const allowedRoles = ["Helper", "Mod", "Admin", "Owner"];
            if (allowedRoles.includes(role)) {
                const sidebar = document.querySelector(".sidebar ul");
                const panelItem = document.createElement("li");
                panelItem.innerHTML = `<a href="Panel.html">🔧 Panel</a>`;
                sidebar.appendChild(panelItem);
            }
        } else {
            console.error("User document not found!");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }

    deleteCookie("uid");
    deleteCookie("idToken");
});
