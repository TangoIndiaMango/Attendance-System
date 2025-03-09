import { NextResponse } from "next/server"
import { getModels } from "@/lib/models"
import { getServerSession } from "@/lib/auth"

export async function GET() {
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
      })
      await settings.save()
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ message: "Error fetching settings" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const session = await getServerSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { sessionDuration } = await request.json()

    if (typeof sessionDuration !== "number" || sessionDuration < 1) {
      return NextResponse.json({ message: "Session duration must be a number greater than 0" }, { status: 400 })
    }

    const { Settings } = await getModels()

    // Update or create settings
    let settings = await Settings.findOne({})
    if (settings) {
      settings.sessionDuration = sessionDuration
    } else {
      settings = new Settings({
        sessionDuration,
      })
    }

    await settings.save()

    return NextResponse.json({ message: "Settings updated successfully" })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ message: "Error updating settings" }, { status: 500 })
  }
}

