/* 主程序 */
!(function (angular, window, undefined) {

  /** 首页地址，需要隐藏 home 按钮 */
  var homeState = "my";

  var theModule = angular.module('dj-view');

  theModule.component('myApp', {
    template: `
      <my-app-header class="header" d="header" ng-if="header && !header.hide"></my-app-header>
      <dj-frame class="flex-1 {{isFirstRun&&' '||'view-animate'}} {{isGoBack&&'back'||''}}" host-css="flex-v"></dj-frame>
      <div class="bottom-nav flex flex-arround" ng-if="footer&&!footer.hide">
        <div class="item flex-v flex-cc flex-1 {{isActive(item) && 'active'}}" ng-click="clickMenu(item)" ng-repeat="item in menu">
          <i class="fa fa-{{item.i}}" ng-if="item.i"></i>
          <span>{{item.text}}</span>
          <div class="n flex-cc" ng-if="item.n">{{item.n}}</div>
        </div>
      </div>`,
    bindings: {
    },
    controller: [
      '$scope', '$http', '$q', '$rootScope', 'DjState', '$element', '$browser', 'Observable',
      function ($scope, $http, $q, $rootScope, DjState, $element, $browser, Observable) {
        $element.addClass("flex-v");
        $scope.appInited = true;

        // if ("首次打开页面，不要动画") {
        //   $scope.isFirstRun = true;
        //   $rootScope.$on("$DjRouteChangeStart", function (event, newState, oldState, isFirstRun) {
        //     $scope.isFirstRun = isFirstRun;
        //   });
        // }

        var 标题栏 = true;
        var 菜单栏 = true;

        if (菜单栏) {
          var userMenu = $scope.menu = [
            { text: "查询", i: "search", path: "page2" },
            { text: "功能", i: "list ", path: "page1" },
            { text: "我的", i: "home", path: "home" },
          ];

          /**
           * 点击菜单响应
           */
          $scope.clickMenu = item => {
            // console.log('点击菜单,', item);
            DjState.go(item.path, item.param || {});
          }

          /**
           * 是否活动项
           */
          $scope.isActive = item => {
            return $scope.statePath == item.path;
          }
        }

        var router = $scope.router = Observable("app-router");
        ["pageCss", "pageCssMore", "hideTitle", "hideFooter", "statePath"].map(name => {
          router.observe(name, function (v) {
            $scope[name] = v;
          });
        });
        router.observe("pageTitle", function (pageTitle) {
          $http.post("设置页面标题", pageTitle);
        });

        if (标题栏) {
          /** 后退按钮 */
          var btnGoback = {
            fa: "angle-left",
            click: function () {
              history.go(-1)
            }
          }

          /** 首页按钮 */
          var btnHome = {
            fa: "home",
            click: function () {
              setTimeout(() => DjState.go(homeState));
            }
          }
          /** header 数据 */
          var default_header = {
            left: [btnGoback],
            // right: ['qrcode', btnHome],
            right: [btnHome],
          }
          $scope.header = false;
          $scope.footer = false;
          router.observe("pageTitle", function (pageTitle) {
            $scope.header = $scope.header || default_header;
            $scope.header.text = pageTitle;
          });
          router.observe("hideHeader", function (v) {
            $scope.header = $scope.header || default_header;
            $scope.header.hide = !!v;
          });
          router.observe("header", function (v) {
            $scope.header = $scope.header || default_header;
            angular.extend($scope.header, v);
            $scope.header.hide = !!v.hide;
          });
          router.observe("footer", function (v) {
            $scope.footer = $scope.footer || {};
            angular.extend($scope.footer, v);
            $scope.footer.hide = !!v.hide;
          });

        }

        /** 路由和历史监听 */
        $rootScope.$on("$DjRouteChangeSuccess", function (event, newState, oldState) {
          $scope.isGoBack = oldState && oldState.id > newState.id;
          $scope.canBack = newState.id > 1;
          $scope.isFirstRun = !oldState;
          console.log("前进/后退", newState, oldState);
        });

      }]
  })


  theModule.component("myAppHeader", {
    template: `
      <div class="header flex flex-between flex-stretch">
        <div class="left btns flex-left flex-1 flex-stretch">
          <div class="flex flex-cc" ng-click="clickBtn(btn(item))" ng-if="!btn(item).hide" ng-repeat="item in $ctrl.d.left">
            <i class="fa fa-{{btn(item).fa}}"> </i>
            <div class="text info">{{btn(item).text}}</div>
          </div>
        </div>
        <div class="text flex-cc flex-2">{{$ctrl.d.text}}</div>
        <div class="right btns flex-right flex-1 flex-stretch">
          <div class="flex flex-cc" ng-click="clickBtn(btn(item))" ng-if="!btn(item).hide" ng-repeat="item in $ctrl.d.right">
            <i class="fa fa-{{btn(item).fa}}"> </i>
            <div class="text info">{{btn(item).text}}</div>
          </div>
        </div>
      </div>`,
    bindings: {
      d: "<"
    },
    controller: ["$scope", "$rootScope", "$http", "DjState", "$location", function ctrl($scope, $rootScope, $http, DjState, $location) {

      /** 后退按钮 */
      var btnGoback = {
        fa: "angle-left",
        click: function () {
          history.go(-1)
        }
      }

      /** 关闭对话框按钮 */
      var btnCloseDialog = {
        fa: "angle-left",
        click: function () {
          $location.path("");
        }
      }

      /** 首页按钮 */
      var btnHome = {
        fa: "home",
        click: function () {
          setTimeout(() => DjState.go(homeState));
        }
      }

      /** 二维码按钮 */
      var btnQrcode = {
        fa: "qrcode",
        click: function () {
          $http.post("扫描二维码").then(result => {
            console.log("result");
          })
        }
      }

      var btns = {
        qrcode: btnQrcode,
        home: btnHome,
        back: btnGoback,
        closeDialog: btnCloseDialog,
      }

      $scope.btn = function (nameOrBtn) {
        return btns[nameOrBtn] || nameOrBtn;
      }

      $scope.clickBtn = function (btn) {
        if (angular.isFunction(btn.click)) {
          return btn.click(btn);
        }
        if (btn.state) {
          return setTimeout(() => DjState.go(btn.state.name, btn.state.search));
        }
      }
    }]
  });






  /**
   * 页面路由参数监听（Observable）
   */
  angular.module("dj-view").run([
    "$rootScope",
    "$q",
    "$http",
    "Observable",
    function ($rootScope, $q, $http, Observable) {
      var router = Observable("app-router");

      function when(param, name, newPage) {
        var value = param[name];
        if (angular.isFunction(value)) {
          value = value(newPage, $q, $http);
        }
        return $q.when(value)
      }

      $rootScope.$on("$DjPageNavgateStart", function (event, newPage, oldPage) {
        console.log();
        router.newPage = newPage;
        router.oldPage = oldPage;
        router.newState = newPage.state;
        router.newComponent = newPage.component;

        var param = (newPage.component || {}).param;
        param && ["pageTitle", "pageCss", "pageCssMore", "hideTitle", "hideFooter"].map(name => {
          when(param, name, newPage).then(v => {
            if (!angular.equals(router[name], v))
              router[name] = v;
          });
        });
        param && ["header", "footer"].map(name => {
          when(param, name, newPage).then(v => {
            v = v || {};
            if (!angular.equals(router[name], v))
              router[name] = v;
          });
        });

        /** 观察标题 */
        when(newPage, "state").then(state => {
          router.state = state;
          router.statePath = state.path;
        });
      });
    }]);




  /**
   * 设置页面标题
   * 由 $http 拦截服务实现
   */
  theModule.run(["sign", function (sign) {


    /**
     * 设置 html 页面标题
     */
    function setHtmlTitle(title) {
      document.title = title;
      if (navigator.userAgent.indexOf("MicroMessenger") > 0) {
        // hack在微信等webview中无法修改document.title的情况
        var body = document.body,
          iframe = document.createElement('iframe');
        iframe.src = "/null.html";
        iframe.style.display = "none";
        iframe.onload = function () {
          setTimeout(function () {
            body.removeChild(iframe);
          }, 0);
        }
        body.appendChild(iframe);
      }
    }
    /**
     * 设置页面标题, 根据是否显示标题栏，显示不同内容
     */
    function setTitleAuto(title) {
      var defaultTitle = window.theSiteConfig.title;
      title = title || "";
      var hide = !!title.hide;
      title = title.title || title.text || title || "";
      if (hide) {
        setHtmlTitle((title && (title + '-') || '') + defaultTitle.text)
      }
      else {
        setHtmlTitle(defaultTitle.text);
      }
    }

    /**
     * $http 拦截
     */
    sign.registerHttpHook({
      match: /^设置页面标题$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        setTitleAuto(param.title || param);
        return mockResponse.resolve(1);
      }
    });
  }]);







})(angular, window);
