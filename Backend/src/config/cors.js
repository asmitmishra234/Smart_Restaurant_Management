const PRODUCTION_FRONTEND_ORIGIN =
    "https://smart-restaurant-management-1.onrender.com";
const LOCAL_FRONTEND_ORIGIN = "http://localhost:5173";

const normalizeOrigin = (origin) => {
    if (typeof origin !== "string" || !origin.trim()) {
        return null;
    }

    try {
        return new URL(origin.trim()).origin;
    } catch {
        return null;
    }
};

const getAllowedOrigins = () =>
    new Set(
        [
            PRODUCTION_FRONTEND_ORIGIN,
            process.env.FRONTEND_URL,
            process.env.LOCAL_FRONTEND_URL || LOCAL_FRONTEND_ORIGIN
        ]
            .map(normalizeOrigin)
            .filter(Boolean)
    );

const corsOptions = {
    origin(origin, callback) {
        const requestOrigin = normalizeOrigin(origin);

        if (!origin || (requestOrigin && getAllowedOrigins().has(requestOrigin))) {
            return callback(null, true);
        }

        return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-session-token"],
    optionsSuccessStatus: 204
};

export function getFrontendOrigin() {
    const frontendOrigin = process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : process.env.LOCAL_FRONTEND_URL || LOCAL_FRONTEND_ORIGIN;

    if (!frontendOrigin) {
        throw new Error("FRONTEND_URL must be set in production");
    }

    const normalizedOrigin = normalizeOrigin(frontendOrigin);
    if (!normalizedOrigin) {
        throw new Error("FRONTEND_URL must be a valid origin");
    }

    return normalizedOrigin;
}

export default corsOptions;
