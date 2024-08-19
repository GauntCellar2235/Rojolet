import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
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

window.signup = async function () {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        await createUserWithEmailAndPassword(
            auth,
            username + "@example.com",
            password,
        );

        const userDoc = {
            username: username,
            tokens: 0,
            roles: "user",
            profilePicture:
                "https://media.discordapp.net/attachments/1269896509273673748/1269896786764501053/download_45.png?ex=66b1bb0b&is=66b0698b&hm=b9fc0cde460dde4e74da074c187fbf399abc26d75bff57c700f98d22d6439464&=&format=webp&quality=lossless&width=571&height=571",
            badges: [""],
            accepted: false, // New field to track acceptance
        };

        await setDoc(doc(firestore, "users", username), userDoc);

        document.cookie = `username=${encodeURIComponent(username)}; path=/`;

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
