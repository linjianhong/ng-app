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
    footer: { hide: true },
    template: `
      <div class="em-20 padding-3 flex-cc bb-ccc">{{text}} </div>
      <div class="em-12 padding-3">{{json}} </div>
      <div class="flex-arround bk-f">
        <div class="flex-cc padding-3" ng-click="test1()">测试1</div>
        <div class="flex-cc padding-3" ng-click="test2()">测试2</div>
        <div class="flex-cc padding-3" ng-click="test3()">测试3</div>
      </div>
      <div class="em12 flex-cc text-stop">{{error}} </div>`,
    controller: ["$scope", "$http", "DjState", "$q", function ctrl($scope, $http, DjState, $q) {
      $scope.text = "This page 1.";

      $scope.test1 = () => {
        $http.post("test/a", { a: 1 }).then(json => {
          console.log("", json);
          $scope.json = json;
          $scope.error = "";
        }).catch(e => {
          $scope.error = e.errmsg || e;
          console.error(e)
        })
      }

      $scope.test2 = () => {
        $http.post("test/b", { aaa: 1, bb: "something", cc: [1, 2, 3] }).then(json => {
          console.log("", json);
          $scope.json = json;
          $scope.error = "";
        }).catch(e => {
          $scope.error = e.errmsg || e;
          console.error(e)
        })
      }

      $scope.test3 = () => {
        $http.post("test/c", { ab: [1, 2, 3] }).then(json => {
          console.log("", json);
          $scope.json = json;
          $scope.error = "";
        }).catch(e => {
          $scope.error = e.errmsg || e;
          console.error(e)
        })
      }
    }]
  });
})(angular, window);
