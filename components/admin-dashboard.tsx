"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AdminManagement } from "./admin-management"
import { SettingsForm } from "./settings-form"
import {
  UserPlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  SettingsIcon,
  UsersIcon,
  ShieldIcon,
} from "lucide-react"
import { toast } from "sonner"
import { SessionCreator } from "./session-creator"
import { SessionList } from "./session-list"
import { format, startOfDay, endOfDay } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { DatePicker } from "@/components/ui/date-picker"

interface User {
  _id: string
  userId: string
  name: string
  totalLogins: number
  totalMinutes: number
  logins: Array<{
    loginTime: string
    duration: number
    sessionName: string
  }>
  missedAttendance: number
  email: string
}

// Add this interface for detailed user stats
interface UserStats {
  totalSessions: number
  attendedSessions: number
  missedSessions: number
  lateArrivals: number
  totalPenalty: number
  attendanceRate: number
  lastAttendance?: string
}

interface AttendanceSession {
  _id: string
  startTime: string
  endTime: string
  isActive: boolean
  attendees: Array<{
    userId: string
    name: string
    markedAt: string
    status: 'present' | 'late' | 'absent'
  }>
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({ name: "", email: "" })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [attendanceWindowActive, setAttendanceWindowActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // const fetchAdmins = async () => {
  //   try {
  //     setIsLoading(true)
  //     const response = await fetch("/api/admins")
  //     if (response.ok) {
  //       const data = await response.json()
  //       setAdmins(data)
  //       setIsLoading(false)
  //     } else {
  //       setIsLoading(false)
  //       console.error("Failed to fetch admins")
  //     }
  //   } catch (error) {
  //     console.error("Error fetching admins:", error)
  //   }
  // }

  // Fetch admins on component mount
  
  
  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error("Failed to fetch users")
      }
    } catch (error) {
      toast.error("Could not connect to server")
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    fetchAttendanceSessions()
    const interval = setInterval(fetchAttendanceSessions, 30000)
    return () => clearInterval(interval)
  }, [selectedDate])

  const fetchAttendanceSessions = async () => {
    try {
      const response = await fetch(
        `/api/admin/attendance/sessions?date=${selectedDate.toISOString()}`
      )
      if (response.ok) {
        const data = await response.json()
        setAttendanceSessions(data)
      }
    } catch (error) {
      console.error("Failed to fetch attendance sessions:", error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newUser.name || !newUser.email) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        toast.success("User created successfully")
        setDialogOpen(false)
        setNewUser({ name: "", email: "" })
        fetchUsers()
      } else {
        toast.error("Failed to create user")
      }
    } catch (error) {
      toast.error("Could not connect to server")
    }
  }

  const startAttendanceWindow = async () => {
    try {
      const response = await fetch("/api/admin/attendance/start", {
        method: "POST",
      })

      if (response.ok) {
        setAttendanceWindowActive(true)
        setTimeLeft(300) // 5 minutes
        toast.success("Attendance window started")
        fetchAttendanceSessions() // Refresh the list
      } else {
        toast.error("Failed to start attendance window")
      }
    } catch (error) {
      toast.error("Could not connect to server")
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const calculatePenalty = (missedDays: number) => {
    return missedDays * 3000 // ₹3000 per missed day
  }

  const getWeeklyAttendance = (user: User) => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start from Sunday

    return user.logins.filter((login) => {
      const loginDate = new Date(login.loginTime)
      return loginDate >= startOfWeek && loginDate <= today
    }).length
  }

  const handleUserClick = async (user: User) => {
    setSelectedUser(user)
    try {
      const response = await fetch(`/api/admin/users/${user.userId}/stats`)
      if (response.ok) {
        const stats = await response.json()
        setUserStats(stats)
        setUserDialogOpen(true)
      } else {
        toast.error("Failed to fetch user statistics")
      }
    } catch (error) {
      toast.error("Error loading user details")
    }
  }

  const formatDate = (date: Date) => {
    return format(date, "PPP")
  }

  return (
    <Tabs defaultValue="sessions" className="space-y-6">
      <TabsList>
        <TabsTrigger value="sessions" className="flex items-center">
          <ClockIcon className="mr-2 h-4 w-4" />
          Sessions
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center">
          <UsersIcon className="mr-2 h-4 w-4" />
          Users
        </TabsTrigger>
        <TabsTrigger value="attendance" className="flex items-center">
          <ShieldIcon className="mr-2 h-4 w-4" />
          Attendance
        </TabsTrigger>
        <TabsTrigger value="admins" className="flex items-center">
          <ShieldIcon className="mr-2 h-4 w-4" />
          Admins
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center">
          <SettingsIcon className="mr-2 h-4 w-4" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sessions">
        <div className="grid gap-6">
          <SessionCreator />
          <SessionList />
        </div>
      </TabsContent>

      <TabsContent value="users">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Team Members</CardTitle>
            <Button onClick={() => setDialogOpen(true)}>
              <UserPlusIcon className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Weekly Attendance</TableHead>
                  <TableHead className="text-center">Missed Days</TableHead>
                  <TableHead className="text-right">Penalty Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const weeklyAttendance = getWeeklyAttendance(user)
                    const missedDays = user.missedAttendance || 0
                    const penalty = calculatePenalty(missedDays)

                    return (
                      <TableRow key={user._id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-center">{weeklyAttendance}/7</TableCell>
                        <TableCell className="text-center">{missedDays}</TableCell>
                        <TableCell className="text-right">₦{penalty.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUserClick(user)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Details Dialog */}
        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>User Details - {selectedUser?.name}</DialogTitle>
            </DialogHeader>
            
            {userStats && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Math.round(userStats.attendanceRate)}%
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {userStats.attendedSessions}/{userStats.totalSessions}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Penalty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        ₦{userStats.totalPenalty.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Attendance History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Session</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser?.logins.map((login) => (
                          <TableRow key={login.loginTime}>
                            <TableCell>
                              {formatDate(new Date(login.loginTime))}
                            </TableCell>
                            <TableCell>
                              {format(new Date(login.loginTime), "hh:mm a")}
                            </TableCell>
                            <TableCell>
                              <Badge variant={login.duration > 0 ? "default" : "destructive"}>
                                {login.duration > 0 ? "Present" : "Late"}
                              </Badge>
                            </TableCell>
                            <TableCell>{login.sessionName || "Regular Session"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Attendance Trends Chart could be added here */}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </TabsContent>

      <TabsContent value="attendance">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Attendance Control</CardTitle>
              <div className="flex items-center gap-2">
                <DatePicker 
                  date={selectedDate}
                  onSelect={(date) => setSelectedDate(date || new Date())}
                  className="w-[200px]"
                />
                <Button onClick={startAttendanceWindow} disabled={attendanceWindowActive}>
                  <ClockIcon className="mr-2 h-4 w-4" />
                  {attendanceWindowActive 
                    ? `Window Active (${formatTime(timeLeft)})` 
                    : "Start Attendance Window"
                  }
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceSessions.map((session) => (
                  <Card key={session._id} className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(session.startTime), "hh:mm a")}
                          </span>
                          {session.isActive && (
                            <Badge variant="default">Active</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {session.attendees.length} attendees
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => {
                            const attendance = session.attendees.find(
                              (a) => a.userId === user.userId
                            )
                            
                            return (
                              <TableRow key={user._id}>
                                <TableCell className="font-medium">
                                  {user.name}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    {attendance ? (
                                      <>
                                        <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />
                                        <span className="text-green-600">
                                          {attendance.status === 'late' ? 'Late' : 'Present'}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />
                                        <span className="text-red-600">Absent</span>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {attendance 
                                    ? format(new Date(attendance.markedAt), "hh:mm:ss a")
                                    : "-"
                                  }
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}

                {attendanceSessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No attendance sessions found for this date
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="admins">
        <AdminManagement />
      </TabsContent>

      <TabsContent value="settings">
        <SettingsForm />
      </TabsContent>

      {/* Add User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}

