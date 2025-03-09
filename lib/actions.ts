"use server"

import { getModels } from "./models"
import { v4 as uuidv4 } from "uuid"

// Log attendance for a user
export async function logAttendance(userId: string) {
  try {
    const { User, Settings } = await getModels()

    // Find user
    const user = await User.findOne({ userId })
    if (!user) {
      return { success: false, message: "User not found" }
    }

    // Check if settings exist, if not use default
    const settings = (await Settings.findOne({})) || { sessionDuration: 5 }
    const sessionId = uuidv4()

    // Convert session duration to seconds
    const sessionDurationSeconds = settings.sessionDuration * 60

    // Add login
    const loginTime = new Date()
    user.logins.push({
      loginTime,
      duration: sessionDurationSeconds,
      sessionId: sessionId,
    })

    // Update totals
    user.totalLogins += 1
    user.totalMinutes += settings.sessionDuration

    await user.save()

    return {
      success: true,
      totalLogins: user.totalLogins,
      totalMinutes: user.totalMinutes,
    }
  } catch (error) {
    console.error("Error logging attendance:", error)
    return { success: false, message: "Failed to log attendance" }
  }
}

// Create a new user
export async function createUser(name: string) {
  try {
    const { User } = await getModels()

    const userId = uuidv4()
    const newUser = new User({
      userId,
      name,
      totalLogins: 0,
      totalMinutes: 0,
      logins: [
        { sessionId: "12121212212" }
      ],
    })

    await newUser.save()
    return { success: true, userId }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, message: "Failed to create user" }
  }
}

