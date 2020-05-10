/** 微信模块
 *
 * @module 微信登录 依赖
 *   @if 微信内置浏览器登录
 *     @requires window.theSiteConfig.wx_app.h5.name {string} 微信公众号的 app 名称, 后台登录时的参数
 *     @requires window.theSiteConfig.wx_app.h5.appid {string} 微信公众号的 appid, 请求 code 时要附加到url参数
 *   @if 网页上用微信扫码登录
 *     @requires window.theSiteConfig.wx_app.q3.name {string} 微信第三方平台的 app 名称, 扫码后台登录时的参数
 *     @requires window.theSiteConfig.wx_app.q3.appid {string} 微信第三方平台的 appid, 请求 code 时要附加到url参数
 *
 *
 * @event $wxCodeLoginSuccess 微信code登录成功
 *   @param event angular Event, Synthetic event object.
 *   @param {object{hash, name}} data 包括登录前的一些参数
 *
 *
 *
 *
 * @example
 *  angular.module('my-app', ['dj-wx-login']).run(["$rootScope", "$http", "$location", function($rootScope, $http, $location){
 *
 *    // 登录成功后，跳转到新地址
 *    $rootScope.$on("$wxCodeLoginSuccess", function(event, data){
 *      DjState.replace(data.hash);
 *      // setTimeout(() => {
 *      //   location.hash = data.hash;
 *      // });
 *    });
 *
 *
 *    // 监听路由变化，需要登录且未登录时，前往登录
 *    var LogStatus = (function () {
 *      var LogStatus = {
 *        isLogged: false
 *      }
 *      var isLogged = false;
 *      $rootScope.$on("用户登录状态", (event, status) => {
 *        // console.log("监听用户登录状态", status);
 *        LogStatus.isLogged = !!status.mode;
 *      });
 *      LogStatus.recheck = function () {
 *        return $http.post("用户登录/状态").then(tokenData => {
 *          // console.log("用户登录/状态", tokenData);
 *          return LogStatus.isLogged = true;
 *        }).catch(e => {
 *          return LogStatus.isLogged = false;
 *        });
 *      }
 *      LogStatus.recheck();
 *      return LogStatus
 *    })();
 *    function checkNeedLogin(url) {
 *      return $location.path() != "/home";
 *    }
 *    $rootScope.$on("$locationChangeStart", function (event, newUrl, oldUrl) {
 *
 *      var needLogin = checkNeedLogin(newUrl);
 *
 *      if (needLogin && !LogStatus.isLogged && newUrl != oldUrl) {
 *        event.preventDefault();
 *        // 检查登录状态
 *        $http.post("用户登录/状态").catch(e => {
 *          LogStatus.isLogged = false;
 *          return $http.post("请求登录", { newUrl });
 *        }).then(tokenData => {
 *          LogStatus.isLogged = true;
 *          location.href = newUrl;
 *        });
 *      }
 *    });
 *
 *  }])
 *
 */  function ___() { }
!(function (angular, window, undefined) {

  /** 配置参数, code 登录前的页面 */
  const PATH_CODE = "/wx-code-login";

  /** 配置参数, code 登录的 API 请求地址
   * 携带的参数：
   * @param code
   * @param name
   */
  const API_PATH = "app/wx_code_login";

  const MODE_H5 = "微信内置浏览器登录";
  const MODE_Q3 = "微信二维码扫描登录";
  const HOOK_REQUIRE_WX_LOGIN = "自动微信登录";
  const HOOKAPI_WX_CODE_LOGIN = "微信code登录";


  var idWxLoginDiv = 'wx-lg_cnt_' + (+new Date());
  var isWx = (/micromessenger/i).test(navigator.userAgent);


  /** 通用基础模块 */
  var commonModule = angular.module("dj-wx-login-base", []);

  /** 微信浏览器模块, 登录需跳转到微信 OAuth2 页面 */
  var h5Module = angular.module("dj-wx-login-h5", ["dj-wx-login-base"]);

  /** 非微信浏览器模块, 需二维码扫描登录 */
  var q3Module = angular.module("dj-wx-login-q3", ["dj-wx-login-base"]);

  /** 兼容两种情况模块 */
  var theBothModule = angular.module("dj-wx-login", ["dj-wx-login-h5", "dj-wx-login-q3"]);


  /** 获取微信二维码登录参数
   * @param {string} hash : 在 wx-code-login 调用成功后，将跳转到的页面, 将以 state 参数同code一起返回
   * @param {string} appName : 微信公众号/第三方微信平台的自定义名称，前后端约定，替代 appid, 原文将以 app 参数同code一起返回
   *
   * 扫码登录或网页授权登录后，跳到页面：/wx-code-login?code=CODE&app=APP_NAME&state=HASH
   */
  function getAuthParam(hash, wx_app) {
    var loginHash = (/\#\!/.test(window.location.hash) ? "#!" : "#") + PATH_CODE;
    var theSiteConfig = angular.extend({}, window.theSiteConfig);
    var appid = wx_app.appid;
    var state = encodeURIComponent((hash || '').match(/^\#?(.*)/)[1]);
    var para1 = wx_app.name;
    var para2 = encodeURIComponent(btoa(window.location.origin + window.location.pathname + loginHash));

    var redirect_uri = `${wx_app.redirect_uri}/${para1}/${para2}`;
    return {
      appid,
      state,
      redirect_uri
    }

  }



  /** 通用模块
   * 监听 code 页面, 并自动向后台请求登录
   * 登录成功，发布消息 $wxCodeLoginSuccess
   */
  commonModule.run([
    "$rootScope",
    "$http",
    "$q",
    "$location",
    "sign",
    function ($rootScope, $http, $q, $location, sign) {

      /**
       * 请求 自动微信登录
       */
      sign.registerHttpHook({
        match: HOOK_REQUIRE_WX_LOGIN,
        hookRequest: function (config, mockResponse, match) {
          var name = isWx ? "h5" : "q3";
          var mode = isWx ? MODE_H5 : MODE_Q3;

          // 登录后，登录到需要的地址
          var login = $http.post("用户登录/请求登录", { mode, data: { name } }).then(json => {
            console.log("这会出现吗？");
          });
          return mockResponse(login);
        }
      });

      /**
       * 登录返回监听
       */
      $rootScope.$on("$locationChangeStart", function (event, newUrl, oldUrl, newS, oldS) {
        // console.log("微信登录 $locationChangeStart", newUrl, oldUrl);
        var pathName = $location.path();
        var search = $location.search(); // {code, app, state}
        if (pathName != PATH_CODE || !search || !search.code || !angular.isString(search.code) || search.code.length < 32) return;

        // 正在登录，先阻止 location 事件
        event.preventDefault();

        var name = search.app;
        var code = search.code;
        var hash = decodeURIComponent(search.state);

        console.log("监测到 微信登录 $locationChangeStart", { newUrl, oldUrl, name, code, hash });
        // 登录后，登录到需要的地址
        wx_code_login(code, hash, name);
      });

      function wx_code_login(code, hash, name) {
        var params = { code, hash, name };
        if (angular.equals(params, wx_code_login.params)) return;
        wx_code_login.params = params;
        return $http.post("用户登录/请求登录", { mode: HOOKAPI_WX_CODE_LOGIN, data: { code, name } }).then(json => {
          // console.log("微信code登录, 成功, json=", json);
          // 让用户自己处理登录成功后的跳转
          $rootScope.$broadcast("$wxCodeLoginSuccess", { hash, name });
        }).catch(e => {
          console.log("微信code登录, 失败1", e)
          // 让用户自己处理登录成功后的跳转
          $rootScope.$broadcast("微信code登录失败", { hash, name });
        });
      }

      /**
       * 微信code登录
       */
      sign.registerHttpHook({
        match: `自定义登录-${HOOKAPI_WX_CODE_LOGIN}`,
        hookRequest: function (config, mockResponse, match) {
          var param = config.data;
          console.log("微信code登录...");
          $http.post("我的-基本信息", { reset: 1 }).then(() => $http.post("我的-基本信息"));
          var login = $http.post(API_PATH, { code: param.code, name: param.name }).then(json => {
            var token = json.datas;
            console.log("微信code登录, 成功");
            return { token };
          }).catch(e => {
            console.log("微信code登录, 失败3", e);
            return $q.reject(e);
          });
          return mockResponse(login);
        }
      });
    }
  ]);


  /** 微信内置浏览器登录 */
  h5Module.run(["$http", "sign", function ($http, sign) {

    /**
     * 登录请求入口
     */
    sign.registerHttpHook({
      match: `^自定义登录-${MODE_H5}$`,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        /**
         * 微信浏览器中，网页授权登录
         */
        if (isWx) {
          $http.post("系统参数").then(json_datas => json_datas.app_wx).then(wx_app => {
            var authParam = getAuthParam(location.hash, wx_app);
            var wxAuthUrl =
              'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + authParam.appid +
              '&redirect_uri=' + authParam.redirect_uri +
              '&response_type=code&scope=snsapi_base&state=' + authParam.state +
              '#wechat_redirect';
            setTimeout(() => {
              window.location.href = wxAuthUrl;
            });
          });
          return mockResponse.reject("网页要跳转了");
        }
        /**
         * 非微信浏览器，显示二维码
         */
        else {
          return mockResponse.reject("not wx browser");
        }
      }
    });
  }]);


  /** 微信二维码扫描登录 */
  q3Module.run(["$http", "sign", function ($http, sign) {
    sign.registerHttpHook({
      match: `^自定义登录-${MODE_Q3}$`,
      hookRequest: function (config, mockResponse, match) {
        /**
         * 微信浏览器中，网页授权登录
         */
        if (isWx) {
          return mockResponse.reject("why wx browser?");
        }
        /**
         * 非微信浏览器，显示二维码, 对话框方式
         */
        var param = config.data;
        var dlgParam = angular.extend({
          componentName: "login-by-wx-qrcode",
          params: {
            backClose: 1, // 点击背景是否关闭对话框
          },
          options: {}
        }, param && param.dlgParam);
        console.log("dlgParam", dlgParam);
        var dlg = $http.post("显示对话框/dialog", dlgParam).then(result => {
          var token = result.token;
          return { token };
        });
        return mockResponse.resolve(dlg);
      }
    });
  }]);

  /**
   * 允许动态加载微信提供的二维码登录功能
   */
  q3Module.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
    var oldList = $sceDelegateProvider.resourceUrlWhitelist();
    oldList.push('https://res.wx.qq.com/**');
    oldList.push('https://open.weixin.qq.com/**');
    $sceDelegateProvider.resourceUrlWhitelist(oldList);
  }]);
  /**
   * 微信二维码登录组件
   */
  q3Module.component('loginByWxQrcode', {
    template: `<div id="${idWxLoginDiv}" class="flex-cc">Loading weixin ...</div>`,
    controller: ["$http", function ($http) {
      if (isWx) { return; }
      this.$onInit = () => {
        $http.post("系统参数").then(json_datas => json_datas.app_wx3).then(wx_app => {
          var authParam = getAuthParam(location.hash, wx_app);
          if (typeof (window.WxLogin) == "undefined") {
            !(function (a, b, c) {
              function d(a) {
                var c = "default";
                a.self_redirect === !0 ? c = "true" : a.self_redirect === !1 && (c = "false");
                var d = b.createElement("iframe")
                  , e = "https://open.weixin.qq.com/connect/qrconnect?appid=" + a.appid + "&scope=" + a.scope + "&redirect_uri=" + a.redirect_uri + "&state=" + a.state + "&login_type=jssdk&self_redirect=" + c;
                e += a.style ? "&style=" + a.style : "",
                  e += a.href ? "&href=" + a.href : "",
                  d.src = e,
                  d.frameBorder = "0",
                  d.allowTransparency = "true",
                  // 增加下面一行，解决 Chrome70 的 iframe 跨域问题
                  d.sandbox = "allow-scripts allow-top-navigation allow-same-origin",
                  d.scrolling = "no",
                  d.width = "300px",
                  d.height = "400px";
                var f = b.getElementById(a.id);
                f.innerHTML = "",
                  f.appendChild(d)
              }
              a.WxLogin = d
            })(window, document);
            showWxLogin(authParam);
            // var wx_src = "https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js";
            // $http.jsonp(wx_src).finally(json => {
            //   showWxLogin(authParam);
            // });
          } else {
            showWxLogin(authParam);
          }
        });
      }
      function showWxLogin(authParam) {
        new WxLogin(angular.extend({}, authParam, {
          id: idWxLoginDiv,
          scope: "snsapi_login",
          style: "",
          href: ""
        }));
      }
    }]
  });
})(angular, window);
