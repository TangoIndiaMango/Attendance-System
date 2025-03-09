import { NextResponse } from "next/server"
import { getModels } from "@/lib/models"
import { getServerSession } from "@/lib/auth"

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: Params) {
  try {
    // Check if user is admin
    const session = await getServerSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { Session } = await getModels()
    const attendanceSession = await Session.findOne({ sessionId: params.id })

    if (!attendanceSession) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 })
    }

    return NextResponse.json(attendanceSession)
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json({ message: "Error fetching session" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    // Check if user is admin
    const session = await getServerSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { Session } = await getModels()
    const result = await Session.deleteOne({ sessionId: params.id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Session deleted successfully" })
  } catch (error) {
    console.error("Error deleting session:", error)
    return NextResponse.json({ message: "Error deleting session" }, { status: 500 })
  }
}

