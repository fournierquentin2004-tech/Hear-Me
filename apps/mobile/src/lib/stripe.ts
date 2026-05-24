// ============================================================
// HEAR ME — Configuration Stripe
// Le StripeProvider est monté dans src/app/_layout.tsx
// ============================================================

export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn(
    '[Stripe] Variable EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY manquante dans .env.local'
  )
}

// URL du backend pour créer les PaymentIntents
// (endpoint Supabase Edge Function ou serveur Node.js)
export const STRIPE_BACKEND_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe`
