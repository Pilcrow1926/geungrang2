/* followers.js
   긍랑 팔로워 현황 데이터.

   - milestone: 첫 화면에서 축하하는, 이미 달성한 팔로우 수. 기본은 150이지만,
                실시간 팔로워 수(current)가 150을 넘으면 그 실제 값을 그대로 보여줘서
                더 많이 늘어났을 때 더 많이 축하하는 화면이 되도록 해요.
   - nextGoal : "다음은..?"을 눌렀을 때 보여주는 다음 목표. milestone + 50으로 항상 따라가요.
   - current : 실시간 팔로워 수 (치지직 API/chzzk.js가 setCurrent로 갱신). "다음 목표" 화면에서
               이 값이 0~nextGoal 범위 안에서 실제로 어디쯤인지 바/점선으로 보여줘요. */
window.FollowerData = (function () {
  "use strict";

  var BASE_MILESTONE = 150; // 첫 화면 기본 목표(이미 달성한 것으로 축하하는 값)
  var GOAL_STEP = 50;       // 다음 목표까지 늘어나는 간격
  var current = 150;        // 실시간 팔로워 수 (기본 목표와 맞춰서 초기 화면이 꽉 찬 상태로 시작)
  var listeners = [];       // current가 바뀔 때 알림을 받을 콜백들 (예: 치지직 API 연동)

  // 실시간 값이 기본 목표(150)를 넘으면, milestone도 그 값을 따라가요.
  function getMilestone() {
    return Math.max(BASE_MILESTONE, current);
  }

  function getNextGoal() {
    return getMilestone() + GOAL_STEP;
  }

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
    getMilestone: getMilestone,
    getNextGoal: getNextGoal,
    fillPercent: fillPercent,
    onChange: onChange
  };
})();
