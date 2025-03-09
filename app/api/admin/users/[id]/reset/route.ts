import { NextResponse } from "next/server"
import { getModels } from "@/lib/models"
import { getServerSession } from "@/lib/auth"

interface Params {
  params: {
    id: string
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    // Check if user is admin
    const session = await getServerSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { User } = await getModels()
    const user = await User.findOne({ userId: params.id })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Reset user attendance data
    user.logins = []
    user.totalLogins = 0
    user.totalMinutes = 0
    await user.save()

    return NextResponse.json({ message: "User attendance data reset successfully" })
  } catch (error) {
    console.error("Error resetting user attendance:", error)
    return NextResponse.json({ message: "Error resetting user attendance" }, { status: 500 })
  }
}

