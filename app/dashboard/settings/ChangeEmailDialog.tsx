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
import { changeEmail } from './actions'
import { toast } from 'sonner'

export function ChangeEmailDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await changeEmail(formData)
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
        <Button variant="ghost" size="sm" className="rounded-full text-foreground hover:bg-muted">
          Zmień
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border border-border rounded-3xl bg-card shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Zmiana adresu email</DialogTitle>
          <DialogDescription className="text-base">
            Wprowadź nowy adres email i swoje hasło
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-5 py-4">
            <div className="space-y-3">
              <Label htmlFor="newEmail" className="text-base font-semibold">
                Nowy adres email
              </Label>
              <Input
                id="newEmail"
                name="newEmail"
                type="email"
                required
                disabled={loading}
                placeholder="twoj.email@example.com"
                className="rounded-2xl border border-black/10 h-12 focus:border-black/30"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-semibold">
                Hasło
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={loading}
                className="rounded-2xl border border-black/10 h-12 focus:border-black/30"
              />
              <p className="text-xs text-muted-foreground">Potwierdź swoją tożsamość</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t-2 border-black/5">
            <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="rounded-full hover:bg-accent text-foreground bg-transparent border-0 shadow-none"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0"
            >
              {loading ? 'Zmieniam...' : 'Zmień email'}
            </Button>
          </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
