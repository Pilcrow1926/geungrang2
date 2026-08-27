/* followers.js
   긍랑 팔로워 현황 데이터.
   실제 팔로워 수가 바뀌면 아래 current 값만 수정하면 사이트 전체(바 채움, 현재 위치 점선, 다음 목표)에 자동 반영돼요. */
window.FollowerData = (function () {
  "use strict";

  var current = 100;   // 현재 팔로워 수
  var goalStep = 50;   // "다음은..?"을 눌렀을 때 목표가 늘어나는 단위
  var listeners = [];  // current가 바뀔 때 알림을 받을 콜백들 (예: 치지직 API 연동)

  // 다음 목표는 현재 값을 기준으로 계산돼요.
  // 예: current가 100이면 150, 나중에 current가 120으로 바뀌어도 항상 current + goalStep(170)이 되어 자연스럽게 따라가요.
  function nextGoal() {
    return current + goalStep;
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
    getGoalStep: function () { return goalStep; },
    setGoalStep: function (value) { goalStep = value; },
    nextGoal: nextGoal,
    fillPercent: fillPercent,
    onChange: onChange
  };
})();
