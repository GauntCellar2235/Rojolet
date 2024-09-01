   const firebaseConfig = {
    apiKey: "AIzaSyCOIKlP9YhtX9xa5aoggmsrWwavlW-XuzI",
    authDomain: "cosmik-7c124.firebaseapp.com",
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

function connectDiscord() {
    const clientId = "1269476799277043812";
    const redirectUri = encodeURIComponent(window.location.href);
    const scope = "identify";
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=1269476799277043812&response_type=code&redirect_uri=https%3A%2F%2Fc1bc10b3-5b75-4650-b220-d4b321e8b25c-00-3prrchdywjsd3.spock.repl.co%3A8000%2Fsettings.html&scope=identify`;
    window.location.href = discordAuthUrl;
}

window.onload = function () {
    const urlParams = new URLSearchParams(
        window.location.hash.substring(1),
    );
    const accessToken = urlParams.get("access_token");
    if (accessToken) {
        fetch("https://discord.com/api/users/@me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
            .then((response) => response.json())
            .then((user) => {
                const username = getCookie("username"); 
                if (username) {
                    db.collection("users")
                        .doc(username)
                        .set(
                            {
                                discordUsername:
                                    user.username +
                                    "#" +
                                    user.discriminator,
                            },
                            { merge: true },
                        )
                        .then(() => {
                            alert(
                                "Discord account connected successfully!",
                            );
                        })
                        .catch((error) => {
                            console.error(
                                "Error saving to Firestore: ",
                                error,
                            );
                        });
                } else {
                    alert("Username cookie not found!");
                }
            })
            .catch((error) => {
                console.error(
                    "Error fetching Discord user data: ",
                    error,
                );
            });
    }
};