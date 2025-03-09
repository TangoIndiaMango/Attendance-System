import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key-change-this-in-production"
const COOKIE_NAME = process.env.COOKIE_NAME || "admin_session"

// Session types
interface AdminSession {
  id: string
  username: string
  isAdmin: boolean
}

// Create a JWT session token
export async function createSession(data: AdminSession): Promise<string> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Create the session token using jose
  const token = await new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt.getTime() / 1000)
    .sign(new TextEncoder().encode(JWT_SECRET))

  // Set the cookie with the token
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return token
}

// Get the session from the cookie
export async function getServerSession(): Promise<AdminSession | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)

  if (!token) {
    return null
  }

  try {
    // Verify the token
    const { payload } = await jwtVerify(token.value, new TextEncoder().encode(JWT_SECRET), {
      algorithms: ["HS256"],
    })

    return payload as unknown as AdminSession
  } catch (error) {
    // If token is invalid, delete it
    cookies().delete(COOKIE_NAME)
    return null
  }
}

// Delete the session
export function deleteSession() {
  cookies().delete(COOKIE_NAME)
}

