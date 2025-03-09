import { Suspense } from "react"
import { getModels } from "@/lib/models"
import { AttendanceMarker } from "@/components/attendance-marker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

interface Props {
  params: {
    id: string
  }
}

async function getSession(id: string) {
  const { Session } = await getModels()
  const session = await Session.findOne({ sessionId: id })
  
  if (!session) return null

  // Explicitly serialize the MongoDB document to a plain object
  return {
    sessionId: session.sessionId,
    name: session.name,
    description: session.description || "",
    startTime: session.startTime.toISOString(), // Convert Date to string
    duration: session.duration,
    status: session.status,
    isOpen: session.isOpen,
    expectedAttendees: session.expectedAttendees || [],
    attendees: session.attendees.map((attendee: any) => ({
      userId: attendee.userId,
      name: attendee.name,
      markedAt: attendee.markedAt.toISOString() // Convert Date to string
    }))
  }
}

export default async function AttendancePage({ params }: Props) {
  const session = await getSession(params.id)
  // console.log(session)

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container max-w-6xl mx-auto px-4 py-10">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-full p-2">
              <Image src="https://images.unsplash.com/photo-1728971975421-50f3dc9663a4?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF0dGVuZGFuY2UlMjBzeXN0ZW18ZW58MHx8MHx8fDA%3D" width={40} height={40} alt="Logo" className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold">Attendance System</h1>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center md:items-center justify-center">
          <div className="w-full max-w-md">
            <Suspense fallback={<div className="p-12 text-center">Loading attendance session...</div>}>
              {session ? (
                <AttendanceMarker session={session} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Session Not Found</CardTitle>
                    <CardDescription>This attendance session does not exist or has expired.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6">
                      <Image
                        src="https://images.unsplash.com/photo-1580135952947-6af0163e72cc?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNlc3Npb24lMjBub3QlMjBmb3VuZHxlbnwwfHwwfHx8MA%3D%3D"
                        width={200}
                        height={200}
                        alt="Session not found"
                        className="mx-auto mb-4"
                      />
                      <p className="text-muted-foreground">
                        Please check with your administrator for a valid attendance link.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </Suspense>
          </div>

          <div className="hidden md:block w-full max-w-md">
            <Image
              src="https://images.unsplash.com/photo-1594560562525-c691e827ca01?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjV8fGNsb2NrfGVufDB8fDB8fHwy"
              width={400}
              height={400}
              alt="Attendance illustration"
              className="mx-auto"
            />
          </div>
        </div>
      </div>
    </main>
  )
}

