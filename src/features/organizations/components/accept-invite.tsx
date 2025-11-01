"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { R2Image } from '@/src/components/ui/r2-image'

interface AcceptInvitePageProps {
  code: string
}

export function AcceptInvitePage ({ code }: AcceptInvitePageProps) {
  const router = useRouter()
  const { userId: clerkId, isSignedIn } = useAuth()

  const invite = useQuery(
    api.organizations.queries.index.getInviteLinkByCode,
    code ? { code } : ('skip' as unknown as { code: string }),
  )

  const currentUser = useQuery(
    api.users.queries.index.getCurrentUser,
    clerkId ? { clerkId } : ('skip' as unknown as { clerkId: string }),
  )

  const joinOrganization = useMutation(
    api.organizations.mutations.index.joinOrganization,
  )

  const [submitting, setSubmitting] = useState(false)
  const loading = invite === undefined

  const orgName = invite?.organizationInfo?.name || 'Organization'
  const orgSlug = invite?.organizationInfo?.slug
  const logoKey = invite?.organizationInfo?.logo
  const expiresAt = invite?.expiresAt

  const expired = useMemo(() => {
    if (!expiresAt) return false
    return expiresAt < Date.now()
  }, [expiresAt])

  async function handleAccept () {
    if (!invite || !currentUser) return
    try {
      setSubmitting(true)
      await joinOrganization({ inviteCode: code, userId: currentUser._id })
      if (orgSlug) {
        router.replace(`/o/${orgSlug}`)
      } else {
        router.replace('/organizations')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.toLowerCase().includes('already a member')) {
        if (orgSlug) router.replace(`/o/${orgSlug}`)
        else router.replace('/organizations')
        return
      }
      // Fallback: stay on page
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-3 py-10">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>Accept invitation</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="h-10 w-10 rounded bg-secondary animate-pulse" />
              <div className="h-5 w-40 rounded bg-secondary animate-pulse" />
              <div className="h-4 w-full rounded bg-secondary animate-pulse" />
            </div>
          ) : !invite || expired ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto h-10 w-10 rounded bg-secondary" />
              <div className="text-lg font-medium">Invalid or expired invite</div>
              <p className="text-sm text-muted-foreground">
                The invitation link is no longer valid. Ask the admin for a new
                link.
              </p>
              <div className="pt-2">
                <Link href="/organizations">
                  <Button variant="outline">Go to organizations</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded border bg-secondary">
                  {logoKey ? (
                    <R2Image
                      fileKey={logoKey}
                      alt={`${orgName} logo`}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center text-sm font-medium">
                      {orgName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">You are invited to</div>
                  <div className="text-lg font-semibold">{orgName}</div>
                  {orgSlug && (
                    <div className="text-xs text-muted-foreground">/{orgSlug}</div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Invite code:</span>{' '}
                  <span className="font-mono">{code}</span>
                </div>
                {expiresAt ? (
                  <div className="text-muted-foreground">
                    Expires:{' '}
                    {new Date(expiresAt).toLocaleString()}
                  </div>
                ) : (
                  <div className="text-muted-foreground">No expiration</div>
                )}
              </div>

              {!isSignedIn ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Please sign in to accept this invitation.
                  </div>
                  <Link href={`/sign-in?redirect_url=/invite/${code}`}>
                    <Button className="w-full">Sign in</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleAccept}
                    disabled={submitting || !currentUser}
                  >
                    {submitting ? 'Accepting…' : 'Accept invite'}
                  </Button>
                  <Link href="/organizations">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




