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
          className="rounded-full border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 whitespace-nowrap"
        >
          Usuń konto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Usuń konto</DialogTitle>
          <DialogDescription>
            Ta akcja jest nieodwracalna. Wszystkie twoje dane zostaną permanentnie usunięte.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Wpisz <span className="font-bold">USUŃ KONTO</span> aby potwierdzić
              </Label>
              <Input
                id="confirmation"
                name="confirmation"
                type="text"
                required
                placeholder="USUŃ KONTO"
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Usuwam...' : 'Usuń konto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
