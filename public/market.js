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

const shopItems = [
    {
        name: "GauntCellar2235",
        url: "https://c1bc10b3-5b75-4650-b220-d4b321e8b25c-00-3prrchdywjsd3.spock.replit.dev/images/blooks/Gaunt.webp",
        cost: 12000,
        rarity: "Mystical",
    },
    {
        name: "Allonme",
        url: "https://c1bc10b3-5b75-4650-b220-d4b321e8b25c-00-3prrchdywjsd3.spock.replit.dev/images/blooks/Allonme.webp",
        cost: 10000,
        rarity: "Chroma",
    },
    {
        name: "Prq",
        url: "https://c1bc10b3-5b75-4650-b220-d4b321e8b25c-00-3prrchdywjsd3.spock.replit.dev/images/blooks/Prq.webp",
        cost: 5000,
        rarity: "Chroma",
    },
];

window.onload = function () {
    const shopItemsDiv = document.getElementById("shopItems");

    if (!shopItems || !Array.isArray(shopItems)) {
        console.error("shopItems is not defined or not an array");
        return;
    }

    shopItems.forEach((item) => {
        const itemDiv = document.createElement("div");
        itemDiv.innerHTML = `
            <h3>${item.name}</h3>
            <img src="${item.url}" alt="${item.name}" width="100">
            <p>Cost: ${item.cost} tokens</p>
            <p>Rarity: ${item.rarity}</p>
            <button onclick="window.buyItem('${item.name}', ${item.cost}, '${item.url}', '${item.rarity}')">Buy</button>
        `;
        shopItemsDiv.appendChild(itemDiv);
    });

    document.getElementById("getRandomItem").addEventListener("click", async () => {
        const result = await getRandomItem();
        if (result && result.success) {
            alert(`Random Item: ${result.item.name}`);
        }
    });
};

window.buyItem = async function (name, cost, url, rarity) {
    const username = getCookie("username");

    if (!username) {
        alert("Username not found in cookies!");
        return;
    }

    const userRef = doc(firestore, "users", username);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.tokens >= cost) {
            const newTokens = userData.tokens - cost;

            let newSkins = Array.isArray(userData.unlockedSkins)
                ? userData.unlockedSkins
                : [];

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

async function getRandomItem() {
    const username = getCookie("username");

    if (!username) {
        alert("Username not found in cookies!");
        return;
    }

    const userRef = doc(firestore, "users", username);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.tokens >= 20) {
            const newTokens = userData.tokens - 20;

            const randomIndex = Math.floor(
                Math.random() * shopItems.length,
            );
            const randomItem = shopItems[randomIndex];

            let newSkins = Array.isArray(userData.unlockedSkins)
                ? userData.unlockedSkins
                : [];

            const existingItemIndex = newSkins.findIndex(
                (item) => item.name === randomItem.name,
            );

            if (existingItemIndex !== -1) {
                newSkins[existingItemIndex].count =
                    (newSkins[existingItemIndex].count || 1) + 1;
            } else {
                newSkins.push({
                    name: randomItem.name,
                    url: randomItem.url,
                    count: 1,
                    rarity: randomItem.rarity
                });
            }

            await updateDoc(userRef, {
                tokens: newTokens,
                unlockedSkins: newSkins,
            });

            document.getElementById("tokenCount").innerText =
                `Tokens: ${newTokens}`;

            return { item: randomItem, success: true };
        } else {
            alert("Not enough tokens to get a random item!");
            return { success: false };
        }
    } else {
        alert("User not found!");
        return { success: false };
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}