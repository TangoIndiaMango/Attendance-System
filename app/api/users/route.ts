import { NextResponse } from "next/server"
import { getModels } from "@/lib/models"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    let email = null
    const uniqIdentifier2digits = Math.floor(10 + Math.random() * 90).toString()
    const { name } = await request.json()
    if (!email) {
      email = name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "").trim() + uniqIdentifier2digits + "@attendance_app.com"
    }

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 })
    }

    const { User } = await getModels()

    // Create a new user with UUID
    const userId = uuidv4()
    const newUser = new User({
      userId,
      name,
      email,
      totalLogins: 0,
      totalMinutes: 0,
      logins: [],
    })

    await newUser.save()

    return NextResponse.json({ userId, name })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ message: "Error creating user" }, { status: 500 })
  }
}

