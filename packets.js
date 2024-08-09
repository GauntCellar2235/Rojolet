const net = require("net");

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        console.log(`Received packet: ${data.toString()}`);
    });

    socket.on("end", () => {
        console.log("Connection ended");
    });

    socket.on("error", (err) => {
        console.error(`Error: ${err.message}`);
    });
});

const port = 3000; // Change this to your preferred port
server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
