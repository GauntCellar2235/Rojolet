// Firebase configuration and initialization
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
const db = firebase.firestore();

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

const uid = getCookie("uid");

async function getUserTokens(uid) {
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        if (userDoc.exists) {
            return userDoc.data().tokens || 0; 
        } else {
            console.error("No such document!");
            return 0;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        return 0;
    }
}

function getRandomImage(imgSrcArray, probabilities) {
    const random = Math.random() * 100;
    let sum = 0;
    for (let i = 0; i < probabilities.length; i++) {
        sum += probabilities[i];
        if (random <= sum) {
            return imgSrcArray[i];
        }
    }
}

async function updateBlooksCollection(uid, treasure) {
    const userRef = db.collection("users").doc(uid);
    try {
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            let blooks = userDoc.data().blooks || {};

            if (blooks[treasure.name]) {
                blooks[treasure.name].quantity += 1;
            } else {
                blooks[treasure.name] = {
                    quantity: 1,
                    rarity: treasure.rarity,
                };
            }

            await userRef.update({ blooks });
        } else {
            console.error("User document not found.");
        }
    } catch (error) {
        console.error("Error updating blooks collection:", error);
    }
}

async function openChest(chestContainer, chestData) {
    const chest = chestContainer.querySelector(".chest");
    const imageContainer = chestContainer.querySelector(".image-container");
    const tokenCost = chestData.cost;

    const userTokens = await getUserTokens(uid);

    if (userTokens >= tokenCost) {
        if (!chest.classList.contains("open")) {
            try {
                await db
                    .collection("users")
                    .doc(uid)
                    .update({
                        tokens: firebase.firestore.FieldValue.increment(
                            -tokenCost,
                        ),
                    });

                chest.classList.add("open");

                setTimeout(async () => {
                    chest.classList.remove("open");
                    imageContainer.style.transform =
                        "translateX(-50%) scale(0)";

                    const chosenImages = chestData.imgSrc.map((srcArray, i) =>
                        getRandomImage(srcArray, chestData.probabilities[i]),
                    );

                    const treasures = chosenImages.map((src, index) => ({
                        name: chestData.alt[index],
                        rarity: chestData.rarities[index],
                    }));

                    for (const treasure of treasures) {
                        await updateBlooksCollection(uid, treasure);
                    }

                    Swal.fire({
                        title: `You got the following treasures!`,
                        html: chosenImages
                            .map(
                                (src, i) =>
                                    `<img src="${src}" alt="${chestData.alt[i]}" width="100">`,
                            )
                            .join(""),
                        confirmButtonText: "Close",
                    });
                }, 3000);
            } catch (error) {
                console.error("Error updating tokens:", error);
                Swal.fire({
                    title: "Error",
                    text: "Failed to open chest. Please try again later.",
                    icon: "error",
                    confirmButtonText: "Close",
                });
            }
        }
    } else {
        Swal.fire({
            title: "Not Enough Tokens",
            text: `You need ${tokenCost} tokens to open this chest.`,
            icon: "error",
            confirmButtonText: "Close",
        });
    }
}

const chestsData = [
    {
        id: 1,
        imgSrc: [
            [
                "/public/images/ChezyBRED.webp",
                "/public/images/ChestImage1_2.webp",
                "/public/images/ChestImage1_3.webp",
            ],
        ],
        alt: ["Treasure 1A", "Treasure 1B", "Treasure 1C"],
        cost: 10,
        probabilities: [[50, 30, 20]],
        rarities: ["common", "rare", "epic"], 
    },
];

const chestsContainer = document.getElementById("chests");

chestsData.forEach((chestData) => {
    const chestContainer = document.createElement("div");
    chestContainer.classList.add("chest-container");

    chestContainer.innerHTML = `
        <div class="chest-background"></div>
        <div class="chest">
            <div class="chest-lid"></div>
            <div class="chest-body"></div>
            <div class="image-container">
                <img src="${chestData.imgSrc[0][0]}" alt="${chestData.alt[0]}">
            </div>
        </div>
    `;

    chestContainer.addEventListener("click", () =>
        openChest(chestContainer, chestData),
    );
    chestsContainer.appendChild(chestContainer);
});
