"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { ClockIcon, UsersIcon, CopyIcon, InfoIcon, ArrowUpDownIcon, SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Session {
  sessionId: string
  name: string
  description?: string
  startTime: string
  duration: number
  status: "pending" | "active" | "completed"
  attendees: Array<{
    userId: string
    name: string
    markedAt: string
  }>
  expectedAttendees?: string[]
  isOpen: boolean
}

export function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"startTime" | "name" | "status">("startTime")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  useEffect(() => {
    fetchSessions()
    // Set up polling for active sessions
    const interval = setInterval(fetchSessions, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/admin/sessions")
      if (!response.ok) throw new Error("Failed to fetch sessions")
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      toast.error("Failed to fetch sessions")
    } finally {
      setIsLoading(false)
    }
  }

  const copySessionLink = (sessionId: string) => {
    const link = `${window.location.origin}/attendance/${sessionId}`
    navigator.clipboard.writeText(link)
    toast.success("Link copied to clipboard!")
  }

  const getStatusBadge = (status: Session["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "active":
        return <Badge variant="success">Active</Badge>
      case "completed":
        return <Badge variant="default">Completed</Badge>
    }
  }

  const toggleSort = (field: "startTime" | "name" | "status") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortDirection("asc")
    }
  }

  const getSortedSessions = () => {
    let filtered = [...sessions]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (session) =>
          session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (session.description && session.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Sort
    return filtered.sort((a, b) => {
      let comparison = 0

      if (sortBy === "startTime") {
        comparison = new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === "status") {
        comparison = a.status.localeCompare(b.status)
      }

      return sortDirection === "asc" ? comparison : -comparison
    })
  }

  const sortedSessions = getSortedSessions()

  const handleRowClick = (session: Session) => {
    setSelectedSession(session)
  }

  const formatAttendanceTime = (time: string) => {
    return new Date(time).toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance Sessions</CardTitle>
          <CardDescription>View and manage your attendance sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <ClockIcon className="h-10 w-10 mx-auto mb-4 opacity-20" />
            <p>Loading sessions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Attendance Sessions</CardTitle>
              <CardDescription>View and manage your attendance sessions</CardDescription>
            </div>
            <div className="relative w-full sm:w-auto max-w-xs">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                    <div className="flex items-center gap-1">
                      Session
                      {sortBy === "name" && <ArrowUpDownIcon className="h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("status")}>
                    <div className="flex items-center gap-1">
                      Status
                      {sortBy === "status" && <ArrowUpDownIcon className="h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("startTime")}>
                    <div className="flex items-center gap-1">
                      Start Time
                      {sortBy === "startTime" && <ArrowUpDownIcon className="h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <InfoIcon className="h-10 w-10 mb-2 opacity-20" />
                        {searchQuery ? <p>No sessions match your search</p> : <p>No sessions found</p>}
                        <p className="text-sm mt-1">Create a new session to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedSessions.map((session) => (
                    <TableRow 
                      key={session.sessionId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(session)}
                    >
                      <TableCell>
                        <div className="font-medium">{session.name}</div>
                        {session.description && (
                          <div className="text-sm text-muted-foreground">{session.description}</div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(session.status)}</TableCell>
                      <TableCell>
                        <div>{formatDate(session.startTime)}</div>
                        <div className="text-xs text-muted-foreground">
                          Duration: {Math.floor(session.duration / 60)} min
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <UsersIcon className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {session.attendees.length}
                            {session.expectedAttendees && session.expectedAttendees.length > 0 && (
                              <>/{session.expectedAttendees.length}</>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            copySessionLink(session.sessionId)
                          }}
                          className="hover:bg-primary/10"
                        >
                          <CopyIcon className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={selectedSession !== null} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedSession?.name} - Attendance List</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSession?.expectedAttendees?.map((expected) => {
                    const attendee = selectedSession.attendees.find(a => a.name === expected)
                    return (
                      <TableRow key={expected}>
                        <TableCell>{expected}</TableCell>
                        <TableCell>
                          {attendee ? formatAttendanceTime(attendee.markedAt) : '-'}
                        </TableCell>
                        <TableCell>
                          {attendee ? (
                            <Badge variant="success">Present</Badge>
                          ) : (
                            <Badge variant="destructive">Absent</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {/* Show unexpected attendees */}
                  {selectedSession?.attendees.filter(
                    a => !selectedSession.expectedAttendees?.includes(a.name)
                  ).map((attendee) => (
                    <TableRow key={attendee.userId}>
                      <TableCell>{attendee.name}</TableCell>
                      <TableCell>{formatAttendanceTime(attendee.markedAt)}</TableCell>
                      <TableCell>
                        <Badge variant="warning">Unexpected</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Total Attendance: {selectedSession?.attendees.length || 0}
              {selectedSession?.expectedAttendees && (
                <> / {selectedSession.expectedAttendees.length} expected</>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

