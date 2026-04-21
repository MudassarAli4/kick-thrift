import { v2 as cloudinary } from 'cloudinary'
import { loadEnv } from './env.js'

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = loadEnv()

if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  })
  console.log('Cloudinary configured')
} else {
  console.warn('Cloudinary credentials not set - image uploads will fail')
}

export default cloudinary

