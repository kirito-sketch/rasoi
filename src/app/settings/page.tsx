'use client'

import { useEffect, useState } from 'react'
import { getUtensils, toggleUtensil } from '@/lib/db/utensils'
import type { Utensil } from '@/lib/types'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsPage() {
  const [utensils, setUtensils] = useState<Utensil[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getUtensils()
      .then(setUtensils)
      .catch(() => setError('Could not load utensils. Check your Supabase connection.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle(id: string, current: boolean) {
    // Optimistic update
    setUtensils(prev =>
      prev.map(u => (u.id === id ? { ...u, available: !current } : u))
    )
    try {
      await toggleUtensil(id, !current)
    } catch {
      // Revert on failure
      setUtensils(prev =>
        prev.map(u => (u.id === id ? { ...u, available: current } : u))
      )
    }
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold pt-2">Settings</h1>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">My Kitchen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>
              ))}
            </>
          )}

          {error && (
            <p className="text-sm text-muted-foreground">{error}</p>
          )}

          {!loading && !error && utensils.map(utensil => (
            <div key={utensil.id} className="flex items-center justify-between">
              <Label htmlFor={utensil.id} className="cursor-pointer">
                {utensil.name}
              </Label>
              <Switch
                id={utensil.id}
                checked={utensil.available}
                onCheckedChange={() => handleToggle(utensil.id, utensil.available)}
              />
            </div>
          ))}

          {!loading && !error && utensils.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No utensils found. Set up your Supabase connection to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
