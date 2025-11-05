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
          variant="outline"
          className="rounded-full border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 hover:border-red-500/50 whitespace-nowrap"
        >
          Usuń konto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border border-border rounded-3xl bg-card shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-600">Usuń konto</DialogTitle>
          <DialogDescription className="text-base text-red-700">
            ⚠️ Ta akcja jest nieodwracalna. Wszystkie twoje dane zostaną permanentnie usunięte.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-5 py-4">
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
                className="rounded-2xl border border-red-200 h-12 focus:border-red-400"
              />
              <p className="text-xs text-red-600">Potwierdź swoją tożsamość</p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="confirmation" className="text-base font-semibold text-foreground">
                Wpisz <span className="font-bold text-red-600">USUŃ KONTO</span> aby potwierdzić
              </Label>
              <Input
                id="confirmation"
                name="confirmation"
                type="text"
                required
                placeholder="USUŃ KONTO"
                disabled={loading}
                className="rounded-2xl border border-red-200 h-12 focus:border-red-400"
              />
              <p className="text-xs text-red-600">To działanie jest nieodwracalne!</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t-2 border-red-500/20">
            <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="rounded-full border border-border hover:border-brand hover:bg-brand/10"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {loading ? 'Usuwam...' : 'Usuń konto'}
            </Button>
          </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
