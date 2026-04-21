import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function loadEnv () {
  if (!process.env.PORT) {
    // Try multiple env file locations
    const envPaths = [
      path.join(__dirname, '../../.env'),
      path.join(__dirname, '../../env'),
      path.join(__dirname, '../../.env.local'),
      path.join(__dirname, '../../env.local'),
      path.join(process.cwd(), '.env'),
      path.join(process.cwd(), 'env'),
      path.join(process.cwd(), '@server/.env'),
      path.join(process.cwd(), '@server/env')
    ]
    let loaded = false
    for (const envPath of envPaths) {
      const result = dotenv.config({ path: envPath })
      if (!result.error) {
        loaded = true
        if (process.env.NODE_ENV === 'development') {
          console.log(`Loaded env from: ${envPath}`)
        }
        break
      }
    }
    if (!loaded && process.env.NODE_ENV === 'development') {
      console.warn('No env file found - using defaults')
    }
  }
  const {
    PORT = 4000,
    NODE_ENV = 'development',
    MONGODB_URI,
    DB_NAME = 'shoes_db',
    CLIENT_ORIGIN = '*',
    ADMIN_USER = 'admin',
    ADMIN_PASS = 'admin',
    ADMIN_SECRET = 'replace_with_long_random_secret',
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    EMAIL_USER = 'officalreportsdep@gmail.com',
    EMAIL_PASS = 'faxj ghcq oujp aqad'
  } = process.env
  return { 
    PORT, NODE_ENV, MONGODB_URI, DB_NAME, CLIENT_ORIGIN, 
    ADMIN_USER, ADMIN_PASS, ADMIN_SECRET,
    CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
    EMAIL_USER, EMAIL_PASS
  }
}

