;
angular.module("my-view", ["dj.router"]).run(["$http", "sign", "DjRouter", function ($http, sign, DjRouter) {

  /** 路由配置 */angular.module("my", ["dj.router"])
    DjRouter
      .when("my", "home")
      .when("a", "page1")
      .when("b", "page2")
      .otherwise("home");

  /** 系统参数 */
  sign.registerHttpHook({
    match: /^系统参数$/,
    hookRequest: function (config, mockResponse, match) {
      return mockResponse(window.theSiteConfig.codes && window.theSiteConfig || $http.post("缓存请求", { api: "app/site", delay: 6e5 }).then(json => json.datas));
    }
  });

}]);