import { NextResponse } from "next/server"
import { getModels } from "@/lib/models"
import { getServerSession } from "@/lib/auth"

export async function POST() {
  try {
    // Check if user is admin
    const session = await getServerSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { Settings } = await getModels()

    // Get or create settings
    let settings = await Settings.findOne({})
    if (!settings) {
      settings = new Settings({
        sessionDuration: 5,
        attendanceWindowStart: new Date(),
        attendanceWindowActive: true,
      })
    } else {
      settings.attendanceWindowStart = new Date()
      settings.attendanceWindowActive = true
    }

    await settings.save()

    return NextResponse.json({
      message: "Attendance window started",
      windowStart: settings.attendanceWindowStart,
    })
  } catch (error) {
    console.error("Error starting attendance window:", error)
    return NextResponse.json({ message: "Error starting attendance window" }, { status: 500 })
  }
}

