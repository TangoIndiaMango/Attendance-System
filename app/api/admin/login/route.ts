import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getModels } from "@/lib/models"
import { createSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
    }

    const { Admin } = await getModels()

    // Find admin
    const admin = await Admin.findOne({ username })

    // If no admin exists and this is the first login, create a default admin
    if (!admin && username === "admin") {
      const defaultAdmin = new Admin({
        username: "admin",
        passwordHash: await bcrypt.hash(password, 10),
      })
      await defaultAdmin.save()

      // Create session
      await createSession({
        id: defaultAdmin._id.toString(),
        username: defaultAdmin.username,
        isAdmin: true,
      })

      return NextResponse.json({ message: "Admin created and logged in" })
    }

    // Verify password
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Create session
    await createSession({
      id: admin._id.toString(),
      username: admin.username,
      isAdmin: true,
    })

    return NextResponse.json({ message: "Login successful" })
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ message: "Login failed" }, { status: 500 })
  }
}

