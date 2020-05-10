
!(function (angular, window, undefined) {

  var ver = "ver1";

  angular.module("dj.router", ["dj.router." + ver]);
  angular.module("dj.router.state", ["dj.router.state." + ver]);
  angular.module("dj.router.frame", ["dj.router.frame." + ver]);

  angular.module("dj.router1", ["dj.router.ver1"]);
  angular.module("dj.router2", ["dj.router.ver2"]);
})(angular, window);