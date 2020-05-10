/** 小程序code登录
 * @requires 系统参数.appname_xcx {string} 微信小程序的 app 名称，后台登录时的参数
 */
!(function (angular, window, undefined) {

  var theModule = angular.module("dj-view");

  /**
   * $http 拦截
   */
  theModule.run([
    "$rootScope",
    "$http",
    "$q",
    "sign",
    function ($rootScope, $http, $q, sign) {

      sign.registerHttpHook({
        match: /^自定义登录-小程序code登录$/,
        hookRequest: function (config, mockResponse, match) {
          var param = config.data;
          console.log("小程序code登录, param=", param);
          var code = param.code;
          var login = $http.post("系统参数").then(json_datas => json_datas.app_wx_xcx).then(wx_app => {
            return $http.post("app/xcx_code_login", { code, name: wx_app.name }).then(json => {
              console.log("等待登录成功, OK! 绑定微信...", json);
              var token = json.datas;
              return { token };
            }).catch(e => {
              console.log("等待登录成功, 失败1", e);
              return $q.reject(e);
            });
          });
          return mockResponse.resolve(login);
        }
      });
    }
  ]);

  theModule.component("xcxLogin", {
    template: `<div class="">{{params.code && '已得到微信标识，正在登录...'|| ''}}</div>
          <div ng-if="debug">{{params}}</div>`,
    controller: [
      "$scope",
      "$rootScope",
      "$http",
      "$q",
      "$location",
      function ctrl($scope, $rootScope, $http, $q, $location) {
        $scope.debug = 0;
        var params = $scope.params = $location.search();
        var code = params.code;
        if (code) {
          $http.post("用户登录/请求登录", { mode: "小程序code登录", data: { code } }).then(json => {
            console.log("小程序code登录成功, json=", json);
            if (!$scope.debug) redirect();
          }).catch(e => {
            console.log("等待登录成功, 失败1", e)
          });
        }

        function redirect() {
          var hash = params.hash;
          if (hash) {
            hash = decodeURI(hash);
            if (hash.charAt(0) != "#") hash = "#" + hash;
          }
          console.log("hash=", hash)
          setTimeout(() => {
            window.location.replace(hash || "#/my-home");
            // window.location.hash = hash ;
          })
        }
      }
    ]
  });


})(angular, window);
