import { NextResponse } from "next/server"
import { getModels } from "@/lib/models"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ message: "userId parameter is required" }, { status: 400 })
    }

    const { User } = await getModels()

    // Find user by userId
    const user = await User.findOne({ userId })

    if (!user) {
      return NextResponse.json([])
    }

    // Return user's logins, sorted by date
    const logins = user.logins.sort(
      (a: any, b: any) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime(),
    )

    return NextResponse.json(logins)
  } catch (error) {
    console.error("Error fetching attendance history:", error)
    return NextResponse.json({ message: "Error fetching attendance history" }, { status: 500 })
  }
}

