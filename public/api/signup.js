import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-firestore.js";

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

window.signup = async function() {
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            username + "@example.com",
            password
        );

        const uid = userCredential.user.uid;

        const userDoc = {
            username: username,
            tokens: 0,
            roles: "Common",
            profilePicture: "https://firebasestorage.googleapis.com/v0/b/shovel-shaft.appspot.com/o/images%2FScreenshot_2024-05-20_at_1.13.47_am-removebg-preview.webp?alt=media&token=28f3dad0-dbaa-4f14-9134-5323b3af0fc8",
            badges: [""],
            accepted: false,
            banned: false, // New field for ban status
            muted: false,  // New field for mute status
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
window.addEventListener("load", async () => {
    const uid = getCookie("uid");

    if (!uid) {
        console.error("User not logged in!");
        return;
    }

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
        console.error("User not found!");
    }
});