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

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        await signInWithEmailAndPassword(
            auth,
            username + "@example.com",
            password,
        );

        const userDocRef = doc(firestore, "users", username);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.accepted) {
                document.cookie = `username=${username}; path=/`;

                Swal.fire({
                    icon: "success",
                    title: "Login Successful",
                    text: "You are now logged in!",
                }).then(() => {
                    window.location.href = "stats.html";
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Your account is not accepted yet.",
                });
            }
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "User not found.",
            });
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
        });
    }
}

window.login = login;
