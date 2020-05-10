
angular.module('dj-view', [
  'angularMoment',
  "dj.observable",
  "dj.router.frame",
]).run(["moment", function (moment) {
  moment.locale('zh-cn');
}]);

angular.module('dj-component', [
  'dj-form',
  'dj-pop'
]);

angular.module('dj-service', [
  'dj-http',
  'dj-localStorage-table',
]);

angular.module('dj-filter', [
]);

angular.module('dj-component').factory("APP", ['DjWaiteReady',
  function (DjWaiteReady) {
    return {
      DjWaiteReady
    }
  }]);
