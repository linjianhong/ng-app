!(function (window, angular, undefined) {
  /**
   * 用户登录总控模块
   *
   * 功能：
   * 1. 请求登录 $http.post("用户登录/请求登录", {mode: "手机验证码登录"}).then(...)
   * 2. 清除登录 $http.post("用户登录/清除登录").then(...)
   * 3. 查询用户登录状态 $http.post("用户登录/状态").then(tokenData=>{})
   * 4. 提供api签名承诺 $http.post("用户登录/签名").then(signDatas => { })
   * 5. 等待登录成功 $http.post("用户登录/等待登录成功").then(promise => { promise.then(tokenData=>{})})
   * 6. 自动发布登录状态改变
   * 7. 登录模式兼容
   *
   * 请求方式：
   * 1. $http.post("用户登录/状态").then(...)
   * 2. $http.post("用户登录", "状态").then(...)
   *
   * 登录状态监听：
   * $rootScope.$on("用户登录状态", (event, status)=>{
   *   var isLogged = !!status.mode;
   *   var token_data = status.data;
   * })
   */

  var theSiteConfig = window.theSiteConfig = angular.extend({
    localStorage_KEY_UserToken: "__jdyhy_user_token__"
  }, window.theSiteConfig);


  var theModule = angular.module("dj-login");

  /**
   * 基本的用户登录票据和签名方法
   */
  var UserToken = (function () {
    var UserToken = {
      data: {},
      timestampOffset: 0, // 时间偏差
      /** 加载 */
      load: function () {
        var k = theSiteConfig.localStorage_KEY_UserToken;
        var str = localStorage.getItem(k) || "{}";
        if (!/^\{.*\}/.test(str)) str = "{}"
        UserToken.data = JSON.parse(str);
        return UserToken;
      },
      /** 保存到 */
      save: function (data) {
        var k = theSiteConfig.localStorage_KEY_UserToken;
        localStorage.removeItem(k);
        localStorage.setItem(k, JSON.stringify(UserToken.data = data || {}));
        return UserToken;
      },
      copyToken: function () {
        return angular.merge({}, UserToken.data);
      },
      hasToken: function (data) {
        data = data || UserToken.load().data;
        return data && data.tokenid && data.token;
      },
      /** 校准与服务器的时间偏差 */
      adjustTimestamp: function (timestampServer) {
        var dt = new Date();
        var timestampHere = Math.round((dt.getTime() / 1000));
        UserToken.timestampOffset = timestampServer - timestampHere;
      },
      /** 用于 http 签名 */
      signToken: function (tokenData) {
        if (!tokenData) {
          UserToken.load()
          tokenData = UserToken.data
        }
        var tokenid = tokenData.tokenid;
        var token = tokenData.token;
        var phone = tokenData.phone;
        var uid = tokenData.uid;
        if (!tokenid || !token) {
          return {};
        }
        var dt = new Date();
        var timestamp = Math.round((dt.getTime() / 1000));
        timestamp += UserToken.timestampOffset; // 修正误差
        var sign = md5(token + timestamp);
        var r = { tokenid, timestamp, sign }
        if (phone) r.phone = phone;
        if (uid) r.uid = uid;
        return r;
      },
    };
    return UserToken;
  })();

  /** 用户登录票据, 工厂模式 */
  theModule.factory("UserToken", ["$q", function ($q) {
    return UserToken;
  }]);

  /**
   * 对时
   */
  theModule.run(["$http", function ($http) {
    $http.post("系统参数").then(json_datas => {
      // console.log("对时", json);
      UserToken.adjustTimestamp(json_datas.timestamp);
    });
  }]);


  /**
   * 后台提示: 登录票据无效
   */
  theModule.run(["$rootScope", "$http", "$q", "sign", function ($rootScope, $http, $q, sign) {

    var E_NEED_LOGIN = 1;
    var errorTokenTimes = 0;

    var oldResponseHook = sign.registerDefaultResponseHook((response, $q) => {
      var json = response.data;
      if (json && +json.errcode === E_NEED_LOGIN && UserToken.hasToken()) {
        if (++errorTokenTimes > 1) {
          UserToken.save({});
          $rootScope.$broadcast("用户登录状态", { mode: false, reason: "登录票据无效" });
        }
        return $q.reject("登录票据无效");
      }
      else {
        errorTokenTimes = 0;
      }
      return oldResponseHook(response, $q);
    });
  }]);


  /**
   * 请求拦截
   */
  theModule.run(["$rootScope", "$http", "$q", "sign", function ($rootScope, $http, $q, sign) {

    var FN = {

      "开始登录": function (param) {
        if (!FN["正在登录_defer"]) FN["正在登录_defer"] = $q.defer();
        FN["正在登录_promise"] = FN["正在登录_defer"].promise;
        return FN["正在登录_promise"];
      },
      "登录成功": function (data) {
        if (!FN["正在登录_defer"]) return;
        FN["正在登录_defer"].resolve(data);
        FN["正在登录_promise"] = false;
      },
      "登录失败": function (data) {
        if (!FN["正在登录_defer"]) return;
        FN["正在登录_defer"].reject(data);
        FN["正在登录_promise"] = false;
      },


      call: function (name, data) { return FN[name](data); },

      "状态": function () {
        if (UserToken.hasToken()) {
          return UserToken.copyToken();
        }
        if (!FN["正在登录_promise"]) return $q.reject("状态: 未登录");
        return $q.when(FN["正在登录_promise"]);
      },

      "等待登录成功": function () {
        if (UserToken.hasToken()) {
          return $q.when(UserToken.copyToken());
        }
        var defer = $q.defer();
        $rootScope.$on("用户登录状态", (event, status) => {
          var isLogged = !!status.mode;
          if (isLogged) defer.resolve(status.tokenData);
        });
        setTimeout(() => {
          if (UserToken.hasToken()) {
            defer.resolve(tokenData);
          }
        }, 2000);
        return defer.promise;
      },

      "请求登录": function (param) {
        console.log("请求登录, param=", param);
        FN["开始登录"]();
        var mode = param && param.mode;
        if (!mode) return FN.call("状态");
        return $http.post(`自定义登录-${param.mode}`, param.data).then(json => {
          var token = json.token || json.datas.token;
          /** 登录失败，不破坏原登录状态 */
          if (!UserToken.hasToken(token)) {
            // $rootScope.$broadcast("用户登录状态", { mode: false, prompt: "登录失败" });
            FN["登录失败"]("票据无效");
            return $q.reject("登录失败");
          }
          /** 登录成功 */
          UserToken.save(token);
          var tokenData = UserToken.copyToken();
          $rootScope.$broadcast("用户登录状态", { mode, tokenData });
          FN["登录成功"](tokenData);
          return tokenData;
        }).catch(e => {
          console.log("请求登录失败, e", e, ",param=", param);
          return $q.reject(e);
        });
      },

      "清除登录": function (param) {
        var tokenData = UserToken.copyToken();
        $rootScope.$broadcast("用户即将退出登录", tokenData);
        UserToken.save({});
        $rootScope.$broadcast("用户登录状态", { oldTokenData: tokenData, mode: false });
      },

      "签名": function (param) {
        if (!UserToken.hasToken(param)) {
          return $q.reject("未登录");
        }
        return UserToken.signToken(param);
      },
    }

    sign.registerHttpHook({
      match: /^用户登录(\/(.*))?$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        var fn = match[2] || param;
        if (!FN[fn]) return mockResponse.reject("用户登录-非法请求");

        return mockResponse(FN[fn](param));
      }
    });

    sign.registerHttpHook({
      match: /^uid$/,
      hookRequest: function (config, mockResponse, match) {
        return mockResponse(UserToken.data.uid);
      }
    });
  }]);


  /**
   * 程序开始, 自动发布一次用户登录成功
   */
  theModule.run(["$http", function ($http) {
    $http.post("用户登录/状态").then(tokenData => {
      $rootScope.$broadcast("用户登录状态", { mode: "程序开始", tokenData });
    }).catch(e => {
      $rootScope.$broadcast("用户登录状态", { mode: false, reason: e });
    });
  }]);

})(window, angular);
