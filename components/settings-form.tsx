"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { SaveIcon } from 'lucide-react'

interface Settings {
  sessionDuration: number
}

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings>({
    sessionDuration: 5,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/settings')
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        toast.error('Failed to load system settings. Using defaults.')
      }
    } catch (err) {
      toast.error('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        toast.success('System settings have been updated successfully')
      } else {
        toast.error('Failed to update system settings')
      }
    } catch (err) {
      toast.error('An error occurred while updating settings')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <CardTitle className="text-base mb-2">Attendance Window</CardTitle>
          <CardDescription className="mb-4">
            Configure how long team members have to mark their attendance.
          </CardDescription>

          <div className="space-y-2">
            <Label htmlFor="sessionDuration">Session Duration (minutes)</Label>
            <Input
              id="sessionDuration"
              type="number"
              min="1"
              max="60"
              value={settings.sessionDuration}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  sessionDuration: Number.parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isLoading}>
        <SaveIcon className="mr-2 h-4 w-4" />
        Save Settings
      </Button>
    </form>
  )
}

