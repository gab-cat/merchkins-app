import * as React from "react"

import { cn } from "@/lib/utils"

interface TextareaProps extends React.ComponentProps<'textarea'> {
  autoResize?: boolean
  minRows?: number
  maxRows?: number
}

function Textarea({ className, autoResize, minRows = 3, maxRows, ...props }: TextareaProps) {
  const ref = React.useRef<HTMLTextAreaElement | null>(null)

  React.useEffect(() => {
    if (!autoResize || !ref.current) return
    const el = ref.current
    const resize = () => {
      el.style.height = 'auto'
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight || '20')
      const rows = Math.floor(el.scrollHeight / lineHeight)
      const clampedRows = Math.max(minRows, maxRows ? Math.min(rows, maxRows) : rows)
      el.style.height = `${clampedRows * lineHeight + 16}px`
    }
    resize()
    el.addEventListener('input', resize)
    return () => el.removeEventListener('input', resize)
  }, [autoResize, minRows, maxRows])

  return (
    <textarea
      ref={ref}
      rows={minRows}
      data-slot="textarea"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-white border-input w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }


