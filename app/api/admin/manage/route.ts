import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getModels } from "@/lib/models"
import { getServerSession } from "@/lib/auth"

export async function GET() {
  try {
    // Check if user is admin
    const session = await getServerSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { Admin } = await getModels()
    const admins = await Admin.find({}, { passwordHash: 0 }) // Exclude password hashes

    return NextResponse.json(admins)
  } catch (error) {
    console.error("Error fetching admins:", error)
    return NextResponse.json({ message: "Error fetching admins" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const session = await getServerSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
    }

    const { Admin } = await getModels()

    // Check if username already exists
    const existingAdmin = await Admin.findOne({ username })
    if (existingAdmin) {
      return NextResponse.json({ message: "Username already exists" }, { status: 400 })
    }

    // Create new admin
    const passwordHash = await bcrypt.hash(password, 10)
    const newAdmin = new Admin({
      username,
      passwordHash,
    })
    await newAdmin.save()

    return NextResponse.json({ message: "Admin created successfully" })
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json({ message: "Error creating admin" }, { status: 500 })
  }
}

