import { NextResponse } from "next/server"
import { getModels } from "@/lib/models"
import { v4 as uuidv4 } from "uuid"

interface Params {
  params: {
    id: string
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 })
    }

    const { Session, User } = await getModels()

    // Find the session
    const session = await Session.findOne({ sessionId: params.id })

    if (!session) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 })
    }

    // Check if session is still active
    const now = Date.now()
    const startTime = new Date(session.startTime).getTime()
    const elapsed = Math.floor((now - startTime) / 1000)

    if (elapsed > session.duration) {
      return NextResponse.json({ message: "Session has expired" }, { status: 400 })
    }

    // Check if user already marked attendance
    const existingAttendee = session.attendees.find((a: any) => a.name.toLowerCase() === name.toLowerCase())

    if (existingAttendee) {
      return NextResponse.json({ message: "You have already marked attendance for this session" }, { status: 400 })
    }

    // Find or create user
    let user = await User.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } })

    if (!user) {
      user = new User({
        userId: uuidv4(),
        name,
        email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`, // Temporary email
        totalLogins: 0,
        totalMinutes: 0,
        logins: [],
      })
    }

    // Update user's attendance
    user.logins.push({
      loginTime: new Date(),
      duration: session.duration,
      sessionId: session.sessionId,
    })
    user.totalLogins += 1
    user.totalMinutes += Math.floor(session.duration / 60)
    await user.save()

    // Update session's attendees
    session.attendees.push({
      userId: user.userId,
      name: user.name,
      markedAt: new Date(),
    })
    await session.save()

    return NextResponse.json({
      message: "Attendance marked successfully",
      userId: user.userId,
    })
  } catch (error) {
    console.error("Error marking attendance:", error)
    return NextResponse.json({ message: "Error marking attendance" }, { status: 500 })
  }
}

