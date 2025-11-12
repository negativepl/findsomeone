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
import { deleteAccount } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await deleteAccount(formData)
    setLoading(false)

    if (result.success) {
      toast.success('Konto zostało usunięte')
      if (result.redirect) {
        router.push(result.redirect)
      }
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="rounded-full border-2 border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive/15 hover:border-destructive/60 transition-all whitespace-nowrap font-semibold"
        >
          Usuń konto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 md:p-6">
          <DialogTitle className="text-2xl font-bold text-destructive">Usuń konto</DialogTitle>
          <DialogDescription className="text-base text-destructive">
            ⚠️ Ta akcja jest nieodwracalna. Wszystkie twoje dane zostaną permanentnie usunięte.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-5 px-4 md:px-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-semibold text-foreground">
                Hasło
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={loading}
                className="rounded-2xl border border-destructive/20 h-12 focus:border-destructive"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="confirmation" className="text-base font-semibold text-foreground">
                Wpisz <span className="font-bold text-destructive">USUŃ KONTO</span> aby potwierdzić
              </Label>
              <Input
                id="confirmation"
                name="confirmation"
                type="text"
                required
                placeholder="USUŃ KONTO"
                disabled={loading}
                className="rounded-2xl border border-destructive/20 h-12 focus:border-destructive"
              />
              <p className="text-xs text-destructive">To działanie jest nieodwracalne!</p>
            </div>
          </div>

          <div className="px-4 md:px-6">
            <div className="border-t border-destructive/20" />
          </div>

          <DialogFooter className="gap-3 p-4 md:p-6 flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1 rounded-full border border-border hover:bg-accent bg-muted text-foreground"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0"
            >
              {loading ? 'Usuwam...' : 'Usuń konto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
