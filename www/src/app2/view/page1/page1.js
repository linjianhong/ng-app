/** 页面1
 * hash: #/page1
 * component: page-page1
 * 微信分享: 自动
 */
!(function (angular, window, undefined) {

  angular.module("my-view").component("pagePage1", {
    pageTitle: "这是页面1",
    requireLogin: true,
    pageCss: "bk-d",
    footer: { hide: false },
    template: `
      <div class="em20 padding-3">{{text}} </div>`,
    controller: ["$scope", "$http", "DjState", "$q", function ctrl($scope, $http, DjState, $q) {
      $scope.text ="This page 1.";
    }]
  });
})(angular, window);
