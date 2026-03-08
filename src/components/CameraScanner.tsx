'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  onComplete: (ingredients: string[]) => void
  onClose: () => void
}

type Phase = 'camera' | 'loading' | 'confirming'

export function CameraScanner({ onComplete, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [phase, setPhase] = useState<Phase>('camera')
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [recognized, setRecognized] = useState<string[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // Start camera when component mounts
  useEffect(() => {
    let active = true

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        if (!active) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        if (active) {
          const msg = err instanceof Error ? err.message : 'Camera access denied'
          setError(msg)
          toast.error(msg)
        }
      }
    }

    startCamera()

    return () => {
      active = false
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  async function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setPhotoDataUrl(dataUrl)

    const base64 = dataUrl.replace('data:image/jpeg;base64,', '')
    stopCamera()
    setPhase('loading')

    try {
      const res = await fetch('/api/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Recognition failed')
      }

      const data = await res.json()
      const items: string[] = data.ingredients ?? []
      setRecognized(items)
      setSelected(new Set(items))
      setPhase('confirming')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Recognition failed'
      toast.error(msg)
      setError(msg)
      // Restart camera
      setPhase('camera')
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        // ignore if camera restart fails
      }
    }
  }

  function toggleIngredient(name: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  function handleAdd() {
    onComplete(Array.from(selected))
  }

  async function handleRetake() {
    setPhase('camera')
    setPhotoDataUrl(null)
    setRecognized([])
    setSelected(new Set())
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera access denied'
      toast.error(msg)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Close button */}
      <button
        onClick={() => {
          stopCamera()
          onClose()
        }}
        className="absolute top-4 right-4 z-10 text-white bg-black/50 rounded-full p-2"
        aria-label="Close scanner"
      >
        <X size={20} />
      </button>

      {/* Camera phase */}
      {(phase === 'camera' || phase === 'loading') && (
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {phase === 'camera' && (
            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
              <button
                onClick={handleCapture}
                className="w-16 h-16 rounded-full bg-white border-4 border-gray-300 shadow-lg active:scale-95 transition-transform"
                aria-label="Capture photo"
              />
            </div>
          )}

          {phase === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-white text-center space-y-3">
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm">Recognizing ingredients...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirming phase */}
      {phase === 'confirming' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Captured photo */}
          {photoDataUrl && (
            <div className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoDataUrl}
                alt="Captured"
                className="w-full max-h-48 object-cover"
              />
            </div>
          )}

          {/* Ingredients list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <h2 className="text-lg font-semibold">
              {recognized.length === 0
                ? 'No ingredients detected'
                : 'Tap to deselect ingredients'}
            </h2>

            {recognized.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recognized.map(name => {
                  const isSelected = selected.has(name)
                  return (
                    <button
                      key={name}
                      onClick={() => toggleIngredient(name)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-muted line-through'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      {name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 p-4 space-y-2 border-t">
            <Button
              className="w-full"
              disabled={selected.size === 0}
              onClick={handleAdd}
            >
              Add {selected.size} ingredient{selected.size !== 1 ? 's' : ''}
            </Button>
            <Button variant="outline" className="w-full" onClick={handleRetake}>
              Retake
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
