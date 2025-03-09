"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ClockIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react"
import confetti from "canvas-confetti"
import { formatTime, getGreeting } from "@/lib/utils"

interface Session {
  sessionId: string
  name: string
  description?: string
  startTime: string
  duration: number
  status: "pending" | "active" | "completed"
  isOpen: boolean
}

interface AttendanceMarkerProps {
  session: Session
}

export function AttendanceMarker({ session }: AttendanceMarkerProps) {
  const [name, setName] = useState("")
  const [isMarked, setIsMarked] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isExpired, setIsExpired] = useState(false)
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])
  const [userId, setUserId] = useState("")

  useEffect(() => {
    // Calculate initial time left
    const startTime = new Date(session.startTime).getTime()
    const now = Date.now()
    const elapsed = Math.floor((now - startTime) / 1000)
    const remaining = session.duration - elapsed

    if (remaining <= 0) {
      setIsExpired(true)
      return
    }

    setTimeLeft(remaining)

    // Start countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [session])

  // Update the localStorage check
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId")
    const storedName = localStorage.getItem("userName")
    if (storedUserId && storedName) {
      setUserId(storedUserId)
      setName(storedName)
      fetchAttendanceHistory(storedUserId)
    }
  }, [])

  const fetchAttendanceHistory = async (userId: string) => {
    try {
      const response = await fetch(`/api/attendance/history?userId=${encodeURIComponent(userId)}`)
      if (response.ok) {
        const data = await response.json()
        setAttendanceHistory(data)
      }
    } catch (error) {
      console.error("Failed to fetch attendance history:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter your name")
      return
    }

    try {
      // For open sessions, we only need the name
      if (session.isOpen) {
        const response = await fetch(`/api/attendance/${session.sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Failed to mark attendance")
        }
      } else {
        // For closed sessions, we need to verify/create user
        if (!userId) {
          const userResponse = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          })

          if (!userResponse.ok) {
            throw new Error("Failed to create user")
          }

          const userData = await userResponse.json()
          setUserId(userData.userId)
          localStorage.setItem("userId", userData.userId)
          localStorage.setItem("userName", name)
        }

        const response = await fetch(`/api/attendance/${session.sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, userId }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || "Failed to mark attendance")
        }
      }

      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      setIsMarked(true)
      toast.success("Attendance marked successfully!")

      // Only fetch attendance history if we have a userId
      if (userId) {
        fetchAttendanceHistory(userId)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to mark attendance")
    }
  }

  const getProgressColor = () => {
    if (timeLeft > session.duration * 0.6) return "bg-green-500"
    if (timeLeft > session.duration * 0.3) return "bg-yellow-500"
    return "bg-red-500"
  }

  const progressPercentage = Math.min(100, (timeLeft / session.duration) * 100)

  // Render weekly attendance calendar
  const renderWeeklyCalendar = () => {
    const today = new Date()
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() - today.getDay() + i)
      return date
    })

    return (
      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Weekly Attendance</h3>
        <div className="grid grid-cols-7 gap-1 text-center">
          {dayNames.map((day) => (
            <div key={day} className="text-xs text-muted-foreground">
              {day}
            </div>
          ))}

          {days.map((date, i) => {
            const dateStr = date.toISOString().split("T")[0]
            const isToday = date.toDateString() === today.toDateString()
            const isPresent = attendanceHistory.some(
              (a) => new Date(a.loginTime).toISOString().split("T")[0] === dateStr,
            )
            const isPast = date < today && !isToday

            return (
              <div
                key={i}
                className={`
                  aspect-square flex items-center justify-center rounded-full text-xs
                  ${isToday ? "border-2 border-primary" : ""}
                  ${isPresent ? "bg-green-100 text-green-800" : isPast ? "bg-red-100 text-red-800" : "bg-gray-100"}
                `}
              >
                {date.getDate()}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (isExpired && !isMarked) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="border-b bg-red-50 text-red-900">
          <CardTitle className="flex items-center">
            <AlertCircleIcon className="h-5 w-5 mr-2" />
            Session Expired
          </CardTitle>
          <CardDescription className="text-red-800">
            Sorry, the attendance window for this session has closed.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
            <p className="font-medium">You missed today&apos;s attendance</p>
            <p className="text-sm mt-1">Penalty amount: ₦ 3,000</p>
          </div>

          {name && attendanceHistory.length > 0 && renderWeeklyCalendar()}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Please contact your administrator if you believe this is an error.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isMarked) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card>
          <CardHeader className="border-b bg-green-50 text-green-900">
            <CardTitle className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Attendance Marked!
            </CardTitle>
            <CardDescription className="text-green-800">
              Your attendance has been recorded successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <p className="font-medium">Present for: {session.name}</p>
              </div>
              <p className="text-sm mt-1">Marked at: {new Date().toLocaleTimeString()}</p>
            </div>

            {renderWeeklyCalendar()}

            <div className="mt-6 text-center">
              <p className="text-sm font-medium text-green-800">Thank you for marking your attendance on time!</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{session.name}</CardTitle>
              {session.description && <CardDescription>{session.description}</CardDescription>}
            </div>
            <Badge variant="success" className="text-xs font-normal px-2 py-1">
              Active
            </Badge>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="text-base font-medium">
              {getGreeting()}, {name || "there"}! 👋
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="font-medium">Time Remaining</span>
                </div>
                <span className="text-lg font-mono">{formatTime(timeLeft)}</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getProgressColor()}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full transition-all hover:scale-105">
              <CheckCircleIcon className="mr-2 h-4 w-4" />
              Mark Present
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}

