
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import corsOptions from "./config/cors.js";

import authRoutes from "./routes/auth.routs.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import tableRoutes from "./routes/table.routes.js";
import tableSessionRoutes from "./routes/tableSession.routes.js";
import orderRoutes from "./routes/order.routes.js";
import waiterRequestRoutes from "./routes/waiterRequest.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import sessionManagementRoutes from "./routes/sessionManagement.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import reportRoutes from "./routes/report.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";

import errorMiddleware from "./middleware/error.middleware.js";
import notFound from "./middleware/notFound.middleware.js";

const app = express();

// Handle preflight before parsing requests or routing.
app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));

// Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/table-sessions", tableSessionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/waiter-requests", waiterRequestRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/session-management", sessionManagementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/feedback", feedbackRoutes); 

// Error Handling
app.use(notFound);
app.use(errorMiddleware);

export default app;
