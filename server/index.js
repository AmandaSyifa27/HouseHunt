require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(
 cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
 }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/properties", require("./routes/properties"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/favorites", require("./routes/favorites"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/landlord", require("./routes/landlord"));

app.get("/", (req, res) => res.json({ message: "HouseHunt API is running" }));

// Global error handler
app.use((err, req, res, next) => {
 // express.json() throws SyntaxError / TypeError when body is not valid JSON
 if (err instanceof SyntaxError || err?.type === "entity.parse.failed") {
  return res.status(400).json({ message: "Invalid JSON in request body" });
 }

 console.error("[GlobalError] typeof err:", typeof err);
 console.error("[GlobalError] message:", err?.message);
 console.error("[GlobalError] status:", err?.status);
 console.error("[GlobalError] err object:", err);
 if (err?.stack) console.error("[GlobalError] stack:\n", err.stack);

 res
  .status(err?.status || 500)
  .json({ message: err?.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
