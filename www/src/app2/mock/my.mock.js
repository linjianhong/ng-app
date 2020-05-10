
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
        return mockResponse.OK({me:{
          name: "大风",
          uid: 123,
          role: "管理员",
        }});
      }
    });
  }]);

  //*/

})(angular, window);