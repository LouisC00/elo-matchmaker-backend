import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import matchmakingRoutes from "./routes/matchmakingRoutes";
import playerRoutes from "./routes/playerRoutes";
import leaderboardRoutes from "./routes/leaderboardRoutes";
import matchResultRoutes from "./routes/matchResultRoutes";
import meRoutes from "./routes/meRoutes";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", matchmakingRoutes);
app.use("/api", playerRoutes);
app.use("/api", leaderboardRoutes);
app.use("/api", matchResultRoutes);
app.use("/api", meRoutes);

app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Server running on port 3001");
});
