/** 页面 home
 * hash: #/home
 * component: page-home
 * 微信分享: 自动
 */
!(function (angular, window, undefined) {

  angular.module("my-view").component("pageHome", {
    pageTitle: "我的 - 首页",
    requireLogin: true,
    pageCss: "bk-d",
    footer: { hide: false },
    template: `
      <div class="bk-f">
        <div class="flex padding-2 bb-ccc" ng-repeat="info in infos">
          <div class="w-em5 text-8">{{info.title}}</div>
          <div class="flex-1">{{me[info.field]}}</div>
        </div>
      </div>`,
    controller: ["$scope", "$http", "DjState", "$q", function ctrl($scope, $http, DjState, $q) {
      $scope.infos = [
        { title: "UID", field: "uid" },
        { title: "姓名", field: "name" },
        { title: "角色", field: "role" },
      ];
      $http.post("我的-基本信息").then(json => {
        console.log("json", json)
        $scope.me = json.datas.me;
      });

    }]
  });
})(angular, window);
