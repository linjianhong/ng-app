/** 路由 ver 2 */

!(function (angular, window, undefined) {
  /**
   *  路由需求

1、页面可以先登录判断，发出请求，得到承诺后显示

2、首页登录页，登录后直接替换页面。可显示登录中，也可以不显示

3、页面数据不变，只替换参数

4、只替换URL，不改变页面

5、只改变页面，不替换URL

6、当改变页面前，用户可以拦截

7、改变页面前，旧页面可以拦截

8、新页面可以禁止改变前的拦截

9、页面可以改变时，生成标题，可以是承诺

10、页面可以改变时，可以设置分享参数等

11、页面改变可以判断前进还是后退

12、监听URL，跳到新页面

13、监听URL，识别仅替换情况

14、
   */
  var defaultRootModuleName = "dj-app";
  var routerModuleName = "dj.router.ver2";
  var stateModuleName = "dj.router.state.ver2";
  var frameModuleName = "dj.router.frame.ver2";
  var stateModule = angular.module(stateModuleName, []);
  var frameModule = angular.module(frameModuleName, ["ngAnimate", stateModuleName]);
  var routerModule = angular.module(routerModuleName, [frameModuleName, stateModuleName]);

  /** 历史记录类 */
  var DjHistory = (function () {
    var STATE_ID = 0;
    var STATE_t = +new Date();

    return {
      get_state() {
        return { t: STATE_t, id: ++STATE_ID };
      },

      has_state(state) {
        return state && state.t == STATE_t && state.id > 0;
      },

      replace: function (url, state) {
        return history.replaceState(state, null, url);
        setTimeout(() => {
          history.replaceState(state, null, url);
        });
      },
    }
  })();

  function hash_of_url(url) {
    var match = url.match(/#(!)?\/([^\?]+)(\?(.*))?$/);
    return (match || ["无"])[0];
  }

  routerModule.run(["$rootScope", "$location", "$browser", "DjState", function ($rootScope, $location, $browser, DjState) {

    var _FIRST_RUN = 1;

    $rootScope.$on("$locationChangeStart", (event, newUrl, oldUrl, c, d) => {
      var state = history.state;
      newHash = hash_of_url(newUrl);
      oldHash = hash_of_url(oldUrl);
      if (location.hash != oldHash) {
        console.log("非常规状态  ", newHash, oldHash, location.hash);
        //event.preventDefault();
        return;
      }
      console.log("监听 1： Go! ", newHash, oldHash, state);
      if (_FIRST_RUN) setTimeout(() => _FIRST_RUN = 0);
    });
    $rootScope.$on("$locationChangeSuccess", (event, newUrl, oldUrl, c, d) => {
      newHash = hash_of_url(newUrl);
      oldHash = hash_of_url(oldUrl);

      if (newHash == oldHash && !_FIRST_RUN) {
        console.log("禁止 1： 阻止 ", newHash, oldHash, state);
        event.preventDefault();
        return;
      }
      DjState.go(newHash.substr(2));
      var state = history.state;
      // if (!DjHistory.has_state(state)) {
      //   DjHistory.replace(newHash, state = DjHistory.get_state());
      // }
      //console.log("成功 1：$locationChangeSuccess  ", newHash, oldHash, state, _FIRST_RUN && "首次" || "");
      console.log("显示!!!", newHash);
    });



    // $rootScope.$watch(function () {
    //   return decodeURIComponent(location.hash);
    // }, function (hash, oldHash) {
    //   console.log("监听 2：rootScope.$watch  ", hash, " <= ", oldHash);
    // });
    // 
    // $browser.onUrlChange((hash) => {
    //   console.log("监听 3：browser.onUrlChange  ", hash)
    // });
    // 
    // window.addEventListener('hashchange', _listener1, false);
    // window.addEventListener('popstate', _listener2, false);
    // function _listener1(event, a, b) {
    //   console.log("监听 5：hashchange", event, a, b);
    // }
    // function _listener2(event, a, b) {
    //   console.log("监听 4：popstate", event, a, b);
    // }

  }]);

  routerModule.factory("DjState", ["$q", "$location", function ($q, $location) {

    var LAST_HASH = "";
    var DjState = (function () {


      return {
        go: (state) => {
          //if (state != "my") return DjState.replace(state);
          var hash = "#/" + state;
          if (LAST_HASH != hash) {
            LAST_HASH = hash;
            location.hash = hash;
            console.log("准备显示", hash);
          }
          if (!DjHistory.has_state(state)) {
            DjHistory.replace(hash, state = DjHistory.get_state());
          }
        },
        replace: (state) => {
          var hash = "#/" + state;
          var history_state = history.state;
          DjHistory.replace(hash, history_state);
          $location.replace();
        },
      }
    })();
    return DjState;
  }]);
  routerModule.factory("DjRouter", ["$q", function ($q) {
    var DjRouter = {
      when: () => DjRouter,
      otherwise: () => DjRouter,
      when: () => DjRouter,
    }
    return DjRouter;
  }]);

  function __A__() {
    $rootScope.$on("$locationChangeStart", (event, a, b, c, d) => {
      console.log("监听 1：$locationChangeStart  ", a, b, c, d)
    });
    $rootScope.$watch(function () {
      return decodeURIComponent(location.hash);
    }, function (hash, oldHash) {
      console.log("监听 2：rootScope.$watch  ", hash, " <= ", oldHash);
    });

    $browser.onUrlChange((hash) => {
      console.log("监听 3：browser.onUrlChange  ", hash)
    });

    window.addEventListener('hashchange', _listener1, false);
    window.addEventListener('popstate', _listener2, false);
    function _listener1(event, a, b) {
      console.log("监听 5：hashchange", event, a, b);
    }
    function _listener2(event, a, b) {
      console.log("监听 4：popstate", event, a, b);
    }
  }
})(angular, window);