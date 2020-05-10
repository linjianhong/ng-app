
/** 弹框指令 */
!(function (window, undefined) {

  var theModule = angular.module('dj-view');

  theModule.directive('onPopClose', function () {
    return {
      restrict: 'AE',
      scope: {
        onPopClose: "&"
      },
      controller: ['$scope', '$rootScope', '$q', function ctrl($scope, $rootScope, $q) {
        // 监听url变化：关闭对话框
        $scope.$on("$locationChangeStart", function (event) {
          console.log("locationChangeStart");
          event.preventDefault();
          $scope.onPopClose({ $reson: "locationChangeStart" });
        });
      }]
    }
  });


  theModule.directive('popDialog', function () {
    return {
      restrict: 'A',
      template: `<ng-transclude ng-if="popDialog"></ng-transclude>`,
      transclude: true,
      scope: {
        popDialog: "="
      },
      controller: ['$scope', '$rootScope', '$q', function ctrl($scope, $rootScope, $q) {
        // 监听url变化：关闭对话框
        $scope.$on("$locationChangeStart", function (event) {
          if (!$scope.popDialog) return;
          console.log("locationChangeStart");
          event.preventDefault();
          $scope.popDialog = false;
        });
      }]
    }
  });

})(window);