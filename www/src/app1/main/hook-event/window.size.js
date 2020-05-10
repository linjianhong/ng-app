!(function (angular, window, undefined) {

  var theModule = angular.module('dj-view');

  /**
   * 窗口尺寸改变
   */
  theModule.run(['$rootScope', function ($rootScope) {
    window.onresize = function(event){
      // console.log("窗口尺寸改变, ", event);
      $rootScope.$broadcast("window-resize", event);
    }
  }]);

})(angular, window);
