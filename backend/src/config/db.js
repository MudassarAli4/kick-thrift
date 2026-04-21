import mongoose from 'mongoose'
import { loadEnv } from './env.js'

let isConnecting = false
let connectionPromise = null
let eventsRegistered = false

// Register connection events only once
function registerConnectionEvents() {
  if (eventsRegistered) return
  eventsRegistered = true
  
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err)
    isConnecting = false
    connectionPromise = null
  })
  
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Will reconnect on next request.')
    isConnecting = false
    connectionPromise = null
  })
  
  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected')
  })
}

export async function connectDb () {
  const { MONGODB_URI, DB_NAME } = loadEnv()
  console.log('Attempting to connect to MongoDB...')
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not set - skipping DB connection')
    return false
  }
  
  // If already connected, return true
  if (mongoose.connection.readyState === 1) {
    return true
  }
  
  // If already connecting, wait for that connection
  if (isConnecting && connectionPromise) {
    return connectionPromise
  }
  
  // Build connection string with database name
  let connectionString = MONGODB_URI.trim()
  if (!connectionString.endsWith('/')) {
    connectionString += '/'
  }
  connectionString += DB_NAME || 'shoes_db'
  
  isConnecting = true
  connectionPromise = (async () => {
    try {
      // Close existing connection if in disconnected state
      console.log("connecting to mongoDb with connection string:", connectionString.replace(/:[^:@]+@/, ':****@'))
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(connectionString, {
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          maxPoolSize: 10,
          minPoolSize: 1,
        })
      } else if (mongoose.connection.readyState === 2) {
        // Connecting state - wait a bit
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(connectionString, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 1,
          })
        }
      } else if (mongoose.connection.readyState === 3) {
        // Disconnecting - reconnect
        await mongoose.connect(connectionString, {
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
          maxPoolSize: 10,
          minPoolSize: 1,
        })
      }
      
      console.log(`MongoDB connected to database: ${DB_NAME || 'shoes_db'}`)
      
      // Register connection events (only once)
      registerConnectionEvents()
      
      isConnecting = false
      return true
    } catch (err) {
      console.error('MongoDB connection error:', err.message)
      console.error('Connection string used:', connectionString.replace(/:[^:@]+@/, ':****@')) // Hide password
      isConnecting = false
      connectionPromise = null
      return false
    }
  })()
  
  return connectionPromise
}

// Ensure connection function - use this in middleware
export async function ensureDbConnection() {
  if (mongoose.connection.readyState === 1) {
    return true
  }
  return await connectDb()
}

