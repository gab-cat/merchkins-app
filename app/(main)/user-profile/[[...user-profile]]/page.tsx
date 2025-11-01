'use client'

import { UserProfile } from '@clerk/nextjs'
import { MessageSquare, Ticket, Building2, User as UserIcon, Package } from 'lucide-react'
import { ChatsPage, TicketsPage, OrganizationsPage, AccountPage } from '@/src/features/common/components/user-profile-pages'

export default function UserProfilePage() {
  return (
    <UserProfile>
      <UserProfile.Page label="Chat" url="chats" labelIcon={<MessageSquare className="h-4 w-4" />}>
        <ChatsPage />
      </UserProfile.Page>
      <UserProfile.Page label="Tickets" url="tickets" labelIcon={<Ticket className="h-4 w-4" />}>
        <TicketsPage />
      </UserProfile.Page>
      <UserProfile.Page label="Organizations" url="organizations" labelIcon={<Building2 className="h-4 w-4" />}>
        <OrganizationsPage />
      </UserProfile.Page>
      <UserProfile.Page label="Account" url="account" labelIcon={<UserIcon className="h-4 w-4" />}>
        <AccountPage />
      </UserProfile.Page>
      <UserProfile.Link url="/orders" label="My Orders" labelIcon={<Package className="h-4 w-4" />} />
    </UserProfile>
  )
}
