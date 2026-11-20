const LOCAL_FRONTEND_ORIGIN =
    process.env.LOCAL_FRONTEND_URL || "http://localhost:5173";

const normalizeOrigin = (origin) => origin.replace(/\/+$/, "");

const isAllowedOrigin = (origin) => {
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.LOCAL_FRONTEND_URL || LOCAL_FRONTEND_ORIGIN
    ]
        .filter(Boolean)
        .map(normalizeOrigin);

    return allowedOrigins.includes(normalizeOrigin(origin));
};

const corsOptions = {
    origin(origin, callback) {
        if (!origin || isAllowedOrigin(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-session-token"]
};

export function getFrontendOrigin() {
    const frontendOrigin = process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : process.env.LOCAL_FRONTEND_URL || LOCAL_FRONTEND_ORIGIN;

    if (!frontendOrigin) {
        throw new Error("FRONTEND_URL must be set in production");
    }

    return normalizeOrigin(frontendOrigin);
}

export default corsOptions;
