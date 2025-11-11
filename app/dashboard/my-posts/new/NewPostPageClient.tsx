'use client'

import { User } from '@supabase/supabase-js'
import { NewPostClient } from './NewPostClient'

interface NewPostPageClientProps {
  user: User
}

export function NewPostPageClient({ user }: NewPostPageClientProps) {
  return <NewPostClient />
}
