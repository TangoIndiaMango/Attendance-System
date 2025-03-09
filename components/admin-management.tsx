"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { UserPlusIcon, TrashIcon } from 'lucide-react'

interface Admin {
  _id: string
  username: string
}

export function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ username: "", password: "" })
  
  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admin/manage")
      if (response.ok) {
        const data = await response.json()
        setAdmins(data)
      } else {
        toast.error('Failed to fetch admin list')
      }
    } catch (error) {
      toast.error('Could not connect to server')
    } finally {
      setIsLoading(false)
    }
  }
  // Fetch admins on component mount
  useState(() => {
    fetchAdmins()
  }, [])



  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newAdmin.username || !newAdmin.password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const response = await fetch("/api/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin),
      })

      if (response.ok) {
        toast.success('Admin account created successfully')
        setDialogOpen(false)
        setNewAdmin({ username: "", password: "" })
        fetchAdmins()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Failed to create admin')
      }
    } catch (error) {
      toast.error('Could not connect to server')
    }
  }

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const response = await fetch(`/api/admin/manage/${adminId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success('Admin account deleted successfully')
        fetchAdmins()
      } else {
        toast.error('Failed to delete admin')
      }
    } catch (error) {
      toast.error('Could not connect to server')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Admin Accounts</CardTitle>
          <Button onClick={() => setDialogOpen(true)}>
            <UserPlusIcon className="mr-2 h-4 w-4" />
            Add Admin
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    No admin accounts found
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell>{admin.username}</TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteAdmin(admin._id)}>
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Admin Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newAdmin.username}
                onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Admin</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

