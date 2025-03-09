import { Schema, model, models, type Document } from "mongoose"
import { connectToDatabase } from "./db"

// User Interface and Schema
export interface IUser extends Document {
  userId: string
  name: string
  email: string
  logins: Array<{
    loginTime: Date
    duration: number
    sessionId: string
  }>
  totalLogins: number
  totalMinutes: number
  missedAttendance: number
}

const UserSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  logins: [
    {
      loginTime: { type: Date, default: Date.now },
      duration: { type: Number, default: 300 },
      sessionId: { type: String, required: true },
    },
  ],
  totalLogins: { type: Number, default: 0 },
  totalMinutes: { type: Number, default: 0 },
  missedAttendance: { type: Number, default: 0 },
})

// Session Interface and Schema
export interface ISession extends Document {
  sessionId: string
  name?: string
  description?: string
  startTime: Date
  duration: number
  expectedAttendees?: string[] // Array of userIds
  isOpen: boolean
  status: "pending" | "active" | "completed"
  createdBy: string // adminId
  attendees: Array<{
    userId: string
    name: string
    markedAt: Date
  }>
}

const SessionSchema = new Schema<ISession>({
  sessionId: { type: String, required: true, unique: true },
  name: { type: String },
  description: { type: String },
  startTime: { type: Date, required: true },
  duration: { type: Number, required: true, default: 300 }, // in seconds
  expectedAttendees: [{ type: String }],
  isOpen: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ["pending", "active", "completed"],
    default: "pending",
  },
  createdBy: { type: String, required: true },
  attendees: [
    {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      markedAt: { type: Date, default: Date.now },
    },
  ],
})

// Admin Interface and Schema remain the same
export interface IAdmin extends Document {
  username: string
  passwordHash: string
}

const AdminSchema = new Schema<IAdmin>({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
})

// Settings Interface and Schema updated to include default session settings
export interface ISettings extends Document {
  sessionDuration: number
  defaultSessionName?: string
  defaultSessionDescription?: string
}

const SettingsSchema = new Schema<ISettings>({
  sessionDuration: { type: Number, default: 5 }, // in minutes
  defaultSessionName: { type: String },
  defaultSessionDescription: { type: String },
})

// New AttendanceSession Interface
export interface IAttendanceSession extends Document {
  startTime: Date
  endTime?: Date
  isActive: boolean
  createdBy: string // adminId
  attendees: Array<{
    userId: string
    name: string
    markedAt: Date
    status: 'present' | 'late' | 'absent'
  }>
}

// Add AttendanceSession Schema
const AttendanceSessionSchema = new Schema<IAttendanceSession>({
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  attendees: [{
    userId: { type: String, required: true },
    name: { type: String, required: true },
    markedAt: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['present', 'late', 'absent'],
      required: true 
    }
  }]
})

export async function getModels() {
  // Ensure database is connected before accessing models
  await connectToDatabase()

  const User = models.User || model("User", UserSchema)
  const Session = models.Session || model("Session", SessionSchema)
  const Admin = models.Admin || model("Admin", AdminSchema)
  const Settings = models.Settings || model("Settings", SettingsSchema)
  const AttendanceSession = models.AttendanceSession || 
    model("AttendanceSession", AttendanceSessionSchema)

  return { User, Session, Admin, Settings, AttendanceSession }
}

