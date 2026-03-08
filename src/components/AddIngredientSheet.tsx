'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { addStaple } from '@/lib/db/staples'
import type { Category, ItemType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CATEGORIES: Category[] = [
  'Grains & Lentils',
  'Pasta & Dry Goods',
  'Spices & Tempering',
  'Oils & Condiments',
  'Fridge',
]

interface Props {
  type: ItemType
  onAdded: () => void
  trigger?: React.ReactElement
}

export function AddIngredientSheet({ type, onAdded, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('Fridge')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      await addStaple(trimmed, category, type)
      setName('')
      setOpen(false)
      onAdded()
    } catch {
      toast.error('Could not add ingredient.')
    } finally {
      setSaving(false)
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Plus size={15} className="mr-1" />
      Add
    </Button>
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? defaultTrigger}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader>
          <SheetTitle>Add {type === 'staple' ? 'staple' : 'ingredient'}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={type === 'staple' ? 'e.g. Coconut milk' : 'e.g. Chicken breast'}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={v => setCategory(v as Category)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAdd}
            disabled={saving || !name.trim()}
            className="w-full"
          >
            {saving ? 'Adding...' : 'Add ingredient'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
