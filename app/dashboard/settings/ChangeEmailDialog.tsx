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
        <Button variant="outline" className="rounded-full border border-border hover:bg-accent bg-muted text-foreground">
          Zmień
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 md:p-6">
          <DialogTitle className="text-2xl">Zmiana adresu email</DialogTitle>
          <DialogDescription className="text-base">
            Wprowadź nowy adres email i swoje hasło
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-5 px-4 md:px-6 py-4">
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
                className="rounded-2xl border border-border h-12 focus:border-brand/50"
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
              className="flex-1 rounded-full border border-border hover:bg-accent bg-muted text-foreground"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground border-0"
            >
              {loading ? 'Zmieniam...' : 'Zmień email'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
