import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/authroutes.js";
import taskRoutes from "./routes/taskroutes.js";
import adminRoutes from "./routes/adminroutes.js";
const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
