import mongoose from "mongoose"

const MONGODB_URI = process.env.NEXT_MONGODB_URI || "mongodb://localhost:27017/time-logger"

// Connection cache
let cachedConnection: typeof mongoose | null = null

export async function connectToDatabase() {
  // If connection exists, use it
  if (cachedConnection) {
    return cachedConnection
  }

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable")
  }

  // Connect to MongoDB
  try {
    // Set strictQuery to false to prepare for Mongoose 7
    mongoose.set("strictQuery", false)

    const options = {
      bufferCommands: false,
    }

    const connection = await mongoose.connect(MONGODB_URI, options)
    cachedConnection = connection

    return connection
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw new Error("Failed to connect to database")
  }
}

