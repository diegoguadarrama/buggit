import { useState, useEffect } from 'react'
import { RealtimeChannel, User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { Editor } from '@tiptap/react'
import { Note } from '@/types/note'

interface Collaborator {
  id: string
  name: string | null
  color: string
  avatar?: string
}

interface PresenceState {
  id: string
  name: string | null
  color: string
  avatar?: string
  presence_ref: string
}

const getRandomColor = () => {
  const colors = [
    '#958DF1',
    '#F98181',
    '#FBBC88',
    '#FAF594',
    '#70CFF8',
    '#94FADB',
    '#B9F18D',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Helper function to get display name from user
const getDisplayName = (user: User | null): string | null => {
  if (!user) return null
  
  // Try to get name from user metadata
  const name = user.user_metadata?.full_name || user.user_metadata?.name
  if (name) return name
  
  // If no name, get username from email
  if (user.email) {
    return user.email.split('@')[0]
  }
  
  return null
}

export function useCollaboration(
  note: Note | null,
  editor: Editor | null,
  user: User | null
) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [userColor] = useState(() => getRandomColor())
  const [lastBroadcast, setLastBroadcast] = useState<string>('')

  useEffect(() => {
    if (!note || !user) return

    // Clean up previous channel if exists
    if (channel) {
      channel.unsubscribe()
    }

    // Create a new channel for the current note
    const newChannel = supabase.channel(`note-${note.id}`, {
      config: {
        broadcast: {
          self: false,
        },
      },
    })

    // Handle presence state
    newChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = newChannel.presenceState()
        const presenceData = Object.values(presenceState).flat() as PresenceState[]
        const collaboratorsList = presenceData.map(presence => ({
          id: presence.id,
          name: presence.name,
          color: presence.color,
          avatar: presence.avatar,
        }))
        setCollaborators(collaboratorsList)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences)
      })
      .on('broadcast', { event: 'doc-update' }, ({ payload }) => {
        if (payload.noteId === note.id && editor && payload.userId !== user.id) {
          const currentContent = editor.getHTML()
          if (currentContent !== payload.content) {
            setLastBroadcast(payload.content)
            editor.commands.setContent(payload.content)
          }
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await newChannel.track({
            id: user.id,
            name: getDisplayName(user),
            color: userColor,
            avatar: user.user_metadata?.avatar_url,
          })
        }
      })

    setChannel(newChannel)

    return () => {
      newChannel.unsubscribe()
    }
  }, [note?.id, user, editor])

  const broadcastContent = (content: string) => {
    if (content !== lastBroadcast && channel && note) {
      setLastBroadcast(content)
      channel.send({
        type: 'broadcast',
        event: 'doc-update',
        payload: {
          noteId: note.id,
          content: content,
          userId: user?.id,
        },
      })
    }
  }

  return {
    channel,
    collaborators,
    userColor,
    broadcastContent,
  }
} 