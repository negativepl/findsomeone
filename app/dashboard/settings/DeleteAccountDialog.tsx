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
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 md:p-6">
          <DialogTitle className="text-2xl font-bold text-red-600">Usuń konto</DialogTitle>
          <DialogDescription className="text-base text-red-700">
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
                className="rounded-2xl border border-red-200 h-12 focus:border-red-400"
              />
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

          <div className="px-4 md:px-6">
            <div className="border-t border-red-500/20" />
          </div>

          <DialogFooter className="gap-3 p-4 md:p-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="rounded-full border border-border hover:bg-muted bg-card text-foreground"
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
        </form>
      </DialogContent>
    </Dialog>
  )
}
