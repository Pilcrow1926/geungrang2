/* worker/chzzk-proxy.js
   치지직(CHZZK) 팔로워 수 조회 프록시 — Cloudflare Worker용.

   ⚠️ Client-Id / Client-Secret은 절대 이 파일에 직접 쓰지 마세요.
   반드시 Worker의 "암호화된(Encrypted) 환경변수 / Secret"으로 등록해서 사용합니다.

   배포 방법 (Cloudflare 대시보드 기준):
     1. Workers & Pages > Create Worker 로 새 Worker를 만들고 이 파일 내용을 붙여넣기
     2. Settings > Variables and Secrets 에서 아래 3개를 "Secret"으로 추가
          CLIENT_ID      - 치지직 개발자센터에서 발급받은 Client ID
          CLIENT_SECRET  - 치지직 개발자센터에서 발급받은 Client Secret
          CHANNEL_ID     - 팔로워 수를 조회할 채널 ID
     3. 배포 후 나오는 Worker 주소(https://xxx.workers.dev)를 chzzk.js의 WORKER_URL에 넣기

   (wrangler CLI를 쓴다면: `wrangler secret put CLIENT_ID` 등으로 동일하게 등록하면 됩니다.) */

var CACHE_TTL_SECONDS = 20; // 캐시 유지 시간(초) — 너무 짧으면 치지직 API 429(Too Many Requests) 위험

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    var cache = caches.default;
    var cacheKey = new Request(request.url, request);
    var cached = await cache.match(cacheKey);
    if (cached) return cached;

    var followerCount = null;
    try {
      var res = await fetch(
        "https://openapi.chzzk.naver.com/open/v1/channels?channelIds=" + env.CHANNEL_ID,
        {
          headers: {
            "Client-Id": env.CLIENT_ID,
            "Client-Secret": env.CLIENT_SECRET,
          },
        }
      );

      if (!res.ok) {
        return jsonResponse({ error: "chzzk api " + res.status }, 502);
      }

      var data = await res.json();
      var channel = data && data.content && data.content.data && data.content.data[0];
      followerCount = channel ? channel.followerCount : null;
    } catch (err) {
      return jsonResponse({ error: "fetch failed" }, 502);
    }

    var response = jsonResponse({ followerCount: followerCount }, 200, CACHE_TTL_SECONDS);
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  },
};

function jsonResponse(body, status, cacheSeconds) {
  var headers = corsHeaders();
  headers.set("Content-Type", "application/json");
  if (cacheSeconds) {
    headers.set("Cache-Control", "public, max-age=" + cacheSeconds);
  }
  return new Response(JSON.stringify(body), { status: status, headers: headers });
}

function corsHeaders() {
  return new Headers({
    "Access-Control-Allow-Origin": "*", // 배포 후에는 실제 사이트 도메인으로 제한하는 걸 권장해요
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  });
}
