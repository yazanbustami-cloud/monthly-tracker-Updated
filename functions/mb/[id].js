// Metabase public-question CSV proxy. Only whitelisted question UUIDs are served.
// Demand & Growth Tracker (index.html): core cards refresh every 5 min (cache 300 s);
// heavy analysis cards (churn, churn risk, promo ROI) are cached for 1 hour.
// Marketing & CS dashboard (marketing.html) UUIDs are kept so both pages share this function.

const ALLOWED = new Set([
  // Demand tracker: core
  'f05c4250-a418-4870-927b-5277d5e1b219', // segMonthly
  'cedc5e09-682a-4dd5-aefb-59863ab38904', // zone
  'a7cf8c63-a5fe-4538-8022-ffd06559283a', // segDaily
  '38977fbc-5e92-4921-99aa-d13e96996c3d', // uni
  'ea628db4-e363-472a-aa69-e65805d6af27', // funnel
  // Demand tracker: November additions
  'bb8ce4a1-7101-4674-bb61-7b009a872be9', // wow (same-time WoW v4)
  '1c71c594-73ec-439c-99c1-c48240cdeaa0', // dayHour (day periods v1)
  '27c24508-755b-43c0-99e7-fb930abae6f2', // eta (ETA conversion v3)
  'ae43b45c-ffad-4d1a-a28a-0cbac4190721', // ratings (trend v1)
  '1fbfb0b7-bbde-4f95-aa01-4845fd272392', // badDrivers (repeated bad ratings v1b)
  'd757e8a2-9324-4ae3-9ae0-382611413816', // payments (v2)
  '9fd31937-06e7-47c3-87e0-d25c64aec450', // churn (churned users v4)
  '4117bdd6-03b6-4a3b-a6f9-0b686987d75a', // unserved (v1)
  'cef4ffc2-c0ad-4215-ad54-a3f4e64b5da2', // churnRisk (scoring v1)
  'b352a537-8903-46a0-8a50-ddd307330922', // promoRoi (v4)
  // Marketing & CS dashboard
  'be4148ba-35eb-4f05-bdb0-826be3a6c25d', // users
  '3db1b2bb-1b23-4626-8863-5bab1fb4f14c', // regs
  '6080be6e-1142-425e-9734-e45cbd5bf665', // homeZone
  '7832bbbc-bf2e-490c-828d-4726a9e6ef38', // promo
  '92ad4934-2ece-4278-a684-d1e3b33b0087', // uniHour
  '6db21c3b-a84b-4ec1-a110-4519ac1aabd5', // uniSum
  '7de78d55-3dc9-4f19-987b-97610a598615'  // retention
]);

const LONG_CACHE = new Set([
  '9fd31937-06e7-47c3-87e0-d25c64aec450',
  'cef4ffc2-c0ad-4215-ad54-a3f4e64b5da2',
  'b352a537-8903-46a0-8a50-ddd307330922'
]);

export async function onRequestGet({ params }) {
  const id = String(params.id || '').toLowerCase();
  if (!ALLOWED.has(id)) return new Response('Unknown question', { status: 404 });
  const ttl = LONG_CACHE.has(id) ? 3600 : 300;
  const r = await fetch(`https://analytics.riden.app/public/question/${id}.csv`, {
    redirect: 'follow',
    cf: { cacheTtl: ttl, cacheEverything: true }
  });
  if (!r.ok) return new Response(`Metabase returned ${r.status}`, { status: 502 });
  return new Response(r.body, {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'cache-control': `public, max-age=${ttl}` }
  });
}
