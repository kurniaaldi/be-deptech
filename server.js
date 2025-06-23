const app = require("./app");
const PORT = process.env.PORT || 5000;
const http = require("http");

const server = http.createServer(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: Closing HTTP server.");
  server.close(() => {
    console.log("HTTP server closed.");
    // Close database connections, flush logs, etc.
    // For example:
    // mongoose.connection.close(() => {
    //   console.log('Database connection closed.');
    //   process.exit(0);
    // });
    process.exit(0); // Exit after server close if no other resources
  });
});
