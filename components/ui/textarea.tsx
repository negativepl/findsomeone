import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, id, name, ...props }: React.ComponentProps<"textarea">) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  // Automatycznie użyj 'id' jako 'name' jeśli 'name' nie jest podany
  const textareaName = name || id

  // Auto-resize funkcjonalność dla wszystkich przeglądarek
  const handleInput = React.useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`

    // Wywołaj oryginalny onInput jeśli istnieje
    if (props.onInput) {
      props.onInput(e)
    }
  }, [props.onInput])

  // Ustaw wysokość po montowaniu i przy zmianie wartości
  React.useEffect(() => {
    if (textareaRef.current && (props.value || props.defaultValue)) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [props.value, props.defaultValue])

  return (
    <textarea
      ref={textareaRef}
      id={id}
      name={textareaName}
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden md:text-sm",
        className
      )}
      onInput={handleInput}
      {...props}
    />
  )
}

export { Textarea }
