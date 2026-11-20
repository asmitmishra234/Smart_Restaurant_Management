
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";

import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import corsOptions from "./src/config/cors.js";
import registerOrderSocket from "./src/sockets/order.socket.js";

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: corsOptions
});

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});

app.set("io", io);

registerOrderSocket(io);

const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 3000;

        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log("Socket.IO is ready");
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
