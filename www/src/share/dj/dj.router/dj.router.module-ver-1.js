
/**
 *  路由状态控制
 * 
 * @example 使用
 * @method 路由监听
 * ```js
 *  angular.module("your-module-name", ["...", "dj.router.state"]);
 *  // ...
 *  $rootScope.$on("$DjRouteChangeSuccess", function (event, newState, oldState) {
 *    // 可以判断是否是按了浏览器的后退按钮;
 *    var isGoBack = oldState && oldState.id > newState.id;
 *    // ...
 *    // 你还可以根据新旧 state 来自己实现路由对应视口
 *  });
 * ```
 *
 *
 *
 *
 * @example 使用 
 * @method 路由控制
 * ```js
 *  function($timeout, DjState){
 *    $timeout(()=>{
 *      DjState.go("page-a");
 *      DjState.go("page-b", {k1: 1});
 *      DjState.go(newState);
 *      DjState.replace("page-a");
 *      DjState.replace("page-b", {k1: 1});
 *      DjState.replace(newState);
 *    }
 *  }
 * ```
 *
 *
 *
 *
 *
 *
 * @fires 触发路由变化的方式区分： *
 * @method 1、 地址栏输入新的hash，或直接设置location
 *       $locationChangeSuccess 事件中，无有效的 State,
 *       若hash未发生变化，则退出事件处理。
 *       首先，生成一个全新的 state, 在 StateCache 中的列表将增加到当前位置之后，且截断其后列表
 *       其次，替换 history,
 *       最后，发出通知 $DjRouteChangeSuccess
 * @method 2、 调用 DjState 类函数
 *       直接修改 history,
 *       直接修改 StateCache, 
 *         如果是全新的路由，则 StateCache 中的列表将增加一项到当前位置之后，且截断其后列表
 *         如果是跳转，则暂不处理
 *       此后，触发 $locationChangeSuccess 事件
 *         可识别到是有效的 State,
 *         在 StateCache 中更新当前位置
 *       最后，发出通知 $DjRouteChangeSuccess
 * @method 3、 浏览器的前进和后退功能
 *       由浏览器自动修改 history,
 *       首先，在$locationChangeSuccess 事件中
 *         得到一个有效的 state, 则在 StateCache 中更新当前位置, 最后，发出通知 $DjRouteChangeSuccess
 *         无有效的 state, 则按“方式1”处理
 *
 *
 *
 *
 * @event 路由即将改变
 * @description 在接收到 $locationChangeSuccess 通知，或者内部调用后，若可能发生路由改变，即生成新旧状态，发布通知
 * @override 允许 event.preventDefault()
 * @name $DjRouteChangeStart
 * @param event angular Event, Synthetic event object.
 * @param {State} newState New State
 * @param {State} oldState Old State
 * @param {Component} newComponent Component of newState
 * @param {Component} oldComponent Component of oldState
 * @param {boolean} isFirstRun 
 *
 *
 * @event 路由改变成功
 * @name $DjRouteChangeSuccess
 * @param event angular Event, Synthetic event object.
 * @param newState New State
 * @param oldState Old State
 */

/**
 * @license AngularDjRouter v0.0.1
 * (c) 2010-2016 Google, Inc. https://jdyhy.com
 * License: MIT
 * @module dj.router.frame
 * @author LinJH [ljh@jdyhy.com]
 * @copyright DJ. 2014-2017
 *
 *
 *
 * @description 轻量级路由
 * @function 1: 各路由显示的内容，可以暂时隐藏的方式保存在内存中，后退时，可以立即显示, 也可以自动销毁
 * @function 2: 有效识别浏览器的前进后退操作
 * @function 3: 以组件方式，绑定路由地址，无需另外绑定代码 (当前版本，组件名要加前缀"page-"以自动绑定)
 * @function 4: 路由切换监听，可以及时得到新旧路由的各种参数，用以通用功能的集中控制实现
 * 
 *
 * @throws {1} 绑定组件，须以 dj.router.frame 模块来定义组件
 * @throws {2} 路由切换时，页面动画的 css 类名，有时出现 ng-enter, 却没有 ng-hide-remove, 原因尚未明确
 * @throws {3} 当路由没有找到对应的组件定义时，路由将不会被切换。浏览器的url和前进后退操作，将造成一个不很正确的历史记录
 * 
 *
 *
 *
 *
 * @example 使用
 * @method 路由控制
 * @code 1.<js> sure module tobe loaded
 *    ```js
 *      angular.module("app-module-name", ["...", "dj.router.frame"]);
 *    ```
 * @code 2.<html template>
 *  @param {string} hostCss class name append to every dj-frame-host element
 *   ```html
 *     <dj-frame class="my-class {{isGoBack&&'back'||''}}" host-css="host-element-class"></dj-frame>
 *   ```
 * @code 3.<js> add page bind router, such as #/pagename1
 *  @param {boolean} autoDestroy true: destroy element when state deactivated
 *  @param {any} angularComponentDefault angular.component param using
 *  @param {any} other as you need, the data can be recieved on event $DjRouteChangeStart, event $DjRouteChangeSuccess
 *  ```js
 *    angular.module("dj.router.frame").component("page-pagename1", {
 *      pageTitle: "page title 1",
 *      requireLogin: true,
 *      autoDestroy: true,
 *      template: `<div>page 1!</div>`,
 *      controller: ["$scope", function ctrl($scope) {
 *      }]
 *    });
 *  ```
 *
 *
 *
 *
 *
 * @event 路由页面开始切换
 * @name $DjPageNavgateStart
 * @param event angular Event, Synthetic event object.
 * @param newPage New Page Data, include State, component and it's params
 * @param oldPage Old Page Data, include State, component and it's params
 */function ___() { }

!(function (angular, window, undefined) {
  var defaultRootModuleName = "dj-app";
  var routerModuleName = "dj.router.ver1";
  var stateModuleName = "dj.router.state.ver1";
  var frameModuleName = "dj.router.frame.ver1";
  var stateModule = angular.module(stateModuleName, []);
  var frameModule = angular.module(frameModuleName, ["ngAnimate", stateModuleName]);
  angular.module(routerModuleName, [frameModuleName, stateModuleName]);


  /** 限制缓存页面数量(未启用) */
  var MAX_CACHE_PAGE_COUNT = 50;


  /** 字符串转成驼峰 */
  function transformStr(str) {
    return str.replace(/-(\w)/g, function ($0, $1) {
      return $1.toUpperCase();
    });
  }

  /** 驼峰转成-字符串 */
  function untransformStr(str) {
    return str.replace(/([A-Z])/g, function ($0, $1) {
      return "-" + $1.toLowerCase();
    });
  }

  /** 解析 url 中的 queryString 参数
   * @return search
   */
  function parseSearch(queryString) {
    var search = undefined;
    queryString && decodeURIComponent(queryString).replace(/([^?&=]+)=([^&]+)/g, (_, k, v) => (search = search || {})[k] = v);
    return search;
  }



  var STATE = {};
  stateModule.run(["$rootScope", "$q", function ($rootScope, $q) {

    var State_ID = 0;
    var DjHistory_t = +new Date();

    function $q1(a, callback) {
      if (angular.isFunction(a)) return $q1(a($q));
      if (a && a.then) {
        return $q.when(a).then(a => {
          return callback ? callback(a) : a;
        })
      } else {
        return callback ? callback(a) : a;
      }
    }
    function $q2(a, b, callback) {
      return $q1(a, a => {
        return $q1(b, b => {
          return callback(a, b);
        })
      });
    }
    /**
     * 根据参数，生成 hash
     */
    function hash(path, search) {
      search = search || {};
      var queryString = Object.keys(search).map(k => `${k}=${encodeURIComponent(search[k])}`).join("&");
      return $q1(path, path => path + (queryString && "?" || "") + queryString);
      //return path + (queryString && "?" || "") + queryString;
    }
    function href(path, search) {
      return $q1(path, path => location.origin + location.pathname + "#/" + hash(path, search));
    }

    function parseHash(url) {
      var state = $q1(url, url => {
        if (!angular.isString(url)) return new State("", {});
        var match = url.match(/#(!)?\/([^\?]+)(\?(.*))?$/);
        if (!match) {
          if (/^http(s)?/.test(url)) match = [];
          else match = url.match(/(\/)?([^\?]+)(\?(.*))?$/) || []
        }
        var pathName = match[2] || "";
        if (pathName.substr(0, 1) == "#") pathName = "";
        var queryString = match[4];
        var search = parseSearch(queryString);
        return new State(pathName, search);
      });
      return new State(state);
    }
    /**
     * 不同参数方式，获取 State 对象
     */
    function stateOf(path, search) {
      if (path instanceof STATE.State) return path;
      if (path.$$state) return new State(path, search);
      var state = STATE.parseHash(path);
      search && angular.extend(state.search || (state.search = {}), search);
      return state;
    }
    function broadcast$DjRouteChangeStart(newState, oldState) {
      // console.log("广播 $DjRouteChangeStart", newState.search, newState, oldState);
      return $rootScope.$broadcast("$DjRouteChangeStart", newState, oldState, !DjHistory.activeState);
    }

    /** 历史记录类 */
    var DjHistory = {
      activeState: null,
      getHistoryStateId: function () {
        return history.state && history.state.t === DjHistory_t && history.state.id || 0;
      },
      isHistoryStateId: function () {
        return history.state && history.state.t === DjHistory_t && history.state.id || 0;
      },
      goback: function () {
        history.go(-1);
      },
      forward: function () {
        history.go(1);
      },
      go: function (state) {
        var href = state.href();
        // console.log("DjHistory.go", href, ", location.href=", location.href);
        if (decodeURIComponent(location.href) == decodeURIComponent(href)) return DjHistory.replace(state);
        location.href = decodeURIComponent(href);
      },
      push: function (state) {
        DjHistory.activeState = state;
        // console.log("DjHistory push", state);
        if (!state.id) state.autoID();
        history.pushState({ t: DjHistory_t, id: state.id }, null, state.href());
      },
      replace: function (state) {
        DjHistory.activeState = state;
        // console.log("DjHistory replace", state);
        if (!state.id) state.autoID();
        history.replaceState({ t: DjHistory_t, id: state.id }, null, state.href());
      }
    }

    /** 状态缓存类 */
    var StateCache = {
      pos: -1,
      list: [],
      /**
       * 跳到指定页面
       */
      navToPos: function (pos) {
        if (StateCache.pos == pos || !StateCache.list[pos]) return $q.reject("无效跳转");
        var oldState = StateCache.list[StateCache.pos];
        var newState = StateCache.list[pos];
        StateCache.pos = pos;
        return $q.when({ newState, oldState });
      },

      /**
       * 跳到最后一个页面
       */
      navToLast: function () {
        return $q.when(StateCache.list[StateCache.pos = StateCache.list.length - 1]);
        return StateCache.navToPos(StateCache.list.length - 1);
      },

      /**
       * 尝试切换路由到指定的状态ID
       * 正确返回 数字
       * 错误返回 错误字符串
       */
      checkNavigateTo: function (historyStateId) {
        var pos = StateCache.list.findIndex(state => historyStateId > 0 && state.id == historyStateId);
        if (pos < 0) {
          return "error id";
        }
        if (pos === StateCache.pos) {
          return "same pos";
        }
        return pos;
      },

      /**
       * 尝试切换路由到指定的状态ID
       */
      gotoHistoryPage: function (historyStateId) {
        var pos = StateCache.checkNavigateTo(historyStateId);
        if (!angular.isNumber(pos)) {
          return $q.reject(pos);
        }
        return StateCache.navToPos(pos);
      },

      /**
       * 在当前位置之后，添加一个状态
       */
      appendState: function (state) {
        // 先清除之后的
        StateCache.list.splice(StateCache.pos + 1, 99999);
        // 添加一个新的状态，总是在最后
        StateCache.list.push(state);
      }
    };


    /** 状态类 */
    class State {
      /**
       * 
       * @param {string} path 
       * @param {Object} search 
       */
      constructor(path, search) {
        this.id = -1;
        this.search = search;
        this.path = STATE.$q1(path, path => {
          if (path instanceof (State)) {
            this.path = path.path;
            this.search = angular.extend({}, this.search, path.search);
            return path.path;
          }
          if (!angular.isString(path)) return this.path = "";
          return this.path = path.replace(/^(\s|\/)+|(\s|\/)+$/gm, "");
        });
      }

      ready(callback) {
        return $q.when(this.path).then((path) => {
          if (path instanceof (State)) {
            this.path = path.path;
            this.search = angular.extend({}, this.search, path.search);
            return callback(this);
          }
          this.path = path.replace(/^(\s|\/)+|(\s|\/)+$/gm, "");
          return callback(this);
        });
      }
      autoID() {
        this.id = ++State_ID;
      }
      hash() {
        return hash(this.path, this.search);
      }
      href() {
        return $q1(this.path, path => {
          if (path instanceof (State)) return path.href();
          var search = this.search || {};
          var queryString = Object.keys(search).map(k => `${k}=${encodeURIComponent(search[k])}`).join("&");
          return location.origin + location.pathname + "#/" + path + (queryString && "?" || "") + queryString;
        });
      }
      equals(state) {
        return state && state.hash && this.hash() == state.hash() || this.hash() == state;
      }
    }

    angular.extend(STATE, {
      $q1,
      $q2,
      hash,
      href,
      parseHash,
      stateOf,

      broadcast$DjRouteChangeStart,

      DjHistory,
      StateCache,
      State,
    });
  }]);



  stateModule.factory("DjState", ["$rootScope", function ($rootScope) {

    /**
     * 路由队列
     * 每次路由操作，先入栈，并由定时器完成跳转
     */
    var DjStateQueue = {
      queueFinal: "",
      timer: 0,
      timerPrior: 0,
      delayRun: function () {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.timer = 0;
          if (!this.queueFinal) return;
          // console.log(`[${Date.now()}] 运行跳转`, this.queueFinal.fn, this.queueFinal.args);
          var args = this.queueFinal.args
          DjState_Run[this.queueFinal.fn](args[0], args[1], args[2]);
          this.queueFinal = false;
        }, 33);
      },
      /** 
       * 正常请求跳转
       */
      push: function (fn, priorDelay, args) {
        //console.log(`[${Date.now()}] 请求跳转·`, fn, state.hash(), priorDelay);
        if (priorDelay > 0) {
          /** 优先，并在指定延时内，排除其它跳转 */
          if (this.timerPrior) clearTimeout(this.timerPrior);
          this.queueFinal = { fn, args };
          this.delayRun();
          this.timerPrior = setTimeout(() => this.timerPrior = 0, priorDelay);
          return;
        }
        /** 有正在优先缓存的，将被忽略 */
        if (this.timerPrior) return;
        /** 覆盖其它 */
        this.queueFinal = { fn, args };
        this.delayRun();
      },
    }

    /**
     * 状态控制类，立即执行
     * 1. 保存路由状态序列
     * 2. 浏览器历史记录同步
     * 3. 路由漫游
     */
    class DjState_Run {

      static go(newState) {
        var oldState = STATE.parseHash(location.href);
        if (STATE.broadcast$DjRouteChangeStart(newState, oldState).defaultPrevented) {
          // console.log("DjState.go 被阻止", newState);
          return;
        }
        // 程序第一次设置 hash
        if (!STATE.DjHistory.activeState) {
          newState.autoID();
          STATE.DjHistory.replace(newState);
          // console.log("第一次 DjState.go 成功 ", newState.search, newState);
          return true;
        }
        // 不是第一次设置 hash 且url没有改变的，不处理
        if (location.href == newState.href()) {
          return false;
        };
        newState.autoID();
        STATE.DjHistory.go(newState);
        STATE.StateCache.appendState(newState);
        // console.log("跳转 DjState.go 成功 ", newState.search, newState);
      }
      static goback() {
        STATE.DjHistory.goback();
      }
      static forward() {
        STATE.DjHistory.forward();
      }

      /**
       * 替换当前页面
       * 替换浏览器的历史记录的当前项
       * 页面 不 重新加载
       */
      static replace(newState, gotoState) {
        if (newState.href() == location.href) {
          return STATE.DjHistory.replace(newState);
        }
        var oldState = STATE.parseHash(location.href);
        // if (STATE.broadcast$DjRouteChangeStart(newState, oldState).defaultPrevented) return;
        STATE.DjHistory.replace(newState);
        if (gotoState) $rootScope.$broadcast("$DjRoutePageReload", newState, oldState)
      }
    }

    /** 状态控制类
     * 1. 保存路由状态序列
     * 2. 浏览器历史记录同步
     * 3. 路由漫游
     */
    class DjState {

      static go(path, search, priorDelay) {
        //console.log(`[${Date.now()}] DjState.go`, path, search, priorDelay);
        var newState = STATE.stateOf(path, search);
        return newState.ready(newState =>
          DjStateQueue.push("go", priorDelay || 0, [newState])
        );
      }
      static goback() {
        return DjStateQueue.push("goback", 0, []);
      }
      static forward() {
        return DjStateQueue.push("forward", 0, []);
      }

      /**
       * 替换当前页面
       * 替换浏览器的历史记录的当前项
       * 页面将被重新加载
       */
      static replace(path, search, priorDelay, gotoState) {
        var newState = STATE.stateOf(path, search);
        return newState.ready(newState => {
          console.log("替换当前页面, activeState.id=", (STATE.DjHistory.activeState || { id: 0 }).id, "newState.id=", newState.id);
          newState.id <= 0 && (newState.id = STATE.DjHistory.getHistoryStateId());
          DjStateQueue.push("replace", priorDelay || 0, [newState, gotoState])
        }
        );
      }

      /**
       * 替换当前页面的 search 参数
       * 替换浏览器的历史记录的当前项
       * 页面将被重新加载
       */
      static replaceSearch(search, priorDelay) {
        if (!STATE.DjHistory.activeState) return;
        var newState = STATE.stateOf(STATE.DjHistory.activeState.path, search);
        return DjStateQueue.push("go", priorDelay || 0, [newState]);
      }
    }

    DjState.hash = STATE.hash
    DjState.href = STATE.href
    DjState.stateOf = STATE.stateOf

    return DjState;
  }]);

  /** 路由状态事件处理
   *
   * 1. 监听 url 事件
   * 2. 广播路由事件
   */function __() { }
  stateModule.run(["$rootScope", "$location", "$browser", "DjState", function ($rootScope, $location, $browser, DjState) {

    $rootScope.$watch(function () {
      return decodeURIComponent(STATE.parseHash(location.hash).hash());
    }, function (hash, oldHash) {
      // console.log("rootScope.$watch  ", hash, " <= ", oldHash);
      onUrlChange(hash);
    });

    $browser.onUrlChange((hash) => {
      // console.log("browser.onUrlChange  ", hash)
      onUrlChange(hash)
    });

    /**
     * 状态控制
     */
    var oldState = {};
    var oldStateId = {};;
    function onUrlChange(newUrl) {
      // console.log("onUrlChange", newUrl);
      var newState = STATE.parseHash(newUrl);
      newState.ready(newState => {
        // console.log("就绪 newState ", newState.search, newState);
        var newStateId = STATE.DjHistory.getHistoryStateId();
        onStateByUrlChange(newState, newStateId);
        oldState = newState;
        oldStateId = newStateId;
      });
    }
    function onStateByUrlChange(newState, newStateId) {
      var newState_need_show =
        (newStateId > 0 && oldStateId != newStateId) // 是旧的页面，且不是当前页面；但允许相同的 url
        || !newState.equals(oldState);               // 不同的 url
      if (!newState_need_show) return;
      // console.log("准备广播 newState ", newState.search, newState);
      var defaultPrevented = !STATE.broadcast$DjRouteChangeStart(newState, oldState).defaultPrevented
      defaultPrevented && onUrlChangeSuccess(newState, oldState);
    };

    function onUrlChangeSuccess(newState, oldState) {
      /** 必须在 locationChangeSuccess 中才能正确得到 history 数据*/
      // console.log("页面准备", newState.search, newState, oldState);
      var historyStateId = STATE.DjHistory.getHistoryStateId();
      STATE.StateCache.gotoHistoryPage(historyStateId)
        .then(states => {
          // 是浏览器按了后退或前进
          // 是DjState操作后退或前进
          // 是DjState.go函数改变路由
          // console.log("路由改变, 后退、前进或DjState.go", historyStateId);
          $rootScope.$broadcast("$DjRouteChangeSuccess", states.newState, states.oldState);
        })
        .catch((reason) => {
          // console.log("路由改变,", reason, ", ", newState.path, oldState.path);
          // 新的 hash
          if (reason != "same pos") {
            newState.ready(newState => {
              // console.log("新的 hash", newState.search, newState);
              if (!$rootScope.$broadcast("$DjRouteChangeSuccess", newState, oldState).defaultPrevented) {
                newState.autoID();
                STATE.StateCache.appendState(newState);
                STATE.StateCache.navToLast().then(newState => DjState.replace(newState));
              }
            });
          }
        });
    }

  }]);


  // window.addEventListener('hashchange', _listener1, false);
  // window.addEventListener('popstate', _listener2, false);
  // function _listener1(event, a, b) {
  //   // console.log("hashchange", event, a, b);
  // }
  // function _listener2(event, a, b) {
  //   // console.log("popstate", event, a, b);
  // }










  /** 组件类 */
  class Component {
    /**
     * @param {string} name 组件名称，驼峰格式
     * @param {object} param 组件参数
     */
    constructor(name, param) {
      this.name = name;
      this.param = param;
    }
    static searchFromRootModule(componentName, rootModuleName) {
      var module = angular.module(rootModuleName);
      var component = module._invokeQueue
        .filter(a => a[1] == "component")
        .map(invoke => invoke[2])
        .find(component => component[0] == componentName);
      if (component) return component;
      for (var i = 0, length = module.requires.length; i < length; i++) {
        component = Component.searchFromRootModule(componentName, module.requires[i]);
        if (component) return component;
      }
      return false;
    }
    /**
     * @param {string} componentName 驼峰格式的组件名
     * @param {string} rootModuleName qngualrJs 模块名
     * @return {Component|false} 返回查到的组件实例
     */
    static getComponent(componentName, rootModuleName) {
      if (!componentName) { return false; }
      rootModuleName = rootModuleName || defaultRootModuleName;
      try {
        // 确保 根模块有效，其它子模块，已由 angularJs 把关
        angular.module(rootModuleName);
      } catch (e) {
        return false;
      }
      var component = Component.searchFromRootModule(componentName, rootModuleName);
      return component && new Component(componentName, component[1]);
    }
  };

  /**
   * 多页面控制
   */
  frameModule.factory("CachePages", ["DjRouter", function (DjRouter) {
    /** 路由页面类 */
    class CPageData {
      /**
       */
      constructor(state) {
        /** 路由状态 */
        this.state = state;
        this.visible = false;
        /** 组件数据 */
        this.component = DjRouter.getComponent(state);
      }
      show() {
        this.visible = true;
      }
      hide() {
        this.visible = false;
      }
      getData() {
        return this.component && this.component.param || {};
      }
    }
    /** 框架历史浏览记录 */
    class CachePages {
      static push(page) {
        this.list.push(page);
        if (MAX_CACHE_PAGE_COUNT < this.list.length) this.list.shift();
      }
      static clearAfters() {
        return this.list.splice(this.pos + 1, 99999);
      }
      static findIndex(state) {
        return this.list.findIndex(page => state.id > 0 && page.state.id == state.id);
      }

      static onState(newState) {
        return newState.ready(newState => {
          var state = DjRouter.getRouteredState(newState);
          return state.ready(newState => {
            var oldPos = this.pos;
            var newPos = this.findIndex(newState);
            if (newPos < 0) {
              this.clearAfters();
              this.push(new CPageData(newState));
              newPos = this.list.length - 1;
            }
            return {
              oldPos,
              newPos
            }
          });
        });
      }

      static invalidate(changes) {
        var oldPage = this.list[changes.oldPos];
        var newPage = this.list[changes.newPos];
        if (oldPage) oldPage.hide();
        if (newPage) newPage.show();
        this.pos = changes.newPos;
        return { oldPage, newPage }
      }

      static replacePage(pos, newState) {
        if (pos < 0 || pos >= this.list.length) return;
        var newPage = new CPageData(newState);
        newPage.visible = this.list[pos].visible;
        this.list[pos] = newPage;
      }
    };
    CachePages.pos = -1
    CachePages.list = []

    return CachePages;
  }]);

  /**
   * DjRouter
   * @example 使用 
   * @method 路由失效处理
   * ```js
   *  angular.module("your-module-name").run("DjRouter", function (DjRouter) {
   *    // 页面组件定义
   *    DjRouter.component("page-a", "componentNameA"); // 默认为 pagePageA, 现在，改定义为 componentNameA
   *    // 页面跳转
   *    DjRouter.when("page-a", "page-b");
   *    DjRouter.when("page-a", "page-b", {k1: 1});
   *    DjRouter.when("page-a", newState);
   *    DjRouter.when("page-a", function(oldState){
   *      return newState;
   *    });
   *    DjRouter.otherwise("page-c");
   *    DjRouter.otherwise("page-c", {k1: 1});
   *    DjRouter.otherwise(newState);
   *    // ...
   *    // 你还可以根据新旧 state 来自己实现路由对应视口
   *  });
   * ```
   *
   */ function __() { }
  frameModule.factory("DjRouter", ["DjState", function (DjState) {

    /** 路由中转项类 */
    class RouterWhenItem {
      /**
       * @param {String | function} path 
       * @param {State} next 
       */
      constructor(path, next) {
        this.path = path;
        this.next = next;
      }
      /**
       * 本规则是否适配 state
       * @param {State} state 
       * @return {boolean}
       */
      fitState(state) {
        if (angular.isString(this.path))
          return this.path == state.path;
        else if (this.path instanceof STATE.State)
          return this.path.equals(state);
        else if (angular.function(this.path))
          return this.path(state);
        return false;
      }
      /**
       * 将 stata 匹配成新的 State
       * @param {State} state 
       * @return {State}
       */
      fillSearch(state) {
        var search = this.next.search || state.search;
        return new STATE.State(this.next.path, search);
      }
      /**
       * 用 state 匹配本规则, 成功，则返回一个新的 State
       * @param {string | State} state 
       * @return {State | false}
       */
      nextState(state) {
        return this.fitState(state) && this.fillSearch(state);
      }
    }

    /** 路由控制类 */
    class _DjRouter {

      static component(path, componentName) {
        componentName = transformStr(componentName.replace("/", "-"));
        var old = _DjRouter.routerDefine.component.find(item => item.path == path);
        if (old) {
          old.componentName = componentName;
        }
        else {
          _DjRouter.routerDefine.push(old = { path, componentName })
        }
        return _DjRouter;
      }

      static when(path, newPath, search) {
        var old = _DjRouter.routerDefine.when.find(item => item.path == path);
        var state = STATE.stateOf(newPath, search);
        if (old) {
          console.info(`path [${path}] allready exist, redefine now!`);
          old.next = state;
        }
        else {
          _DjRouter.routerDefine.when.push(new RouterWhenItem(path, state));
        }
        return _DjRouter;
      }

      static otherwise(newPath, search) {
        _DjRouter.routerDefine.otherwise.next = STATE.stateOf(newPath, search);
        return _DjRouter;
      }


      /**
       * 判断 state 是否有效
       * @param {State} state 
       * @return {boolean}
       */
      static hasRouteOfState(state) {
        // 有默认情况，就总是有
        if (_DjRouter.routerDefine.otherwise.next) return true;
        if (angular.isString(state))
          return !!_DjRouter.getRouteredState(STATE.stateOf(state));
        if (state instanceof STATE.State)
          return !!_DjRouter.getRouteredState(state);
        return false;
      }


      /**
       * 根据 state 路由到最后的 State
       * @param {State} state 
       * @return {State}
       */
      static getRouteredState(state) {
        var routerDefine = _DjRouter.routerDefine
        // 先检查跳转
        for (var i = 0, length = routerDefine.when.length; i < length; i++) {
          var nextState = routerDefine.when[i].nextState(state);
          if (nextState)
            return _DjRouter.getRouteredState(nextState);
        }

        // 再检查组件匹配
        for (var i = 0, length = routerDefine.component.length; i < length; i++) {
          var fit = routerDefine.component[i].path == state.path;
          if (fit)
            return _DjRouter.getRouteredState(STATE.stateOf(routerDefine.component[i].componentName));
        }

        // 再检查默认的组件匹配
        if (Component.getComponent(transformStr("page-" + state.path)))
          return state;

        //返回默认
        return routerDefine.otherwise.next;
      }


      /**
       * 根据 pathName 获取组件信息
       * @param {State|string} state 状态，或者url
       * @return {Component|false} 返回获取到的组件实例，或false
       */
      static getComponent(state) {
        if (angular.isString(state)) {
          return _DjRouter.getComponent(STATE.parseHash(state));
        }
        state = _DjRouter.getRouteredState(state);
        if (!state || !state.path) return false;
        var orginComponentName = transformStr(state.path);
        var finnalComponentName = _DjRouter.routerDefine.component.find(c => c.name == componentName)
        var component = Component.getComponent(finnalComponentName || transformStr("page-" + orginComponentName));
        component && (component.state = state);
        return component;
      }
    }

    _DjRouter.routerDefine = {
      "component": [],
      "when": [],
      "otherwise": {},
    };

    return _DjRouter;
  }]);

  /** 页面插座 */
  frameModule.directive("djFrameHost", ["$parse", "$compile", function ($parse, $compile) {
    return {
      restrict: "AE",
      scope: {
        p: "=",
      },
      //template: "<div></div>",
      link: function (scope, element, attr) {
        var componentName = {};
        var oldComponentName = {};
        scope.$watch("p", function (pageData) {
          // console.log("页面插座", pageData);
          if (!pageData
            || !pageData.state
            || !pageData.component
            || !pageData.component.name
          ) {
            scope.state = "";
            componentName = oldComponentName;
            // element.html("");
            // return;
          } else {
            pageData.$scope = scope;
            scope.state = pageData.state;
            pageData.component.param = pageData.component.param || {};
            componentName = untransformStr(pageData.component.name);
          }
          if (oldComponentName == componentName) return;
          oldComponentName = componentName;
          /** 新建一个组件DOM */
          var template = (`<${componentName} serach="state.search" ng-if="state"></${componentName}>`);
          // element.html(template);
          // $compile(element.contents())(scope);
          var ele = $compile(template)(scope);
          element.append(ele);
        });
      }
    };
  }]);


  frameModule.component("djFrame", {
    template: `<dj-frame-host class=" {{$ctrl.hostCss||''}} {{page.component.param.pageCss}}" ng-show="page.visible" p="(page.visible||!page.component.param.autoDestroy)&&page" ng-repeat="page in pageList"></dj-frame-host>`,
    bindings: {
      hostCss: "@"
    },
    controller: ["$scope", "$rootScope",
      "$q",
      "$element",
      "$timeout",
      "DjRouter",
      "CachePages",
      function ctrl($scope, $rootScope, $q, $element, $timeout, DjRouter, CachePages) {
        /** 框架历史浏览记录 */
        $scope.pageList = CachePages.list;

        /** 页面重新加载 */
        $rootScope.$on("$DjRoutePageReload", function (event, newState, oldState) {
          // console.log("页面重新加载", newState, oldState, ", CachePages.list=", CachePages.list);
          var oldPos = CachePages.pos;
          var oldPage = CachePages.list[oldPos];
          if (oldPos < 0) {
            console.error("重新加载不存在的页面");
            return;
          }
          $timeout(() => {
            CachePages.replacePage(oldPos, newState);
            var newPage = CachePages.list[oldPos];
            $rootScope.$broadcast("$DjPageNavgateStart", newPage, oldPage);
          }, 100);
        });

        $rootScope.$on("$DjRouteChangeStart", function (event, newState, oldState) {
          var hasRouter = DjRouter.hasRouteOfState(newState);
          if (!hasRouter) {
            event.preventDefault();
            $rootScope.$broadcast("$DjPageNavgateError", newState, oldState);
          }
        });

        $rootScope.$on("$DjRouteChangeSuccess", function (event, newState, oldState) {
          // console.log("路由收到广播", newState.search, newState, oldState);
          // var changes = CachePages.onState(newState);
          CachePages.onState(newState).then(changes => {
            var oldPage = CachePages.list[changes.oldPos];
            var newPage = CachePages.list[changes.newPos];
            if (!newPage.state.equals(newPage.component.state)) {
              angular.extend(newState, newPage.component.state);
            }
            $rootScope.$broadcast("$DjPageNavgateStart", newPage, oldPage);

            // console.log("路由跳转 = ", newState, oldState);

            // 需要一些时间，以便新的窗口显示一下，使动画不受其显示过程影响
            //$q.when(1).then(()=>{
            //$timeout(() => {
            //var hide = document.querySelector(`[n='${oldState && oldState.id}']`, $element[0])||{};
            //var show = document.querySelector(`[n='${newState.id}']`, $element[0]);
            //console.log("hide 2 = ",hide.className);
            //console.log("show 2 = ",show.className);
            var pages = CachePages.invalidate(changes);
            if (pages.oldPage && pages.oldPage.component.param && pages.oldPage.component.param.autoDestroy) {
              pages.oldPage.$scope.$broadcast("dj.router.page-destroy", pages);
            }
            DjRouter.$active = pages.newPage;
            DjRouter.$search = pages.newPage.state.search || {};
            $rootScope.$broadcast("$DjPageNavgation", { pages, changes, cache: CachePages });
            // $timeout(() => {
            // console.log("hide 3 = ",hide.className);
            // console.log("show 3 = ",show.className);
            // });
            // $timeout(() => {
            // console.log("hide 4 = ",hide.className);
            // console.log("show 4 = ",show.className);
            // },200);
            //}, 18);
            //})

          }).catch(e => {
            console.error("no router", e)
          })
        });
      }
    ]
  });

})(angular, window);