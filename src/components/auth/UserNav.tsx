'use client'

import { signOut } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserNavProps {
  user: {
    email: string
    role: string
  }
}

export function UserNav({ user }: UserNavProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4 text-slate-600" />
        <span className="text-slate-700">{user.email}</span>
        {user.role !== 'user' && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
            {user.role}
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        className="text-slate-600 hover:text-slate-900"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  )
}
