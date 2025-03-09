"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { CalendarIcon, ClockIcon, UsersIcon, CopyIcon, CheckIcon, XIcon } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface SessionCreatorProps {
  onSessionCreated?: (sessionId: string) => void
}

export function SessionCreator({ onSessionCreated }: SessionCreatorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [sessionData, setSessionData] = useState({
    name: "",
    description: "",
    duration: 5,
    isOpen: true,
    expectedAttendees: [] as string[],
  })
  const [availableUsers, setAvailableUsers] = useState<string[]>([])
  const [shareableLink, setShareableLink] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users")
        if (response.ok) {
          const data = await response.json()
          setAvailableUsers(data.map((user: any) => user.name))
        }
      } catch (error) {
        console.error("Failed to fetch users:", error)
      }
    }
    fetchUsers()
  }, [])

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sessionData.name) {
      toast.error("Please enter a session name")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      })

      if (!response.ok) {
        throw new Error("Failed to create session")
      }

      const data = await response.json()
      const sessionLink = `${window.location.origin}/attendance/${data.sessionId}`
      setShareableLink(sessionLink)

      toast.success("Session created successfully!")
      onSessionCreated?.(data.sessionId)
    } catch (error) {
      toast.error("Failed to create session")
    } finally {
      setIsLoading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareableLink)
    setCopied(true)
    toast.success("Link copied to clipboard!")

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const handleAddAttendee = (userName: string) => {
    if (!sessionData.expectedAttendees.includes(userName)) {
      setSessionData({
        ...sessionData,
        expectedAttendees: [...sessionData.expectedAttendees, userName],
      })
    }
  }

  const handleRemoveAttendee = (userName: string) => {
    setSessionData({
      ...sessionData,
      expectedAttendees: sessionData.expectedAttendees.filter((name) => name !== userName),
    })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Create Attendance Session
        </CardTitle>
        <CardDescription>Create a new attendance session and share the link with your team</CardDescription>
      </CardHeader>
      <form onSubmit={handleCreateSession}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Session Name</Label>
            <Input
              id="name"
              placeholder="Daily Standup - 4PM"
              value={sessionData.name}
              onChange={(e) => setSessionData({ ...sessionData, name: e.target.value })}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the session..."
              value={sessionData.description}
              onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })}
              className="resize-none bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="60"
                  value={sessionData.duration}
                  onChange={(e) =>
                    setSessionData({
                      ...sessionData,
                      duration: Number.parseInt(e.target.value),
                    })
                  }
                  className="pl-10 bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Session Type</Label>
              <div className="flex items-center justify-between p-3 border rounded-md bg-white">
                <div className="flex items-center space-x-2">
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Open for everyone</span>
                </div>
                <Switch
                  checked={sessionData.isOpen}
                  onCheckedChange={(checked) => {
                    setSessionData({ 
                      ...sessionData, 
                      isOpen: checked,
                      expectedAttendees: checked ? [] : sessionData.expectedAttendees 
                    })
                  }}
                />
              </div>
            </div>
          </div>

          {!sessionData.isOpen && (
            <div className="space-y-2">
              <Label>Expected Attendees</Label>
              <div className="space-y-3">
                <Select
                  onValueChange={handleAddAttendee}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add attendee..." />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {availableUsers
                        .map((user) => (
                          <SelectItem key={user} value={user}>
                            {user}
                          </SelectItem>
                        ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>

                <div className="flex flex-wrap gap-2">
                  {sessionData.expectedAttendees.map((attendee) => (
                    <Badge
                      key={attendee}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {attendee}
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(attendee)}
                        className="ml-1 hover:bg-muted rounded"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {shareableLink && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-lg border p-4 space-y-2 bg-green-50 border-green-200"
            >
              <div className="flex items-center justify-between">
                <Label className="text-green-800">Shareable Link</Label>
                <Button size="sm" variant="outline" onClick={copyLink}>
                  {copied ? (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="p-2 bg-white rounded text-sm font-mono break-all border">{shareableLink}</div>
              <p className="text-xs text-green-800">
                This link will be active for {sessionData.duration} minutes once the first person marks attendance.
              </p>
            </motion.div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/30 border-t">
          <Button type="submit" className="w-full transition-all hover:translate-y-[-2px]" disabled={isLoading}>
            {isLoading ? (
              "Creating Session..."
            ) : (
              <>
                <ClockIcon className="mr-2 h-4 w-4" />
                Create Session
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

