/* followers.js
   긍랑 팔로워 현황 데이터.

   - milestone: 첫 화면에서 축하하는, 이미 달성한 팔로우 수 (고정값 — 실시간으로 안 바뀜)
   - nextGoal : "다음은..?"을 눌렀을 때 보여주는 다음 목표 (고정값)
   - current : 실시간 팔로워 수 (치지직 API/chzzk.js가 setCurrent로 갱신). "다음 목표" 화면에서
               이 값이 0~nextGoal 범위 안에서 실제로 어디쯤인지 바/점선으로 보여줘요. */
window.FollowerData = (function () {
  "use strict";

  var milestone = 100; // 첫 화면 고정 목표(이미 달성)
  var nextGoal = 150;  // 다음 목표 고정값
  var current = 100;   // 실시간 팔로워 수
  var listeners = [];  // current가 바뀔 때 알림을 받을 콜백들 (예: 치지직 API 연동)

  // scale(막대가 표현하는 전체 범위) 대비 current의 채움 비율(%)
  function fillPercent(scale) {
    if (!scale) return 0;
    return Math.max(0, Math.min(current / scale * 100, 100));
  }

  function setCurrent(value) {
    if (typeof value !== 'number' || isNaN(value) || value === current) return;
    current = value;
    listeners.forEach(function (fn) { fn(current); });
  }

  // 실시간 데이터 소스(예: chzzk.js)가 값을 갱신할 때마다 fn(newCurrent)가 호출돼요.
  function onChange(fn) {
    listeners.push(fn);
  }

  return {
    getCurrent: function () { return current; },
    setCurrent: setCurrent,
    getMilestone: function () { return milestone; },
    getNextGoal: function () { return nextGoal; },
    fillPercent: fillPercent,
    onChange: onChange
  };
})();
