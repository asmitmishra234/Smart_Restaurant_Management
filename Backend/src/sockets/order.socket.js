
import jwt from "jsonwebtoken";
import cookie from "cookie";

import TableSession from "../models/tableSession.model.js";
import User from "../models/user.model.js";

const registerOrderSocket = (io) => {

    // Authenticate staff using HTTP-only cookie
    io.use(async (socket, next) => {
        try {
            const cookies = cookie.parse(
                socket.handshake.headers.cookie || ""
            );

            const token = cookies.token;

            if (!token) {
                return next();
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            const user = await User.findById(decoded.id);

            if (
                user &&
                user.isActive &&
                ["ADMIN", "KITCHEN", "WAITER"].includes(user.role)
            ) {
                socket.user = user;
            }

            next();
        } catch (error) {
            next();
        }
    });

    io.on("connection", (socket) => {

        // CUSTOMER TABLE SESSION
        socket.on("join-table-session", async (sessionToken) => {
            try {
                if (
                    typeof sessionToken !== "string" ||
                    sessionToken.length !== 64
                ) {
                    socket.emit("socket-error", {
                        message: "Invalid table session token"
                    });
                    return;
                }

                const session = await TableSession.findOne({
                    sessionToken,
                    status: "ACTIVE"
                });

                if (!session) {
                    socket.emit("socket-error", {
                        message: "Invalid or expired table session"
                    });
                    return;
                }

                socket.join(`table-session-${session._id}`);

                socket.emit("joined-table-session", {
                    success: true,
                    message: "Connected to live order tracking"
                });

            } catch (error) {
                socket.emit("socket-error", {
                    message: "Unable to join table session"
                });
            }
        });

        // STAFF ROOM
        socket.on("join-staff-room", () => {
            if (
                !socket.user ||
                !["ADMIN", "WAITER"].includes(socket.user.role)
            ) {
                socket.emit("socket-error", {
                    message: "Unauthorized staff access"
                });
                return;
            }

            socket.join("staff-room");

            socket.emit("joined-staff-room", {
                success: true,
                role: socket.user.role,
                message: "Staff notifications connected"
            });
        });

        // ADMIN ROOM
        socket.on("join-admin-room", () => {
            if (!socket.user || socket.user.role !== "ADMIN") {
                socket.emit("socket-error", {
                    message: "Unauthorized admin access"
                });
                return;
            }

            socket.join("admin-room");

            socket.emit("joined-admin-room", {
                success: true,
                role: socket.user.role,
                message: "Admin notifications connected"
            });
        });

        // KITCHEN ROOM
        socket.on("join-kitchen-room", () => {
            if (!socket.user || socket.user.role !== "KITCHEN") {
                socket.emit("socket-error", {
                    message: "Unauthorized kitchen access"
                });
                return;
            }

            socket.join("kitchen-room");

            socket.emit("joined-kitchen-room", {
                success: true,
                role: socket.user.role,
                message: "Kitchen order updates connected"
            });
        });

    });
};

export default registerOrderSocket;
