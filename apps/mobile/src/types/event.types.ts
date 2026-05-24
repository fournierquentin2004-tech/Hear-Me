// ============================================================
// HEAR ME — Types événements & billetterie
// ============================================================

export type EventType = 'concert' | 'festival' | 'nightclub'

export type TicketStatus = 'valid' | 'used' | 'refunded' | 'expired'

export interface Event {
  id: string
  name: string
  type: EventType
  description: string
  venue_name: string
  venue_address: string
  city: string
  latitude: number
  longitude: number
  date: string             // ISO 8601
  doors_open?: string
  music_styles: string[]   // styles musicaux de l'événement
  artists: string[]        // artistes qui jouent
  cover_image_url: string
  price_cents: number      // en centimes
  total_capacity: number
  available_tickets: number
  is_active: boolean
  created_at: string
}

export interface Ticket {
  id: string
  event_id: string
  buyer_id: string
  quantity: number         // 1 ou 2 (pour soi + match)
  total_price_cents: number
  stripe_payment_intent_id: string
  status: TicketStatus
  qr_code: string          // valeur du QR code
  purchased_at: string
  refund_deadline: string  // purchased_at + 72h
}

export interface DuoRequest {
  id: string
  event_id: string
  user_id: string
  status: 'open' | 'matched' | 'cancelled'
  created_at: string
}

// --- Partenaires bars ---
export interface BarPartner {
  id: string
  name: string
  address: string
  city: string
  description: string
  logo_url: string
  cover_image_url: string
  music_styles: string[]
  offers: BarOffer[]
  subscription_active: boolean
  clients_sent_count: number  // suivi back office
}

export interface BarOffer {
  id: string
  bar_id: string
  title: string
  description: string
  qr_code: string
  valid_until?: string
  is_active: boolean
}
