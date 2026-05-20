// Import the core express module to build our web server
import express from "express";
// Import cors to enable Cross-Origin Resource Sharing (allowing requests from frontends)
import cors from "cors";
// Import helmet to add various HTTP headers for enhanced security
import helmet from "helmet";

// Import route
import orchestratorRoutes from "./routes/orchestrator.routes.js";
import supportRoutes from "./routes/support.routes.js";
import providerRoutes from "./providers/provider.routes.js";
import providerDetailRoutes from "./providerDetails/providerDetail.routes.js";
import bookingRoutes from "./booking/booking.routes.js";
import followupRoutes from "./followup/followup.routes.js";
import traceRoutes from "./trace/trace.routes.js";
import disputeRoutes from "./dispute/dispute.routes.js";
import comparisonRoutes from "./comparison/comparison.routes.js";

// Initialize the Express application instance
const app = express();

// --- Middleware Configuration ---

// Use Helmet middleware to secure the app by setting various HTTP headers
app.use(helmet());
// Use CORS middleware to allow external domains to make requests to our API
app.use(cors());
// Use express.json() middleware to parse incoming JSON payloads in request bodies
app.use(express.json());

// ye middlewere form me jo data ara huga frontend se us k liye 
app.use(express.urlencoded({ extended: true }));

// --- Routes Configuration ---

// Define a simple GET endpoint at '/health' for monitoring the server's status
app.get("/health", (req, res) => {
    // Respond with a JSON object confirming the server is operational
    res.json({
        status: "OK",
        service: "AI Service Orchestrator"
    });
});

// Base route
app.use("/api/orchestrator", orchestratorRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/provider-details", providerDetailRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/followup", followupRoutes);
app.use("/api/trace", traceRoutes);
app.use("/api/dispute", disputeRoutes);
app.use("/api/comparison", comparisonRoutes);

// Export the configured Express app so it can be imported and started in server.ts
export default app;