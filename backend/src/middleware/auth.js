import crypto from 'crypto'
import { loadEnv } from '../config/env.js'

// Load env with error handling
let ADMIN_USER, ADMIN_PASS, ADMIN_SECRET
try {
  const env = loadEnv()
  ADMIN_USER = env.ADMIN_USER
  ADMIN_PASS = env.ADMIN_PASS
  ADMIN_SECRET = env.ADMIN_SECRET
} catch (err) {
  console.error('Error loading admin env:', err)
  ADMIN_USER = process.env.ADMIN_USER || 'admin'
  ADMIN_PASS = process.env.ADMIN_PASS || 'admin'
  ADMIN_SECRET = process.env.ADMIN_SECRET || 'replace_with_long_random_secret'
}

function sign(value) {
  return crypto.createHmac('sha256', ADMIN_SECRET).update(value).digest('hex')
}

export function createAdminToken(username) {
  const payload = `${username}`
  const signature = sign(payload)
  return `${payload}.${signature}`
}

export function verifyAdminToken(token) {
  if (!token) return false
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false
  return sign(payload) === signature && payload === ADMIN_USER
}

export function requireAdmin(req, res, next) {
  const token = req.cookies.admin_token
  if (verifyAdminToken(token)) return next()
  return res.redirect('/admin')
}

export function authenticateAdmin(req, res, next) {
  try {
    console.log('=== ADMIN LOGIN ATTEMPT ===')
    console.log('Path:', req.path)
    console.log('Method:', req.method)
    console.log('Body exists:', !!req.body)
    console.log('Username provided:', !!req.body?.username)
    console.log('Password provided:', !!req.body?.password)
    console.log('ADMIN_USER:', ADMIN_USER ? 'SET' : 'MISSING')
    console.log('ADMIN_PASS:', ADMIN_PASS ? 'SET' : 'MISSING')
    console.log('ADMIN_SECRET:', ADMIN_SECRET ? 'SET' : 'MISSING')
    
    // Check if environment variables are set
    if (!ADMIN_USER || !ADMIN_PASS || !ADMIN_SECRET) {
      console.error('❌ Admin credentials not configured properly')
      console.error('ADMIN_USER:', ADMIN_USER || 'MISSING')
      console.error('ADMIN_PASS:', ADMIN_PASS ? 'SET' : 'MISSING')
      console.error('ADMIN_SECRET:', ADMIN_SECRET ? 'SET' : 'MISSING')
      return res.status(500).render('admin-login', { 
        error: 'Server configuration error. Please check environment variables.' 
      })
    }

    const { username, password } = req.body || {}
    
    if (!username || !password) {
      console.log('⚠️ Missing username or password')
      return res.status(400).render('admin-login', { 
        error: 'Username and password are required' 
      })
    }

    console.log('✅ Comparing credentials...')
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      console.log('✅ Credentials match, creating token...')
      try {
        const token = createAdminToken(username)
        console.log('✅ Token created successfully')
        
        const cookieOptions = {
          httpOnly: true, 
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
        
        res.cookie('admin_token', token, cookieOptions)
        console.log('✅ Cookie set, redirecting to dashboard...')
        return res.redirect('/admin/dashboard')
      } catch (tokenError) {
        console.error('❌ Token creation error:', tokenError)
        console.error('Token error stack:', tokenError.stack)
        return res.status(500).render('admin-login', { 
          error: `Failed to create session: ${tokenError.message}` 
        })
      }
    }
    
    console.log('❌ Invalid credentials provided')
    return res.status(401).render('admin-login', { error: 'Invalid credentials' })
  } catch (err) {
    console.error('❌ Admin authentication error:', err)
    console.error('Error name:', err.name)
    console.error('Error message:', err.message)
    console.error('Error stack:', err.stack)
    return res.status(500).render('admin-login', { 
      error: `An error occurred: ${err.message || 'Please try again.'}` 
    })
  }
}

export function logoutAdmin(req, res) {
  res.clearCookie('admin_token')
  return res.redirect('/admin')
}

