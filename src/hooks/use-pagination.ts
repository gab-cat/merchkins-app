"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'convex/react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FunctionRef = any

export interface UseOffsetPaginationOptions<TItem extends { _id?: string | number }, TArgs extends Record<string, unknown>> {
  query: FunctionRef
  baseArgs: TArgs | 'skip'
  limit?: number
  enabled?: boolean
  selectItems: (result: unknown) => ReadonlyArray<TItem>
  selectHasMore: (result: unknown) => boolean
}

export interface UseCursorPaginationOptions<TItem extends { _id?: string | number }, TArgs extends Record<string, unknown>> {
  query: FunctionRef
  baseArgs: TArgs | 'skip'
  limit?: number
  enabled?: boolean
  // Extracts the { page, isDone, continueCursor } from the query result
  selectPage: (result: unknown) => {
    page: ReadonlyArray<TItem>
    isDone: boolean
    continueCursor: string | null
  }
}

export interface PaginationResult<TItem> {
  items: ReadonlyArray<TItem>
  isLoading: boolean
  hasMore: boolean
  loadMore: () => void
  reset: () => void
}

export function useOffsetPagination<TItem extends { _id?: string | number }, TArgs extends Record<string, unknown>> (
  options: UseOffsetPaginationOptions<TItem, TArgs>,
): PaginationResult<TItem> {
  const { query, baseArgs, limit = 20, enabled = true, selectItems, selectHasMore } = options
  const [offset, setOffset] = useState(0)
  const [items, setItems] = useState<ReadonlyArray<TItem>>([])

  // Track the latest base args to know when filters changed
  const baseArgsStable = useStableValue(baseArgs)

  // Build args for this page
  const argsForQuery = useMemo(() => {
    if (baseArgsStable === 'skip') return 'skip'
    return {
      ...(baseArgsStable as TArgs),
      limit,
      offset,
    }
  }, [baseArgsStable, limit, offset])

  const result = useQuery(query, enabled ? argsForQuery : 'skip')

  const isLoading = result === undefined
  const pageItems = useMemo(() => (result ? selectItems(result) : []), [result, selectItems])
  const hasMore = useMemo(() => (result ? selectHasMore(result) : false), [result, selectHasMore])

  // Reset accumulation when filters change
  useEffect(() => {
    setOffset(0)
    setItems([])
  }, [baseArgsStable, limit])

  // Accumulate items whenever the page changes
  useEffect(() => {
    if (!result) return
    if (offset === 0) {
      setItems(pageItems)
      return
    }
    setItems(prev => dedupeById([...prev, ...pageItems]) as ReadonlyArray<TItem>)
  }, [result, offset, pageItems])

  function loadMore () {
    if (!hasMore || isLoading) return
    setOffset(prev => prev + limit)
  }

  function reset () {
    setOffset(0)
    setItems([])
  }

  return { items, isLoading, hasMore, loadMore, reset }
}

export function useCursorPagination<TItem extends { _id?: string | number }, TArgs extends Record<string, unknown>> (
  options: UseCursorPaginationOptions<TItem, TArgs>,
): PaginationResult<TItem> {
  const { query, baseArgs, limit = 20, enabled = true, selectPage } = options
  const [cursor, setCursor] = useState<string | null>(null)
  const [items, setItems] = useState<ReadonlyArray<TItem>>([])

  const baseArgsStable = useStableValue(baseArgs)

  const argsForQuery = useMemo(() => {
    if (baseArgsStable === 'skip') return 'skip'
    const base: Record<string, unknown> = {
      ...(baseArgsStable as TArgs),
      limit,
    }
    if (cursor !== null) base.cursor = cursor
    return base
  }, [baseArgsStable, limit, cursor])

  const result = useQuery(query, enabled ? argsForQuery : 'skip')
  const isLoading = result === undefined

  const page = useMemo(() => (result ? selectPage(result) : { page: [], isDone: true, continueCursor: null }), [result, selectPage])

  // Reset when filters change
  useEffect(() => {
    setCursor(null)
    setItems([])
  }, [baseArgsStable, limit])

  // Accumulate on each page
  useEffect(() => {
    if (!result) return
    if (cursor === null) {
      setItems(page.page)
      return
    }
    setItems(prev => dedupeById([...prev, ...page.page]) as ReadonlyArray<TItem>)
  }, [result, cursor, page])

  const hasMore = !page.isDone

  function loadMore () {
    if (page.isDone || isLoading) return
    setCursor(page.continueCursor)
  }

  function reset () {
    setCursor(null)
    setItems([])
  }

  return { items, isLoading, hasMore, loadMore, reset }
}

function dedupeById<T extends { _id?: string | number }> (arr: ReadonlyArray<T>): ReadonlyArray<T> {
  const seen = new Set<string | number>()
  const out: T[] = []
  for (const item of arr) {
    const key = item && item._id !== undefined ? item._id : undefined
    if (key === undefined) {
      out.push(item)
      continue
    }
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

function useStableValue<T> (value: T): T {
  const ref = useRef(value)
  const serialized = useMemo(() => JSON.stringify(value), [value])
  useEffect(() => {
    // Update only when the serialized form changes
    ref.current = value
  }, [serialized, value])
  return ref.current
}


