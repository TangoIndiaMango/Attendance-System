import { NextResponse } from "next/server"
import { getModels } from "@/lib/models"

interface Params {
  params: {
    id: string
  }
}

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const { User, Session } = await getModels()
    const user = await User.findOne({ userId: params.id })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Calculate statistics
    const totalSessions = await Session.countDocuments({
      startTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    })

    const attendedSessions = user.logins.length
    const missedSessions = totalSessions - attendedSessions
    const lateArrivals = user.logins.filter((login: any) => login.duration === 0).length
    const totalPenalty = user.missedAttendance * 3000 // ₦3000 per missed day
    const attendanceRate = totalSessions > 0
      ? (attendedSessions / totalSessions) * 100
      : 0

    return NextResponse.json({
      totalSessions,
      attendedSessions,
      missedSessions,
      lateArrivals,
      totalPenalty,
      attendanceRate,
      lastAttendance: user.logins[user.logins.length - 1]?.loginTime
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json(
      { message: "Error fetching user statistics" },
      { status: 500 }
    )
  }
} 