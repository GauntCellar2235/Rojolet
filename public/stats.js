import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    Timestamp,
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

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function canClaimTokens(lastClaimed) {
    const now = new Date();
    let lastClaimedDate;
    if (lastClaimed instanceof Timestamp) {
        lastClaimedDate = lastClaimed.toDate();
    } else {
        lastClaimedDate = new Date(0);
    }
    const hoursDiff = Math.abs(now - lastClaimedDate) / 36e5;
    return hoursDiff >= 8;
}

async function claimTokens() {
    const uid = getCookie("uid");

    if (!uid) {
        alert("User not logged in!");
        return;
    }

    const userRef = doc(firestore, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        const lastClaimed = userData.lastClaimed || new Date(0);

        if (canClaimTokens(lastClaimed)) {
            const newTokens = (userData.tokens || 0) + 1000;

            await updateDoc(userRef, {
                tokens: newTokens,
                lastClaimed: serverTimestamp(),
            });

            document.getElementById("tokens").innerText = newTokens;
            Swal.fire("Success", "You've received 1000 tokens!", "success");
        } else {
            Swal.fire("Wait", "You can claim tokens again in 8 hours.", "info");
        }
    } else {
        alert("User not found!");
    }
}

function displayBadges(badges) {
    const badgesContainer = document.getElementById("badges-container");
    if (!badgesContainer) {
        console.error("Element with ID 'badges-container' not found.");
        return;
    }

    badgesContainer.innerHTML = "";

    if (badges && badges.length > 0) {
        badges.forEach((badge) => {
            const badgeElement = document.createElement("img");
            badgeElement.src = badge.iconUrl || "https://via.placeholder.com/40";
            badgeElement.alt = badge.name || "Unnamed badge";
            badgeElement.title = badge.name || "Unnamed badge";
            badgeElement.className = "badge";

            badgeElement.onerror = function() {
                console.error(`Failed to load badge image: ${badge.iconUrl}`);
                badgeElement.src = "https://via.placeholder.com/40";
            };

            badgesContainer.appendChild(badgeElement);
        });
    } else {
        badgesContainer.innerText = "No badges earned.";
    }
}

async function showUserStats(username) {
    const userRef = doc(firestore, "users", username); 
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        document.getElementById("modal-content").innerHTML = `
            <h3>Username: ${userData.username || "Unknown"}</h3>
            <p><strong>Tokens:</strong> ${userData.tokens || 0}</p>
            <p><strong>Blooks Unlocked:</strong> ${userData.blooksUnlocked || 0}</p>
            <p><strong>Packs Opened:</strong> ${userData.packsOpened || 0}</p>
            <p><strong>Messages Sent:</strong> ${userData.messagesSent || 0}</p>
        `;
        document.getElementById("stats-modal").style.display = "flex";
    } else {
        Swal.fire("Error", "User not found!", "error");
    }
}

function closeModal() {
    document.getElementById("stats-modal").style.display = "none";
    document.getElementById("cosmetics-modal").style.display = "none";
}

async function displayCosmetics() {
    const uid = getCookie("uid");

    if (!uid) {
        alert("User not logged in!");
        return;
    }

    const userRef = doc(firestore, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        const cosmetics = userData.Cosmetics || [];

        const cosmeticsContainer = document.getElementById("cosmetics-container");
        if (!cosmeticsContainer) {
            console.error("Element with ID 'cosmetics-container' not found.");
            return;
        }

        const cosmeticsCount = document.getElementById("cosmetics-count");
        if (!cosmeticsCount) {
            console.error("Element with ID 'cosmetics-count' not found.");
            return;
        }

        cosmeticsContainer.innerHTML = "";
        cosmeticsCount.innerText = ` ${cosmetics.length}`;

        if (cosmetics.length > 0) {
            cosmetics.forEach((cosmetic) => {
                const cosmeticElement = document.createElement("img");
                cosmeticElement.src = cosmetic.iconUrl || "https://via.placeholder.com/40";
                cosmeticElement.alt = cosmetic.name || "Unnamed cosmetic";
                cosmeticElement.title = cosmetic.name || "Unnamed cosmetic";
                cosmeticElement.className = "cosmetic";

                cosmeticElement.addEventListener("click", async () => {
                    await updateDoc(userRef, {
                        profilePicture: cosmetic.iconUrl
                    });
                    document.getElementById("profile-picture").src = cosmetic.iconUrl;
                    closeModal();
                    Swal.fire("Success", "Profile picture updated!", "success");
                });

                cosmeticsContainer.appendChild(cosmeticElement);
            });
        } else {
            cosmeticsContainer.innerText = "No cosmetics found.";
        }

        document.getElementById("cosmetics-modal").style.display = "flex";
    } else {
        alert("User not found!");
    }
}

window.addEventListener("load", async () => {
    const uid = getCookie("uid");

    if (!uid) {
        alert("User not logged in!");
        return;
    }

    const userRef = doc(firestore, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();

        const profilePicture = document.getElementById("profile-picture");
        const username = document.getElementById("username");
        const tokensElement = document.getElementById("tokens");
        const rolesElement = document.getElementById("roles");
        const badgesContainer = document.getElementById("badges");
        const cosmeticsCountElement = document.getElementById("cosmetics-count");
        const claimTokensButton = document.getElementById("claim-tokens-button");
        const statsButton = document.getElementById("stats");

        if (profilePicture) {
            profilePicture.src = userData.profilePicture || "https://via.placeholder.com/40";
        }
        
        if (username) {
            username.innerText = userData.username || "Username";
            if (userData.nameColor) {
                username.style.color = userData.nameColor;
            }
        }

        if (tokensElement) {
            tokensElement.innerText = userData.tokens || 0;
        }

        if (rolesElement) {
            rolesElement.innerText = userData.roles || "No role assigned";
        }

        if (badgesContainer) {
            badgesContainer.innerHTML = "";
            displayBadges(userData.badges);
        }

        if (cosmeticsCountElement) {
            const cosmetics = userData.Cosmetics || [];
            cosmeticsCountElement.innerText = `Cosmetics Unlocked: ${cosmetics.length}`;
        }

        if (claimTokensButton) {
            claimTokensButton.addEventListener("click", claimTokens);
        } else {
            console.error("Element with ID 'claim-tokens-button' not found.");
        }

        if (statsButton) {
            statsButton.addEventListener("click", () => {
                Swal.fire({
                    title: 'Enter Username',
                    input: 'text',
                    inputLabel: 'Username',
                    inputPlaceholder: 'Enter the username',
                    showCancelButton: true,
                    confirmButtonText: 'View Stats',
                    cancelButtonText: 'Cancel',
                }).then((result) => {
                    if (result.isConfirmed) {
                        showUserStats(result.value);
                    }
                });
            });
        } else {
            console.error("Element with ID 'stats' not found.");
        }

        const role = userData.roles || "User";
        const allowedRoles = ["Helper", "Mod", "Admin", "Owner"];
        if (allowedRoles.includes(role)) {
            const sidebar = document.querySelector(".Sidebar");
            if (sidebar) {
                const panelItem = document.createElement("a");
                panelItem.innerHTML = `<a href="Panel.html">🔧 Panel</a>`;
                sidebar.appendChild(panelItem);
            }
        }

        if (profilePicture) {
            profilePicture.addEventListener("click", displayCosmetics);
        } else {
            console.error("Element with ID 'profile-picture' not found.");
        }

    } else {
        alert("User not found!");
    }
});


