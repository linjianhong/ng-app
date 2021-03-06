!(function (window, angular, undefined) {

  var theModule = angular.module('dj-pop');

  theModule.component('djComponentHost', {
    bindings: {
      component: '@',
      param: '<',
    },
    controller: ["$scope", "$element", "$compile", function ($scope, $element, $compile) {
      $scope.ZZZ = "DJ_POP";
      this.$onChanges = (changes) => {
        if (changes.component && changes.param) {
          compile(changes.component.currentValue, changes.param.currentValue);
          return;
        }
        if (changes.component) {
          compile(changes.component.currentValue, this.param);
          return;
        }
        if (changes.param) {
          compile(this.component, changes.param.currentValue);
          return;
        }
      }
      function compile(name, param) {
        if (!name) {
          $element.html("");
          return;
        }
        var sBinds = "";
        if (param) for (var k in param) {
          $scope[k] = param[k];
          sBinds += ` ${k}="${k}"`
        }
        $element.html(`<div class="dj-pop-box"><${name} ${sBinds}></${name}></div>`);
        $compile($element.contents())($scope);
      };
    }]
  });


  /** 仅供 DjPop 调用 */
  theModule.component('djPopBox', {
    bindings: {
      component: '@'
    },
    template: `<dj-component-host param="param || options.param" component="{{$ctrl.component}}"></dj-component-host>`
  });
  theModule.component('djPopToastBox', {
    bindings: {
    },
    template: `<dj-toast delay="{{options.param.delay}}" text="{{options.param.text}}"></dj-toast>`
  });

  theModule.factory("DjPop", ["$compile", "$rootScope", "DjWaiteReady", "$animateCss", "$q", function ($compile, $rootScope, DjWaiteReady, $animateCss, $q) {

    /**
     * 显示功能
     * @param {string} component
     * @param {object} options
     * @param {function|false} options.beforeClose: 将要关闭，返回 false, 或 reject, 不可关闭
     * @param {function|false} options.onClose: 关闭时回调
     */
    function show(component, options) {
      options = options || {};
      var waiteDialog = new DjWaiteReady();
      var element = options.element || document.body;
      var scopeParent = options.scope || $rootScope;
      var template = options.template || `<dj-pop-box component="${component}"></dj-pop-box>`;
      var dlg = $compile(template)(scopeParent);
      element.append(dlg[0]);
      var scopeDjPop = dlg.children().scope();
      scopeDjPop.options = options;
      if (options.hookClose !== false) {
        var listener = scopeDjPop.$on("dj-pop-box-close", function (event, data) {
          event.preventDefault();
          closeDjg(data);
        });
        //显示时按浏览器的后退按钮：关闭对话框
        var listener2 = scopeDjPop.$on("$locationChangeStart", function (event) {
          event.preventDefault();
          closeDjg("locationChange");
        });
        //显示时按浏览器的后退按钮：关闭对话框
        var listener3 = scopeDjPop.$on("$DjRouteChangeStart", function (event) {
          event.preventDefault();
          closeDjg("DjRouteChangeStart");
        });
      }
      return waiteDialog.ready();

      function closeDjg(data) {
        setTimeout(() => {
          scopeDjPop.$destroy();
          dlg && dlg.remove();
          dlg = null;
        })
        //console.log('对话框关闭', data);
        waiteDialog.resolve(data);
      }
    }


    /**
     * 显示功能
     * @param {string} component
     * @param {object} options
     * @param {function|false} options.beforeClose: 将要关闭，返回 false, 或 reject, 不可关闭
     * @param {function|false} options.onClose: 关闭时回调
     */
    function showComponent(options) {
      if (!options || !options.template) return $q.reject("无模板");
      var waiteDialog = new DjWaiteReady();
      var element = options.element || document.body;
      var scopeParent = options.scope || $rootScope;
      var scopeDjPop = scopeParent.$new();
      scopeDjPop.param = options.param;
      var template = options.template;
      var dlg = angular.element(`<div>${template}</div>`);
      angular.element(element).append(dlg);
      dlg.scope(scopeDjPop);
      $compile(dlg)(scopeDjPop);

      if (options.hookClose !== false) listenCloseDlg(scopeDjPop, dlg, options, waiteDialog);
      return waiteDialog.ready();
    }
    /**
     * 显示功能
     * @param {string} component
     * @param {object} options
     * @param {function|false} options.beforeClose: 将要关闭，返回 false, 或 reject, 不可关闭
     * @param {function|false} options.onClose: 关闭时回调
     */
    function showComponentAutoParams(componentName, params, options) {
      // 默认标志弹出状态为真
      params = angular.extend({ poping: 1 }, params);
      options = options || {};
      var waiteDialog = new DjWaiteReady();
      var element = options.element || document.body;
      var scopeParent = options.scope || $rootScope;
      var scopeDjPop = scopeParent.$new();
      var attr = [];
      for (var k in params) {
        if (params.hasOwnProperty(k)) {
          if (k == "class" || k == "style") {
            attr.push(`${k}="${params[k]}"`);
          }
          else {
            attr.push(`${k.replace(/([A-Z])/g, "-$1").toLowerCase()}="${k}"`);
            scopeDjPop[k] = params[k];
          }
        }
      }
      var template = `<${componentName} ${attr.join(' ')}></${componentName}>`;
      var dlg = angular.element(`<div class="djui-fixed-box ${options.css || ""}" ng-click="clickBack($event)">${template}</div>`);
      scopeDjPop.clickBack = function (event) {
        if (event.target != event.currentTarget) return;
        if (!params.backClose) return;
        event.preventDefault();
        event.stopPropagation();
        scopeDjPop.$emit("dj-pop-box-close", "clickBack");
      }
      angular.element(element).append(dlg);
      dlg.scope(scopeDjPop);
      $compile(dlg)(scopeDjPop);

      /** 动画效果 */
      if (options.animationShow) {
        var animation = options.animationShow;
        if (angular.isFunction(options.animation)) {
          $q.when(animation({ element: dlg, scope: scopeDjPop })).then(animation => {
            $animateCss(dlg, animation).start();
          })
        } else {
          $animateCss(dlg, animation).start();
        }
      }

      /** 关闭对话框功能 */
      if (options.hookClose !== false) listenCloseDlg(scopeDjPop, dlg, options, waiteDialog);

      /** 返回承诺 */
      return waiteDialog.ready();
    }


    function listenCloseDlg(scopeDjPop, dlg, options, waiteDialog) {
      var listener = scopeDjPop.$on("dj-pop-box-close", function (event, data) {
        event.preventDefault();
        event.stopPropagation();
        if (data.btnName) {
          closeDjg(data);
        }
        else {
          closeDjg({ btnName: data, param: scopeDjPop.param });
        }
      });


      /** 最后的监听有效 */
      function waitNextThenClose(data) {
        data.push(scopeDjPop.$id);
        var defaultPrevented = $rootScope.$broadcast("pop-box-close-locationChangeStart", data);
        if (!defaultPrevented.defaultPrevented) {
          // event.preventDefault();
          // console.log("最前的对话框", scopeDjPop.$id, data);
          closeDjg("locationChange 1");
        } else {
          // console.log("前面还有对话框", scopeDjPop.$id, data);
        }
      }
      scopeDjPop.$on("pop-box-close-locationChangeStart", function (event, data) {
        // console.log("新消息", scopeDjPop.$id, data);
        if (data.indexOf(scopeDjPop.$id) >= 0) {
          // console.log("自己替换", scopeDjPop.$id, data);
          return;
        }
        event.preventDefault();
        // console.log("重新替换", scopeDjPop.$id, data);
        waitNextThenClose(data);
      });



      //显示时按浏览器的后退按钮：关闭对话框
      var listener2 = scopeDjPop.$on("$locationChangeStart", function (event) {
        // console.log("后退按钮", scopeDjPop.$id, event.defaultPrevented);
        if (event.defaultPrevented) return;
        event.preventDefault();
        waitNextThenClose([]);
      });
      //显示时按浏览器的后退按钮：关闭对话框
      var listener3 = scopeDjPop.$on("$DjRouteChangeStart", function (event) {
        console.log("关闭对话框，　listener3 ", scopeDjPop.$id, event.defaultPrevented);
        // 最后的监听有效
        if (event.defaultPrevented) return;
        event.preventDefault();
        closeDjg("DjRouteChangeStart");
      });
      function closeDjg(data) {
        setTimeout(() => {
          /** 动画效果 */
          if (options.animationHide) {
            var animation = options.animationHide;
            if (angular.isFunction(options.animation)) animation = animation({ element: dlg, scope: scopeDjPop });
            $animateCss(dlg, animation).start().finally(() => {
              scopeDjPop.$destroy();
              dlg && dlg.remove();
              dlg = null;
            });
          }
          else {
            scopeDjPop.$destroy();
            dlg && dlg.remove();
            dlg = null;
            //console.log('对话框关闭', data);
          }
          waiteDialog.resolve(data);
        })
      }
    }


    function component(componentName, params, options) {
      return showComponentAutoParams(componentName, params, options);
    }


    function dialog(componentName, params, options) {
      return showComponentAutoParams(componentName, params, options).then(result => {
        var btnName = result && result.btnName || result;
        if (btnName != "OK") {
          return $q.reject(btnName)
        }
        return result;
      });
    }


    function gallery(params, options) {
      return showComponentAutoParams("djui-gallery", params, options);
    }

    function toast(text, delay) {
      var options = {};
      if (angular.isObject(text)) {
        options = text;
        delay = text.delay;
        text = text.text;
      }
      options.template = `<dj-toast text="${text}" delay="${delay}"></dj-toast>`;
      // options.hookClose = false;
      return showComponent(options);
    }

    function alert(body, title) {
      var options = { param: { body, title, backClose: 1, cancel: { hide: 1 } } };
      if (angular.isObject(body)) {
        options = body;
        if (!options.param) options = { param: options };
      }
      options.template = `<djui-dialog param="param">${options.template || ''}</djui-dialog>`;
      return showComponent(options).then(result => {
        if (!result || result.btnName != "OK") {
          return $q.reject(result)
        }
        return result;
      });
    }

    function confirm(body, title) {
      var options = { param: { body, title } };
      if (angular.isObject(body)) {
        options = body;
        if (!options.param) options = { param: options };
      }
      options.template = `<djui-dialog param="param">${options.template || ''}</djui-dialog>`;
      return showComponent(options).then(result => {
        if (!result || result.btnName != "OK") {
          return $q.reject(result)
        }
        return result;
      });
    }

    function warning(body, title) {
      var options = { param: { body, title } };
      if (angular.isObject(body)) {
        options = body;
        if (!options.param) options = { param: options };
      }
      options.template = `
        <djui-dialog param="param">
          <djui-dialog-body class="flex-left padding-2">
            <i class="fa fa-warning em-3 text-warning em-30"></i>
            <div class="padding-2">${body}</div>
          </djui-dialog-body>
        </djui-dialog>`;
      return showComponent(options).then(result => {
        if (!result || result.btnName != "OK") {
          return $q.reject(result)
        }
        return result;
      });
    }

    function input(title, text, placeholder) {
      var options = { param: { title, text, placeholder } };
      if (angular.isObject(title)) {
        options = title;
        if (!options.param) options = { param: options };
      }
      options.template = `<djui-dialog param="param"><djui-dialog-body><textarea class="djui-dialog-input" ng-model="param.text" placeholder="${options.param.placeholder || ''}"></textarea></djui-dialog-body></djui-dialog>`;
      return showComponent(options).then(result => {
        if (!result || !result.param || result.btnName != "OK") {
          return $q.reject(result)
        }
        return result.param.text;
      });
    }

    return {
      show,
      alert,
      confirm,
      warning,
      input,
      toast,
      gallery,
      component,
      dialog,
    }
  }])


})(window, angular);