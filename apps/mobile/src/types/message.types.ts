// ============================================================
// HEAR ME — Types messages & conversations
// ============================================================

export type MessageStatus = 'sent' | 'delivered' | 'read'

export interface Message {
  id: string
  match_id: string
  sender_id: string
  content: string
  status: MessageStatus
  is_moderated: boolean    // Perspective API
  created_at: string
}

export interface Conversation {
  match_id: string
  other_user_id: string
  other_user_name: string
  other_user_photo?: string
  last_message?: string
  last_message_at?: string
  unread_count: number
  is_blocked: boolean
}

export interface MusicalDateProposal {
  id: string
  match_id: string
  proposed_by_id: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  suggestions: EventSuggestion[]
  expires_at: string
  created_at: string
}

export interface EventSuggestion {
  event_id: string
  event_name: string
  event_date: string
  venue_name: string
  reason: string  // pourquoi cet événement est suggéré
}
