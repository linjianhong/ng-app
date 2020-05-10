
!(function (window, angular, undefined) {

  var theModule = angular.module('dj-ui');

  theModule.directive('autoSum', ["$timeout", function ($timeout) {
    return function (scope, element, attrs) {
      //console.log("自动计算", element);
      var timerId = false;
      var autoSumSelector = false;
      scope.$watch(function () {
        autoSumSelector = scope.$eval(attrs.autoSum);
        if (autoSumSelector) {
          clearTimeout(timerId)
          timerId = setTimeout(calcu, 100);
        }
      });

      function calcu() {
        //console.log("自动计算", element, scope, attrs);
        var table = element[0];
        for (; table && table.tagName.toLowerCase() != "table";) {
          table = table.parentElement;
        }
        if (!table) return;

        var td_array = table.querySelectorAll(autoSumSelector);
        var totle = 0;
        [].map.call(td_array, td => {
          totle += +td.innerText || 0;
        })
        element.html(totle);
      }
    };
  }]);

})(window, angular);