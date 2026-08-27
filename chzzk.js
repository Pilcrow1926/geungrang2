/* chzzk.js
   치지직(CHZZK) 실시간 팔로워 수를 주기적으로 가져와 FollowerData에 반영해요.
   Client-Id / Client-Secret은 절대 이 파일(브라우저에서 보이는 코드)에 넣지 마세요 —
   반드시 worker/chzzk-proxy.js를 배포한 뒤, 그 프록시의 URL만 아래에 넣어주세요. */
(function () {
  "use strict";

  var WORKER_URL = "https://YOUR_WORKER_URL.workers.dev"; // 배포한 Cloudflare Worker 주소로 교체
  var POLL_INTERVAL_MS = 30000; // 30초마다 갱신 (프록시 캐시와 맞춰서 너무 짧게 하지 마세요)

  if (!WORKER_URL || WORKER_URL.indexOf("YOUR_WORKER_URL") !== -1) {
    console.info("[chzzk.js] WORKER_URL이 아직 설정되지 않아 실시간 팔로워 갱신을 건너뜁니다.");
    return;
  }

  function updateFollowerCount() {
    fetch(WORKER_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (typeof data.followerCount === "number") {
          window.FollowerData.setCurrent(data.followerCount);
        }
      })
      .catch(function (err) {
        console.error("[chzzk.js] 팔로워 수 갱신 실패:", err);
      });
  }

  updateFollowerCount();
  setInterval(updateFollowerCount, POLL_INTERVAL_MS);
})();
