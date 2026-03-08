'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { toggleStapleStock, updateQuantityLevel, deleteStaple } from '@/lib/db/staples'
import type { Staple, QuantityLevel } from '@/lib/types'

const QUANTITY_LEVELS: QuantityLevel[] = ['a little', 'enough', 'plenty']

interface Props {
  staple: Staple
  onChange: () => void
}

export function StapleCard({ staple, onChange }: Props) {
  const [optimisticStock, setOptimisticStock] = useState(staple.in_stock)
  const [optimisticQty, setOptimisticQty] = useState(staple.quantity_level)

  async function handleToggleStock() {
    const prev = optimisticStock
    const next = !prev
    setOptimisticStock(next)
    try {
      await toggleStapleStock(staple.id, next)
      onChange()
    } catch {
      setOptimisticStock(prev)
      toast.error('Could not update item.')
    }
  }

  async function handleQuantityChange(level: QuantityLevel) {
    const prev = optimisticQty
    setOptimisticQty(level)
    try {
      await updateQuantityLevel(staple.id, level)
      onChange()
    } catch {
      setOptimisticQty(prev)
      toast.error('Could not update quantity.')
    }
  }

  async function handleDelete() {
    try {
      await deleteStaple(staple.id)
      onChange()
    } catch {
      toast.error('Could not remove item.')
    }
  }

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border transition-opacity ${
        optimisticStock ? 'opacity-100' : 'opacity-40'
      }`}
    >
      <div className="flex-1 min-w-0">
        <button
          onClick={handleToggleStock}
          className="text-sm font-medium text-left hover:text-primary transition-colors truncate block w-full"
        >
          {staple.name}
          {!optimisticStock && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">out</span>
          )}
        </button>
        {optimisticStock && (
          <div className="flex gap-1 mt-1.5">
            {QUANTITY_LEVELS.map(level => (
              <button
                key={level}
                onClick={() => handleQuantityChange(level)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  optimisticQty === level
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:border-foreground/40'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        )}
      </div>
      {staple.item_type !== 'staple' && (
        <button
          onClick={handleDelete}
          className="ml-3 text-muted-foreground hover:text-destructive transition-colors shrink-0"
          aria-label="Remove"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  )
}
