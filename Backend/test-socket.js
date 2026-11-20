
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const SESSION_TOKEN = "22efbcee78633767e9207b03ad8aad50a11e8a57906542372c9fc39c2ae82cb6";

socket.on("connect", () => {
    console.log("Connected to server:", socket.id);

    socket.emit("join-table-session", SESSION_TOKEN);
});

socket.on("joined-table-session", (data) => {
    console.log("Room joined:", data);
});

socket.on("order-status-updated", (data) => {
    console.log("Live Order Update:", data);
});

socket.on("socket-error", (error) => {
    console.log("Socket Error:", error.message);
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});
