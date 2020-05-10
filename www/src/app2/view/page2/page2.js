/** 页面1
 * hash: #/page1
 * component: page-page1
 * 微信分享: 在 controller 中自定义
 */
!(function (angular, window, undefined) {

  angular.module("my-view").component("pagePage2", {
    pageTitle: "这是页面2",
    requireLogin: true,
    pageCss: "bk-d",
    footer: { hide: false },
    template: `
      <div class="em20 padding-3">{{text}} </div>
      <div class="em20 padding-3">页面参数: {{search}} </div>`,
    controller: ["$scope", "$http", "DjState", "DjRouter", function ctrl($scope, $http, DjState, DjRouter) {
      $scope.text = "This page 2.";

      var search = $scope.search = DjRouter.$search;

      setTimeout(() => {
        $http.post("WxJssdk/setShare", {
          title: "页面2", // 分享标题
          desc: JSON.stringify(search), // 分享描述
          link: location.href, // 分享链接
          imgUrl: "httpS://jdyhy.oss-cn-beijing.aliyuncs.com/www/store/assert/images/xls.logo.png", // 分享图标
          type: 'link', // 分享类型,music、video或link，不填默认为link
        });
      }, 100);
    }]
  });
})(angular, window);
