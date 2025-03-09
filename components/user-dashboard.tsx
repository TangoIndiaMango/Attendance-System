"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClockIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'
import { logAttendance } from "@/lib/actions"
import { toast } from 'sonner'

export default function UserDashboard() {
  const [name, setName] = useState("")
  const [userId, setUserId] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalLogins, setTotalLogins] = useState(0)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Load user data from localStorage on initial render
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId")
    const storedName = localStorage.getItem("userName")

    if (storedUserId && storedName) {
      setUserId(storedUserId)
      setName(storedName)
      fetchUserData(storedUserId)
    }
  }, [])

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isLoggedIn && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (isLoggedIn && timeLeft === 0) {
      setIsLoggedIn(false)
      setSuccess("Your attendance has been recorded successfully!")
      setTimeout(() => setSuccess(""), 5000)
    }

    return () => clearInterval(interval)
  }, [isLoggedIn, timeLeft])

  const fetchUserData = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}`)
      if (response.ok) {
        const data = await response.json()
        setTotalLogins(data.totalLogins || 0)
        setTotalMinutes(data.totalMinutes || 0)
      }
    } catch (err) {
      console.error("Error fetching user data:", err)
    }
  }

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        const data = await response.json()
        setUserId(data.userId)
        localStorage.setItem("userId", data.userId)
        localStorage.setItem("userName", name)
        setError("")
        fetchUserData(data.userId)
      } else {
        const error = await response.json()
        toast.error(error.message || "Error creating user")
      }
    } catch (err) {
      toast.error("Error connecting to server")
    }
  }

  const handleAttendanceClick = async () => {
    if (!userId) {
      toast.error('Please enter your name first')
      return
    }

    try {
      const result = await logAttendance(userId)
      if (result.success) {
        setIsLoggedIn(true)
        setTimeLeft(300) // 5 minutes in seconds
        setTotalLogins(result.totalLogins)
        setTotalMinutes(result.totalMinutes)
        toast.success('Attendance marked successfully')
      } else {
        toast.error(result.message || "Failed to log attendance")
      }
    } catch (err: any) {
      toast.error(err.message || "Error logging attendance")
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {!userId ? (
        <form onSubmit={handleNameSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Enter your name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
          </div>
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      ) : (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium">Welcome, {name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center mb-6">
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">Total Logins</p>
                  <p className="text-2xl font-semibold">{totalLogins}</p>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">Total Minutes</p>
                  <p className="text-2xl font-semibold">{totalMinutes}</p>
                </div>
              </div>
              <Button className="w-full" disabled={isLoggedIn} onClick={handleAttendanceClick}>
                {isLoggedIn ? (
                  <span className="flex items-center">
                    <ClockIcon className="mr-2 h-4 w-4" />
                    Present ({formatTime(timeLeft)})
                  </span>
                ) : (
                  <span className="flex items-center">
                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                    Mark Present
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center">
                <XCircleIcon className="mr-2 h-4 w-4" />
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription className="flex items-center">
                <CheckCircleIcon className="mr-2 h-4 w-4" />
                {success}
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}

