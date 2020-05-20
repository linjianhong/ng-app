
!(function (angular, window, undefined) {

  var theModule = angular.module("mock");

  /** 个人数据 */ /*
  theModule.run(["sign", "$http", function (sign, $http) {
    sign.registerHttpHook({
      match: /^我的-基本信息$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        var post = angular.extend({ api: "user/info", data: {}, delay: 1.2e6 }, param);
        // console.log("请求: 我的-基本信息, post=", post, "param=", param);
        return mockResponse($http.post("缓存请求", post));
      }
    });
  }]);

  /*/

  theModule.run(["sign", "$http", function (sign, $http) {
    sign.registerHttpHook({
      match: /^我的-基本信息$/,
      hookRequest: function (config, mockResponse, match) {
        /** 检查登录状态 */
        var mock_me = $http.post("用户登录/状态").then(tokenData => {
          return {
            me: {
              name: "大风",
              uid: 123,
              role: "管理员",
            }
          };
        }).catch(e => {
          return {
            me: {
              name: "未登录",
              uid: "---",
              role: "游客",
            }
          };
        });
        return mockResponse.OK(mock_me);
      }
    });
  }]);

  //*/

})(angular, window);