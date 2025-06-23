require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employee");
const leaveRoutes = require("./routes/leave");
const reportRoutes = require("./routes/report");

app.use(cors());
app.use(express.json());

app.use("/api/employee", employeeRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;
