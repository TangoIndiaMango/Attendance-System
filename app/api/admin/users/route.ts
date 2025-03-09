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

    const { User } = await getModels()
    const users = await User.find({}).sort({ name: 1 })
    // console.log(users)

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 })
  }
}

