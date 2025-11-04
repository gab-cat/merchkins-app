# Chats Domain

This domain provides robust chat functionality built on the chats-related tables defined in `convex/models/chats.ts`.

## Structure

```
convex/chats/
  queries/
    index.ts
    getChatRoomById.ts
    getChatRooms.ts
    getMessages.ts
    searchChats.ts
    getTypingUsers.ts
    getUnreadCounts.ts
  mutations/
    index.ts
    createChatRoom.ts
    sendMessage.ts
    manageParticipants.ts
    manageMessage.ts
    updateTyping.ts
    updateRoom.ts
  index.ts
```

All functions follow the shared project pattern:

- Each implementation file exports an `Args` and `Handler` symbol
- Each folder has an `index.ts` that wraps them with Convex `query` or `mutation`

## Highlights

- Authentication required for all operations
- Membership checks for room access
- Embedded participants for small rooms; `chatParticipants` for large rooms
- Unread counts and typing users handled in `chatRoomState`
- Edge cases: dedupe direct rooms, validate replies, prevent adding to direct chats, robust permission checks for admin/mod actions
