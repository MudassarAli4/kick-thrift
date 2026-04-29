import multer from 'multer'
import cloudinary from '../config/cloudinary.js'
import { Readable } from 'stream'

// Configure multer to store files in memory
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

export const uploadSingle = upload.single('image')
export const uploadProductImages = upload.fields([
  { name: 'images', maxCount: 8 },
  { name: 'image', maxCount: 1 }
])

export async function uploadToCloudinary(file) {
  if (!file || !file.buffer) {
    throw new Error('No file provided')
  }
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'shoes',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result.secure_url)
        }
      }
    )

    const stream = Readable.from(file.buffer)
    stream.pipe(uploadStream)
  })
}

export async function uploadFilesToCloudinary(files = []) {
  const validFiles = Array.isArray(files) ? files.filter(Boolean) : []
  if (validFiles.length === 0) {
    return []
  }

  return Promise.all(validFiles.map((file) => uploadToCloudinary(file)))
}

