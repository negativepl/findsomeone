'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changePassword } from './actions'
import { toast } from 'sonner'

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await changePassword(formData)
    setLoading(false)

    if (result.success) {
      toast.success(result.message)
      setOpen(false)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-2 border-black/10"
        >
          Zmień
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-0 rounded-3xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Zmiana hasła</DialogTitle>
          <DialogDescription className="text-base">
            Wprowadź obecne hasło i nowe hasło
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-5 py-4">
            <div className="space-y-3">
              <Label htmlFor="currentPassword" className="text-base font-semibold">
                Obecne hasło
              </Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                disabled={loading}
                className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="newPassword" className="text-base font-semibold">
                Nowe hasło
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={8}
                disabled={loading}
                className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30"
              />
              <p className="text-xs text-muted-foreground">Minimum 8 znaków</p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-base font-semibold">
                Potwierdź nowe hasło
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                disabled={loading}
                className="rounded-2xl border-2 border-black/10 h-12 focus:border-black/30"
              />
            </div>
          </div>
          <div className="mt-8 pt-6 border-t-2 border-black/5">
            <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="rounded-full border-2 border-black/10 hover:border-black/30 hover:bg-black/5"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full bg-[#C44E35] hover:bg-[#B33D2A] text-white border-0"
            >
              {loading ? 'Zmieniam...' : 'Zmień hasło'}
            </Button>
          </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
