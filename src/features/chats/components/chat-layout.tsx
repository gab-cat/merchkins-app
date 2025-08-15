"use client"

import React, { PropsWithChildren } from 'react'
import { Input } from '@/components/ui/input'

interface ChatLayoutProps {
  title: string
  subtitle?: string
  sidebar?: React.ReactNode
  onSearch?: (value: string) => void
  hideRightHeader?: boolean
}

export function ChatLayout ({ title, subtitle, sidebar, onSearch, hideRightHeader, children }: PropsWithChildren<ChatLayoutProps>) {
  return (
    <div className={`grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 ${sidebar ? 'md:grid-cols-[360px_1fr]' : ''}`}>
      {sidebar && (
        <aside className="hidden min-h-0 flex-col rounded-md border md:flex">
          <div className="border-b p-3">
            <div className="text-base font-medium">Chats</div>
            {onSearch && (
              <div className="mt-2">
                <Input placeholder="Search" onChange={(e) => onSearch(e.target.value)} className="h-8" />
              </div>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {sidebar}
          </div>
        </aside>
      )}
      <section className="flex min-h-0 flex-col rounded-md border">
        {!hideRightHeader && (
          <div className="border-b p-3">
            <div className="text-base font-medium">{title}</div>
            {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </section>
    </div>
  )
}

export default ChatLayout


