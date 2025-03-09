import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function POST() {
  deleteSession()
  return NextResponse.json({ message: "Logged out successfully" })
}

