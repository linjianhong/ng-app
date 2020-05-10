!(function (angular, window, undefined) {

  var theConfigModule = angular.module('dj-view');


  /** 路由监听 */
  theConfigModule.run(['$rootScope', '$http', '$q', 'DjState', function ($rootScope, $http, $q, DjState) {

    /** 监听用户登录状态 */
    var LogStatus = (function () {
      var LogStatus = {
        isLogged: false
      }
      $rootScope.$on("用户登录状态", (event, status) => {
        // console.log("监听用户登录状态", status);
        LogStatus.isLogged = !!status.mode;
      });
      LogStatus.recheck = function () {
        return $http.post("用户登录/状态").then(tokenData => {
          // console.log("用户登录/状态", tokenData);
          return LogStatus.isLogged = true;
        }).catch(e => {
          return LogStatus.isLogged = false;
        });
      }
      LogStatus.recheck();
      return LogStatus
    })();


    /** 是否要求登录 */
    function checkNeedLogin(state) {
      if (checkNeedLogin.loginPaths.indexOf(state.path) >= 0) return false;
      var requireLogin = state.requireLogin;
      if (angular.isFunction(requireLogin)) {
        requireLogin = requireLogin(DjState);
      }
      if (requireLogin === false) return false;
      if (!requireLogin) return true; // 不是 false 的其它情况
      return requireLogin;
    }
    checkNeedLogin.loginPaths = [
      "wx-code-login"
    ];


    /** 路由监听，微信分享 */
    $rootScope.$on("$DjPageNavgateStart", function (event, newPage, oldPage) {
      var param = (newPage.component || {}).param || {};

      /** 微信分享 */
      var wxShareParam = param.wxShareParam;
      console.log("微信分享", wxShareParam);
      if (wxShareParam !== false) {
        if (angular.isFunction(wxShareParam)) wxShareParam = wxShareParam(newPage, $http, $q);
        if (!wxShareParam) {
          // console.log("使用默认分享", wxShareParam);
          $http.post("WxJssdk/setShare", {
            title: "仙龙山古典家具一物一码系统", // 分享标题
            desc: "一物一器，专享定制", // 分享描述
            link: location.origin + location.pathname + "#/my", // 分享链接
            imgUrl: "httpS://jdyhy.oss-cn-beijing.aliyuncs.com/www/store/assert/images/xls.logo.png", // 分享图标
            img_url: "httpS://jdyhy.oss-cn-beijing.aliyuncs.com/www/store/assert/images/xls.logo.png", // 分享图标
            type: 'link', // 分享类型,music、video或link，不填默认为link
            success: function (res) {
              console.log("默认分享成功", res);
              deferAppMessage.resolve(res);
            },
            cancel: function (res) {
              console.log("默认分享失败", res);
              deferAppMessage.reject(res);
            }
          }).then(json => {
            // console.log("分享成功", json);
          }).catch(json => {
            // console.error("分享错误", json);
          });
        } else {
          console.log("指定分享", wxShareParam);
          $q.when(wxShareParam).then(wxShareParam => {
            console.log("指定分享， wxShareParam=", wxShareParam);
            $http.post("WxJssdk/setShare", wxShareParam);
          });
        }
      }


    });


    /** 路由监听 */
    $rootScope.$on('$DjRouteChangeStart', function (event, newState, oldState) {
      LogStatus.recheck();



      var needLogin = checkNeedLogin(newState);
      // console.log("DjRouteChangeStart", newState, oldState);

      if (!newState || !angular.equals(newState, oldState)) {
        if (needLogin && !LogStatus.isLogged) {
          console.log("需要登录", newState, "event=", event);
          event.preventDefault();

          return DjState.go(
            /** 检查登录状态 */
            $http.post("用户登录/状态").then(tokenData => {
              LogStatus.isLogged = true;
              return newState;
            }).catch(e => {
              LogStatus.isLogged = false;
              return $http.post("自动微信登录", { newState });
            })
          );
        }
      }
    });
  }]);

  /** 微信登录成功，监听 */
  theConfigModule.run(['$rootScope', '$timeout', 'DjState', function ($rootScope, $timeout, DjState) {
    $rootScope.$on("$wxCodeLoginSuccess", function (event, data) {
      console.log("收到：微信登录成功， data = ", data);
      $timeout(() => {
        DjState.replace(data.hash, {}, 1000, "要显示页面");
      })
    });
  }]);

})(angular, window);
