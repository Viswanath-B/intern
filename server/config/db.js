import mongoose from "mongoose";

export async function connectDatabase(connectionString) {
  if (!connectionString) {
    throw new Error("MONGODB_URI is required.");
  }

  mongoose.set("strictQuery", true);
  mongoose.set("bufferCommands", false);
  await mongoose.connect(connectionString, {
    serverSelectionTimeoutMS: 5000
  });

  return mongoose.connection;
}
