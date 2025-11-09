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
        <Button variant="outline" className="rounded-full border border-border hover:bg-muted bg-card text-foreground">
          Zmień
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 md:p-6">
          <DialogTitle className="text-2xl">Zmiana hasła</DialogTitle>
          <DialogDescription className="text-base">
            Wprowadź obecne hasło i nowe hasło
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-5 px-4 md:px-6 py-4">
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
                className="rounded-2xl border border-border h-12 focus:border-brand/50"
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
                className="rounded-2xl border border-border h-12 focus:border-brand/50"
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
                className="rounded-2xl border border-border h-12 focus:border-brand/50"
              />
            </div>
          </div>

          <div className="px-4 md:px-6">
            <div className="border-t border-border" />
          </div>

          <DialogFooter className="gap-3 p-4 md:p-6 flex-row">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
              variant="outline"
              className="flex-1 rounded-full border border-border hover:bg-muted bg-card text-foreground"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0"
            >
              {loading ? 'Zmieniam...' : 'Zmień hasło'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
