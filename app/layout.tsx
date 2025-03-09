import type React from "react"
import "./globals.css"
import { Toaster } from "sonner"

export const metadata = {
  title: "Attendance System",
  description: "Track team attendance easily",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}

