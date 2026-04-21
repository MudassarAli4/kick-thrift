import app from './app.js'
import { loadEnv } from './config/env.js'
import { connectDb } from './config/db.js'

const { PORT } = loadEnv()

async function startServer() {
  await connectDb()

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})

