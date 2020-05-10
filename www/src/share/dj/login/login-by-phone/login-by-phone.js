
!(function (window, angular, undefined) {

  var theModule = angular.module("dj-view");


  /**
   * 请求拦截
   */
  theModule.run(["$http", "$q", "sign", function ($http, $q, sign) {
    sign.registerHttpHook({
      match: /^自定义登录-手机验证码登录$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        var dlgParam = angular.extend({
          componentName: "login-form-phone",
          params: {
            backClose: 1, // 点击背景是否关闭对话框
            "class": "flex-cc"
          },
          options: {}
        }, param && param.dlgParam);
        var dlg = $http.post("显示对话框/dialog", dlgParam).then(result => {
          var token = result.token;
          return { token };
        });
        return mockResponse.resolve(dlg);
      }
    });
  }]);

})(window, angular);
