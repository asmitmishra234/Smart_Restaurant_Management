
import { io } from "socket.io-client";

const TOKEN = "YOUR_ADMIN_JWT_TOKEN";

const socket = io("http://localhost:3000", {
    extraHeaders: {
        Cookie: `token=${TOKEN}`
    },
    transports: ["websocket"]
});

socket.on("connect", () => {
    console.log("Staff Connected:", socket.id);
    socket.emit("join-staff-room");
});

socket.on("joined-staff-room", (data) => {
    console.log("Staff Room Joined:", data);
    console.log("Waiting for waiter requests...");
});

socket.on("new-waiter-request", (data) => {
    console.log("NEW WAITER REQUEST:", data);
});

socket.on("socket-error", (error) => {
    console.log("Socket Error:", error.message);
});

socket.on("connect_error", (error) => {
    console.log("Connection Error:", error.message);
});

socket.on("disconnect", () => {
    console.log("Staff Disconnected");
});
