// Deletes the signed-in user's account and cloud data (GDPR "right to erasure").
// Cancels their Lemon Squeezy subscription first when LEMONSQUEEZY_API_KEY is set.
// Deploy: supabase functions deploy delete-account
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const url = Deno.env.get('SUPABASE_URL')!;
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const LS_API_KEY = Deno.env.get('LEMONSQUEEZY_API_KEY') ?? '';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: 'Not signed in' }, 401);

  const { data: sub } = await admin.from('subscriptions').select('subscription_id, status').eq('user_id', user.id).maybeSingle();
  if (sub?.subscription_id && LS_API_KEY && !['cancelled', 'expired'].includes(sub.status)) {
    const res = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${sub.subscription_id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${LS_API_KEY}`, Accept: 'application/vnd.api+json' },
    });
    if (!res.ok && res.status !== 404) return json({ error: 'Could not cancel the subscription — please cancel it from Manage billing first' }, 502);
  }

  // hq_state and subscriptions rows are removed by ON DELETE CASCADE.
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
});
