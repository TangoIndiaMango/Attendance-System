import { NextResponse } from "next/server"
import { getModels } from "@/lib/models"
import { startOfDay, endOfDay } from "date-fns"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")
    const date = dateParam ? new Date(dateParam) : new Date()

    const { AttendanceSession } = await getModels()
    
    const sessions = await AttendanceSession.find({
      startTime: {
        $gte: startOfDay(date),
        $lte: endOfDay(date)
      }
    }).sort({ startTime: -1 })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Error fetching attendance sessions:", error)
    return NextResponse.json(
      { message: "Error fetching attendance sessions" },
      { status: 500 }
    )
  }
} 