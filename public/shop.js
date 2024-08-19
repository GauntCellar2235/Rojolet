import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    updateDoc,
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

window.onload = function () {
    const shopItems = [
        {
            name: "GauntCellar2235",
            url: "images/blooks/Gaunt.webp",
            cost: 100,
            rarity: "Rare",
        },
        {
            name: "Prq",
            url: "images/blooks/Prq.webp",
            cost: 200,
            rarity: "Epic",
        },
    ];

    const shopItemsDiv = document.getElementById("shopItems");

    shopItems.forEach((item) => {
        const itemDiv = document.createElement("div");
        itemDiv.innerHTML = `
                    <h3>${item.name}</h3>
                    <img src="${item.url}" alt="${item.name}" width="100">
                    <p>Cost: ${item.cost} tokens</p>
                    <p>Rarity: ${item.rarity}</p>
                    <button onclick="buyItem('${item.name}', ${item.cost}, '${item.url}', '${item.rarity}')">Buy</button>
                `;
        shopItemsDiv.appendChild(itemDiv);
    });
};

window.buyItem = async function (name, cost, url, rarity) {
    const cookies = document.cookie.split("; ");
    const username = cookies
        .find((row) => row.startsWith("username="))
        .split("=")[1];

    const userRef = doc(firestore, "users", username);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.tokens >= cost) {
            const newTokens = userData.tokens - cost;
            let newSkins = userData.unlockedSkins || [];

            const existingItemIndex = newSkins.findIndex(
                (item) => item.name === name,
            );

            if (existingItemIndex !== -1) {
                newSkins[existingItemIndex].count =
                    (newSkins[existingItemIndex].count || 1) + 1;
            } else {
                newSkins.push({ name, url, count: 1, rarity });
            }

            await updateDoc(userRef, {
                tokens: newTokens,
                unlockedSkins: newSkins,
            });

            document.getElementById("tokenCount").innerText =
                `Tokens: ${newTokens}`;
            alert("Item purchased successfully!");
        } else {
            alert("Not enough tokens!");
        }
    } else {
        alert("User not found!");
    }
};
