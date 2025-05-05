import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", authRoutes);

app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Server running on port 3001");
});
