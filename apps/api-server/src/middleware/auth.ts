import { ApiClient } from '@auth0/auth0-api-js'
import type { Context, MiddlewareHandler, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

// Initialize Auth0 API client
const apiClient = new ApiClient({
  domain: process.env.AUTH0_DOMAIN!,
  audience: process.env.AUTH0_AUDIENCE!,
})

// Extended context type to include user info
export interface AuthContext {
  user: {
    sub: string
    email?: string
    scopes: string[]
    [key: string]: any
  }
}

/**
 * Extract bearer token from Authorization header
 */
function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null
  
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null
  }
  
  return parts[1]
}

/**
 * Extract scopes from JWT token payload
 */
function extractScopes(decodedToken: any): string[] {
  // Auth0 typically stores scopes in the 'scope' claim as a space-separated string
  if (decodedToken.scope && typeof decodedToken.scope === 'string') {
    return decodedToken.scope.split(' ').filter((scope: string) => scope.length > 0)
  }
  
  // Some configurations might use 'scopes' as an array
  if (Array.isArray(decodedToken.scopes)) {
    return decodedToken.scopes
  }
  
  return []
}

/**
 * Auth0 JWT verification middleware
 */
export function requireAuth(): MiddlewareHandler<{ Variables: AuthContext }> {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('Authorization')
      const accessToken = extractBearerToken(authHeader)
      
      if (!accessToken) {
        throw new HTTPException(401, { message: 'Missing or invalid authorization header' })
      }

      // Verify the access token using Auth0 SDK
      const decodedToken = await apiClient.verifyAccessToken({ 
        accessToken,
        // You can add required claims here if needed
        // requiredClaims: ['custom_claim']
      })

      // Extract user information and scopes
      const user = {
        sub: decodedToken.sub,
        email: decodedToken.email,
        scopes: extractScopes(decodedToken),
        ...decodedToken // Include all other claims
      }

      // Set user context
      c.set('user', user)

      await next()
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error
      }
      
      console.error('Auth verification error:', error)
      throw new HTTPException(401, { message: 'Invalid or expired token' })
    }
  }
}

/**
 * Require specific scopes middleware
 */
export function requireScopes(...requiredScopes: string[]): MiddlewareHandler<{ Variables: AuthContext }> {
  return async (c: Context, next: Next) => {
    const user = c.get('user')
    
    if (!user) {
      throw new HTTPException(401, { message: 'Authentication required' })
    }

    const userScopes = user.scopes || []
    const hasAllScopes = requiredScopes.every(scope => userScopes.includes(scope))

    if (!hasAllScopes) {
      throw new HTTPException(403, { 
        message: `Insufficient permissions. Required scopes: ${requiredScopes.join(', ')}` 
      })
    }

    await next()
  }
}

/**
 * Optional auth middleware - validates token if present, but doesn't require it
 */
export function optionalAuth(): MiddlewareHandler<{ Variables: Partial<AuthContext> }> {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('Authorization')
      const accessToken = extractBearerToken(authHeader)
      
      if (accessToken) {
        const decodedToken = await apiClient.verifyAccessToken({ accessToken })
        
        const user = {
          sub: decodedToken.sub,
          email: decodedToken.email,
          scopes: extractScopes(decodedToken),
          ...decodedToken
        }
        
        c.set('user', user)
      }
    } catch (error) {
      // For optional auth, we silently ignore errors and continue without user context
      console.warn('Optional auth warning:', error)
    }

    await next()
  }
}
