// Lemon Squeezy → Supabase: keeps public.subscriptions in step with billing.
// Deploy: supabase functions deploy lemonsqueezy-webhook --no-verify-jwt
// Secret: supabase secrets set LEMONSQUEEZY_WEBHOOK_SECRET=...
import { createClient } from 'npm:@supabase/supabase-js@2';

const WEBHOOK_SECRET = Deno.env.get('LEMONSQUEEZY_WEBHOOK_SECRET') ?? '';
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

async function validSignature(body: string, signature: string): Promise<boolean> {
  if (!WEBHOOK_SECRET || !signature) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body)));
  const expected = Array.from(mac, (b) => b.toString(16).padStart(2, '0')).join('');
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const body = await req.text();
  if (!(await validSignature(body, req.headers.get('x-signature') ?? ''))) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(body);
  const eventName: string = event.meta?.event_name ?? '';
  // Only subscription objects carry the status we store; invoices etc. are acknowledged and skipped.
  if (!eventName.startsWith('subscription_') || event.data?.type !== 'subscriptions') {
    return new Response('Ignored', { status: 200 });
  }

  const userId: string | undefined = event.meta?.custom_data?.user_id;
  if (!userId) return new Response('Missing custom_data.user_id', { status: 400 });

  const a = event.data.attributes;
  const { error } = await admin.from('subscriptions').upsert({
    user_id: userId,
    status: a.status,
    current_period_end: a.ends_at ?? a.renews_at ?? null,
    provider: 'lemonsqueezy',
    customer_id: String(a.customer_id),
    subscription_id: String(event.data.id),
    variant_id: String(a.variant_id),
    portal_url: a.urls?.customer_portal ?? null,
    update_payment_url: a.urls?.update_payment_method ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('subscriptions upsert failed', error);
    return new Response('Database error', { status: 500 }); // Lemon Squeezy retries on 5xx
  }
  return new Response('OK', { status: 200 });
});
