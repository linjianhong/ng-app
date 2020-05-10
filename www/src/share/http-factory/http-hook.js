!(function (angular, window, undefined) {

  var theModule = angular.module("dj-view")



  /**
   * 请求查找 http 拦截配置
   */
  theModule.run(['sign', function (sign) {
    sign.registerHttpHook({
      match: /^http-hook$/,
      hookRequest: function (config, mockResponse, match) {
        var ajaxName = config.data;

        var hook = sign.theHttpHookRegistered.find(hook => {
          return hook.match && hook.match.toString() == `/^${ajaxName}$/`;
        });

        if (hook) return mockResponse.resolve({ hook });
        return mockResponse.reject();
      }
    });
  }]);

  /**
   * 仅仅签名
   */
  theModule.run(['$http', 'sign', function ($http, sign) {
    sign.registerHttpHook({
      match: /^签名$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        var url = param.url || param || "";
        var data = param.data || {};
        var signed = $http.post("用户登录/签名").then(signDatas => {
          return sign.OK({
            url: window.theSiteConfig.apiRoot + url,
            data: angular.extend({}, signDatas, data)
          })
        });
        return mockResponse.resolve(signed);
      }
    });
  }]);


})(angular, window);
