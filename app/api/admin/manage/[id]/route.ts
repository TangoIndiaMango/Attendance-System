import { NextResponse } from "next/server"
import { getModels } from "@/lib/models"
import { getServerSession } from "@/lib/auth"

interface Params {
  params: {
    id: string
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    // Check if user is admin
    const session = await getServerSession()
    if (!session?.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { Admin } = await getModels()

    // Prevent deleting the last admin
    const adminCount = await Admin.countDocuments()
    if (adminCount <= 1) {
      return NextResponse.json({ message: "Cannot delete the last admin account" }, { status: 400 })
    }

    // Delete admin
    const result = await Admin.deleteOne({ _id: params.id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Admin not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Admin deleted successfully" })
  } catch (error) {
    console.error("Error deleting admin:", error)
    return NextResponse.json({ message: "Error deleting admin" }, { status: 500 })
  }
}

