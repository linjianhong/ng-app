
!(function (window, angular, undefined) {

  var theModule = angular.module('dj-ui');

  theModule.directive('money', [function () {
    return function (scope, element, attrs) {
      element.addClass("flex-bottom")
      attrs.$observe('money', function (value) {
        if (!value) return element.html("");
        var money = ("¥ " + (+value || 0).toFixed(2) + "").split(".");
        element.html(`${money[0]}<span class='em-06 b-300'>.${money[1]}</span>`)
      });
    };
  }]);
  
  theModule.directive('number2', [function () {
    return function (scope, element, attrs) {
      element.addClass("flex-bottom")
      attrs.$observe('number2', function (value) {
        if (!value) return element.html("");
        var money = ( (+value || 0).toFixed(2) + "").split(".");
        element.html(`<span><span>${money[0]}</span><span class='em-06 b-300'>.${money[1]}</span></span>`)
      });
    };
  }]);

})(window, angular);