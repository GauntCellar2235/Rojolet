import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
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

document.addEventListener("DOMContentLoaded", function () {
    window.signup = async function () {
        const usernameElement = document.getElementById("signup-username");
        const passwordElement = document.getElementById("signup-password");

        if (!usernameElement || !passwordElement) {
            console.error("Input elements not found!");
            return;
        }

        const username = usernameElement.value;
        const password = passwordElement.value;

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                username + "@example.com",
                password,
            );

            const uid = userCredential.user.uid;

            const userDoc = {
                username: username,
                tokens: 0,
                roles: "Common",
                profilePicture:
                    "https://firebasestorage.googleapis.com/v0/b/shovel-shaft.appspot.com/o/images%2FScreenshot_2024-05-20_at_1.13.47_am-removebg-preview.webp?alt=media&token=28f3dad0-dbaa-4f14-9134-5323b3af0fc8",
                badges: [""],
                accepted: false,
                banned: false, // New field for ban status
                muted: false, // New field for mute status
            };

            await setDoc(doc(firestore, "users", uid), userDoc);

            document.cookie = `uid=${uid}; path=/`;

            Swal.fire({
                icon: "success",
                title: "Sign Up Successful",
                text: "Your account has been created!",
            }).then(() => {
                window.location.href = "login.html";
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message,
            });
        }
    };
});
