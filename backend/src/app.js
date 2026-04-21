import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'

import { connectDb } from './config/db.js'
import { loadEnv } from './config/env.js'
import indexRouter from './routes/index.js'
import adminRouter from './routes/admin.js'
import cookieParser from 'cookie-parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// env - wrap in try-catch to handle errors gracefully
let CLIENT_ORIGIN, NODE_ENV
try {
  const env = loadEnv()
  CLIENT_ORIGIN = env.CLIENT_ORIGIN
  NODE_ENV = env.NODE_ENV
} catch (err) {
  console.error('Error loading environment:', err)
  CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*'
  NODE_ENV = process.env.NODE_ENV || 'production'
}

// view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

/* -----------------------------------------
   SET CSP HEADERS FIRST FOR ADMIN ROUTES
   Must be before CORS and everything else
   Using writeHead to ensure headers are set
------------------------------------------ */
app.use((req, res, next) => {
  if (req.path.startsWith('/admin')) {
    // Most permissive CSP to allow everything
    const permissiveCSP = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob: https: http:; font-src * data: blob: https: http: 'unsafe-inline'; style-src * 'unsafe-inline' data: https: http:; script-src * 'unsafe-inline' 'unsafe-eval' https: http:; img-src * data: blob: https: http:; connect-src * https: http:; frame-src * https: http:; object-src 'none'; base-uri *; form-action *;"
    
    // Remove any existing CSP headers first (if possible)
    try {
      res.removeHeader("Content-Security-Policy")
      res.removeHeader("X-Content-Security-Policy")
      res.removeHeader("X-WebKit-CSP")
    } catch (e) {
      // Ignore if headers don't exist
    }
    
    // Set the permissive CSP - use multiple methods to ensure it's set
    res.setHeader("Content-Security-Policy", permissiveCSP)
    res.set("Content-Security-Policy", permissiveCSP)
  }
  next()
})

/* -----------------------------------------
   CORS CONFIGURATION
   Allow all origins - especially for admin routes
   Manual CORS headers for better control
------------------------------------------ */
const allowedOrigins = CLIENT_ORIGIN === '*'
  ? ['*']
  : CLIENT_ORIGIN.split(',').map(origin => origin.trim())

// Apply CORS - allow all origins for simplicity
// Admin routes need to work from same origin (form submissions)
app.use((req, res, next) => {
  // Set CORS headers manually for better control
  const origin = req.headers.origin
  
  // Always allow requests (especially for admin routes and same-origin)
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin)
  } else {
    res.header('Access-Control-Allow-Origin', '*')
  }
  
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-session-id, X-Session-Id, Cookie')
  res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range, Set-Cookie')
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  
  next()
})

/* -----------------------------------------
   SKIP HELMET COMPLETELY FOR ADMIN ROUTES
   Vercel might be adding restrictive CSP, so we skip helmet entirely
------------------------------------------ */
app.use((req, res, next) => {
  if (req.path.startsWith('/admin')) {
    // Skip helmet completely for admin routes
    return next()
  }
  // For non-admin routes, use helmet with CSP
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https:"],
      },
    },
  })(req, res, next)
})

/* -----------------------------------------
   SET PERMISSIVE CSP FOR ADMIN ROUTES
   This runs after helmet to ensure it's not overridden
------------------------------------------ */
app.use((req, res, next) => {
  if (req.path.startsWith('/admin')) {
    // Override any CSP headers with permissive policy for admin
    const permissiveCSP = [
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: *",
      "font-src * data: blob: https: 'unsafe-inline'",
      "style-src * 'unsafe-inline' data: https:",
      "script-src * 'unsafe-inline' 'unsafe-eval' https:",
      "img-src * data: blob: https:",
      "connect-src * https:",
      "frame-src * https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join("; ")
    
    // Use res.set() which is more reliable than setHeader
    res.set({
      "Content-Security-Policy": permissiveCSP,
      "X-Content-Security-Policy": "" // Clear any X-CSP header
    })
  }
  next()
})


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api', (req, res, next) => {
  const start = Date.now()
  const bodyKeys = req.body && typeof req.body === 'object' ? Object.keys(req.body) : []
  const bodySuffix = bodyKeys.length > 0 ? ` | body keys: ${bodyKeys.join(', ')}` : ''

  console.log(`[API] ${req.method} ${req.originalUrl}${bodySuffix}`)

  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`)
  })

  next()
})

/* -----------------------------------------
   FINAL CSP OVERRIDE FOR ADMIN ROUTES
   Ensures CSP is set right before response is sent
------------------------------------------ */
app.use((req, res, next) => {
  if (req.path.startsWith('/admin')) {
    // Intercept both end and send functions to set headers right before sending
    const originalEnd = res.end.bind(res)
    const originalSend = res.send.bind(res)
    const originalRender = res.render.bind(res)
    
    const setCSPHeaders = () => {
      // Most permissive CSP - same as initial middleware
      const permissiveCSP = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob: https: http:; font-src * data: blob: https: http: 'unsafe-inline'; style-src * 'unsafe-inline' data: https: http:; script-src * 'unsafe-inline' 'unsafe-eval' https: http:; img-src * data: blob: https: http:; connect-src * https: http:; frame-src * https: http:; object-src 'none'; base-uri *; form-action *;"
      
      try {
        res.setHeader("Content-Security-Policy", permissiveCSP)
        res.set("Content-Security-Policy", permissiveCSP)
      } catch (e) {
        console.error('Error setting CSP headers:', e)
      }
    }
    
    res.end = function(...args) {
      setCSPHeaders()
      return originalEnd(...args)
    }
    
    res.send = function(...args) {
      setCSPHeaders()
      return originalSend(...args)
    }
    
    res.render = function(...args) {
      setCSPHeaders()
      return originalRender(...args)
    }
  }
  next()
})

if (NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

/* -----------------------------------------
   DB CONNECTION CHECK (UPDATED)
------------------------------------------ */
app.use(async (req, res, next) => {
  const path = req.path || req.url.split('?')[0]
  const method = req.method

  // ** NEW FIX **: Also skip for OPTIONS preflight requests
  if (method === 'OPTIONS') {
    return next()
  }

  const isAdminLoginRoute =
    (path === '/admin' || path === '/admin/') ||
    (method === 'POST' && (path === '/admin/login' || path.includes('/login'))) ||
    (method === 'POST' && (path === '/admin/logout' || path.includes('/logout')))

  if (isAdminLoginRoute) return next()

  try {
    await connectDb()
    next()
  } catch (err) {
    console.error('Database connection error:', err)

    if (path.startsWith('/api') || path.startsWith('/products') || path.startsWith('/deliveries')) {
      return res.status(503).json({
        success: false,
        message: 'Database connection failed. Please try again.'
      })
    }
    next()
  }
})

/* -----------------------------------------
                 ROUTES
------------------------------------------ */
app.use('/', indexRouter)
app.use('/admin', adminRouter)

/* -----------------------------------------
   GLOBAL ERROR HANDLER
------------------------------------------ */
app.use((err, req, res, next) => {
  console.error('Global error handler:', err)
  console.error('Error stack:', err.stack)
  
  // If it's an admin route, render error page
  if (req.path.startsWith('/admin')) {
    return res.status(err.status || 500).render('admin-login', {
      error: err.message || 'An error occurred. Please try again.'
    })
  }
  
  // For API routes, send JSON error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
})

/* -----------------------------------------
                 404
------------------------------------------ */
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not Found' })
})

export default app
