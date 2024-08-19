import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
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
const firestore = getFirestore(app);

window.addEventListener("load", async () => {
    const cookies = document.cookie.split("; ");
    const username = cookies
        .find((row) => row.startsWith("username="))
        .split("=")[1];

    const userRef = doc(firestore, "users", username);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        const purchasedItemsDiv = document.getElementById("purchasedItems");

        purchasedItemsDiv.innerHTML = "";

        (userData.unlockedSkins || []).forEach((item) => {
            const itemDiv = document.createElement("div");
            itemDiv.innerHTML = `
                <h3>${item.name}</h3>
                <img src="${item.url}" alt="${item.name}" width="100">
                <p>Quantity: ${item.count || 1}</p>
                <p>Rarity: ${item.rarity || "Unknown"}</p>
            `;
            purchasedItemsDiv.appendChild(itemDiv);
        });
    } else {
        alert("User not found!");
    }
});
