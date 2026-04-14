import "dotenv/config";
import dns from "dns";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";

if (process.env.npm_lifecycle_event === "start" && !process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

const port = Number.parseInt(process.env.PORT || "5000", 10);
const mongoUri = process.env.MONGODB_URI;
const dnsServers = (process.env.MONGODB_DNS_SERVERS || "1.1.1.1,8.8.8.8")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

dns.setServers(dnsServers);

function startServer() {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Internship portal API running on port ${port}`);
  });
}

async function bootstrap() {
  await connectDatabase(mongoUri);
  console.log("MongoDB connected successfully.");
  startServer();
}

bootstrap().catch((error) => {
  console.error("Failed to start the server:", error);
  process.exit(1);
});
