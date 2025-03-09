import { Suspense } from "react"
import Link from "next/link"
import UserDashboard from "@/components/user-dashboard"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Attendance System</h1>
          <Link href="/admin">
            <Button variant="outline">Admin Login</Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-center mb-6">Team Member Attendance</h2>
            <Suspense fallback={<div className="text-center p-4">Loading attendance system...</div>}>
              <UserDashboard />
            </Suspense>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t py-4 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Time Logger System
        </div>
      </footer>
    </main>
  )
}

