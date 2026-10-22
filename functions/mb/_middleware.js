export async function onRequest({ request, env, next }) {
  const user = env.DASH_USER;
  const pass = env.DASH_PASS;
  if (!user || !pass) {
    return new Response('Dashboard login is not configured.', { status: 503 });
  }
  const auth = request.headers.get('Authorization') || '';
  if (auth.startsWith('Basic ')) {
    let decoded = '';
    try { decoded = atob(auth.slice(6)); } catch (e) { decoded = ''; }
    const i = decoded.indexOf(':');
    if (i > -1 && safeEqual(decoded.slice(0, i), user) && safeEqual(decoded.slice(i + 1), pass)) {
      const res = await next();
      const out = new Response(res.body, res);
      out.headers.set('Cache-Control', 'private, no-store');
      return out;
    }
  }
  return new Response('Login required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Petra Ride Tracker", charset="UTF-8"',
      'Cache-Control': 'no-store'
    }
  });
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
