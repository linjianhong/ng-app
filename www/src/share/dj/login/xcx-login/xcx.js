!(function (angular, window, undefined) {

  var theModule = angular.module("dj-view");
  var isWX = (/micromessenger/i).test(navigator.userAgent);

  /** 小程序初始化
   * @example 工厂模式
   * $q.when(XCX).then(XCX => {
   *   XCX == wx.miniProgram
   * });
   * 
   * @example http请求模式
   * $http.post(XCX).then(XCX => {
   *   XCX == wx.miniProgram
   * });
   */
  var XCX;

  /** 小程序初始化, 工厂模式 */
  theModule.run(["$q", function ($q) {
    XCX = XCX || (function getXCX() {
      if (!isWX) return $q.reject("not wx");
      if (!window.wx || !wx.miniProgram || !wx.miniProgram.getEnv) return $q.reject("error Env");
      var defer = $q.defer();
      wx.miniProgram.getEnv(function (res) {
        if (res.miniProgram || res.miniprogram) {
          defer.resolve(XCX = wx.miniProgram);
        }
        else {
          defer.reject("not XCX");
        }
      });
      return defer.promise;
    })();
  }]);

  /** 小程序初始化, http 请求模式 */
  theModule.run(["$http", "$q", "sign", function ($http, $q, sign) {
    sign.registerHttpHook({
      match: /^XCX$/,
      hookRequest: function (config, mockResponse, match) {
        return mockResponse(XCX);
      }
    });
  }]);

  /**
   * 小程序默认分享
   */
  theModule.run(["$http", "$q", "sign", function ($http, $q, sign) {
    var theDefaultShare = {
      title: "默认",
      desc: "",
      imageUrl: "",
      path: ""
    };
    sign.registerHttpHook({
      match: /^小程序分享-默认$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data
        Object.keys(theDefaultShare).map(k => {
          if (angular.isString(param[k])) theDefaultShare[k] = param[k];
        })
        return mockResponse(1);
      }
    });
    sign.registerHttpHook({
      match: /^小程序分享$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        var data = angular.extend({}, theDefaultShare, param);
        console.log("小程序分享", data);
        var r = $http.post("XCX").then(miniProgram => {
          wx.miniProgram.postMessage({
            data: {
              type: "微信分享",
              data: data
            }
          });
        }).catch(e => {
          console.log("小程序分享, ERROR: ", e);
          return $q.reject(e);
        });
        return mockResponse(r);
      }
    });
  }]);

})(angular, window);
