import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AdminDashboard from "@/components/admin-dashboard"
import { getServerSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminDashboardPage() {
  // Server-side authentication check
  const session = await getServerSession()
  if (!session?.isAdmin) {
    redirect("/admin")
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="outline">View User Page</Button>
            </Link>
            <form action="/api/admin/logout" method="POST">
              <Button variant="destructive" type="submit">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<div className="text-center p-8">Loading dashboard data...</div>}>
            <AdminDashboard />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

