import { NextResponse } from "next/server"
import { getModels } from "@/lib/models"

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { User } = await getModels()
    const user = await User.findOne({ userId: params.id })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      userId: user.userId,
      name: user.name,
      totalLogins: user.totalLogins,
      totalMinutes: user.totalMinutes,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ message: "Error fetching user" }, { status: 500 })
  }
}

