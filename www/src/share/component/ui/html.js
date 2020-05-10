
!(function (angular, window, undefined) {

  var theModule = angular.module('dj-view');

  function myParse(obj) {
    if (angular.isNumber(obj)) return "" + obj;
    if (angular.isString(obj)) return obj;
    if (!obj) return "";
    if (!angular.isObject(obj)) return "<未知>";
    if (angular.isArray(obj)) return obj.map(item => myParse(item)).join("\n");
    var s = "";
    var arr = Object.keys(obj).map(k => {
      return k + ": " + myParse(obj[k]);
    });
    return arr.join("\n");
  }

  theModule.directive('htmlContent', function () {
    return {
      restrict: 'AE',
      scope: {
        htmlContent: "=?"
      },
      controller: ['$scope', '$element', '$q', function ctrl($scope, $element, $q) {
        $scope.$watch("htmlContent", function (vNew) {
          $q.when(vNew).then(vNew => {
            $element.html("");
            myParse(vNew).split("\n").map(text => {
              $element.append(angular.element(`<p>${text}</p>`))
            });
          });
        });
      }]
    }
  });
})(angular, window);