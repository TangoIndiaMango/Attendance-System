import { NextResponse } from "next/server"
import { getModels } from "@/lib/models"
import { getServerSession } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const session = await getServerSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, description, duration, isOpen, expectedAttendees } = await request.json()

    const { Session } = await getModels()

    const sessionId = uuidv4()
    const newSession = new Session({
      sessionId,
      name,
      description,
      startTime: new Date(),
      duration: duration * 60, // Convert minutes to seconds
      expectedAttendees,
      isOpen,
      status: "active",
      createdBy: session.id,
      attendees: [],
    })

    await newSession.save()

    return NextResponse.json({
      message: "Session created successfully",
      sessionId,
    })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ message: "Error creating session" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check if user is admin
    const session = await getServerSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { Session } = await getModels()

    // Get recent sessions, sorted by start time
    const sessions = await Session.find({}).sort({ startTime: -1 }).limit(50)

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ message: "Error fetching sessions" }, { status: 500 })
  }
}

