!(function (window, angular, undefined) {

  var theModule = angular.module('dj-ui');

  slideDirective("slideLeft", {});
  slideDirective("slideRight");
  slideDirective("slideUp");
  slideDirective("slideDown");

  function slideDirective(name) {
    theModule.directive(name, ["$q", "$animateCss", function ($q, $animateCss) {
      // console.log("监听 指令", name)
      return function (scope, element, attrs) {
        var fire = {
          name,
          fire: () => scope.$eval(attrs[name])
        }
        CSlideMove.attach(element, { element, scope, attrs, $q, $animateCss }).addDirective(fire);
      }
    }]);
  }

  theModule.directive("slideLeftRight", ["$q", "$animateCss", function ($q, $animateCss) {
    return function (scope, element, attrs) {
      var R = {};
      var directive_handlers = scope.$eval(attrs["slideLeftRight"]) || {};
      var default_handlers = {
        onStart: (ctrl, x_y_t) => {
          R.baseLeft = element[0].offsetLeft;
          //console.log("默认按下", x_y_t)
        },
        onMove: (ctrl, x_y_t) => {
          element[0].style.left = (R.baseLeft + ctrl.x1 - ctrl.x0) + "px";
        },
        onEnd: (ctrl, slided) => {
          element[0].style.left = R.baseLeft + "px";
        },
        onCancel: (ctrl, x_y_t) => {
          element[0].style.left = R.baseLeft + "px";
        },
      }
      var handlers = {};
      ["onStart", "onMove", "onEnd", "onCancel"].map(name => {
        handlers[name] = (ctrl, arg) => {
          if (directive_handlers[name]) {
            var result = directive_handlers[name](ctrl, arg, R);
            if (result === false) return;
            return $q.when(result).then(() => {
              return default_handlers[name](ctrl, arg);
            });
          }
          else return default_handlers[name](ctrl, arg);
        }
      });
      CSlideMove.attach(element, { element, $animateCss, handlers });
    }
  }]);



  /**
   * AA
   */

  var MAX_MOVE = 10; // 超过这个值，表示已滑动，不再是点击了
  var FAST_SPEED = 1.5; // 快速滑动系数，越小，表示满足快速滑动的速度越大
  var SLOW_SLIDE_DX = 150; // 慢速移动，可触发的最小长度
  var FAST_SLIDE_DX = 50; // 快速移动，可触发的最小长度

  function beginSlide(x1, x0) {
    return Math.abs(x1 - x0) > MAX_MOVE;
  }
  function checkFast(dt, x1, x0) {
    var dx = Math.abs(x1 - x0);
    return dx * FAST_SPEED > dt
  }
  function isSlided(dt, x1, fast_x0, slow_x0) {
    return checkFast(dt, x1, fast_x0) && Math.abs(x1 - fast_x0) > FAST_SLIDE_DX || Math.abs(x1 - slow_x0) > SLOW_SLIDE_DX;
  }

  class CSlideMove {
    constructor(params) {
      this.params = params || {};
      this.directives = this.params.directives || [];
      this.handlers = this.params.handlers || {};
      this.$animateCss = this.params.$animateCss || "";
      this.element = this.params.element || "";
      this.setupEventListener();
    }

    initEventListener() {
      this.eventListeners = this.eventListeners || [
        { name: 'mousedown', fn: event => this.on_mousedown(event), element: this.element[0] },
        { name: 'mousemove', fn: event => this.on_mousemove(event), element: document },
        { name: 'mouseup', fn: event => this.on_mouseup(event), element: document },
        { name: 'touchstart', fn: event => this.on_touchstart(event), element: this.element[0] },
        { name: 'touchmove', fn: event => this.on_touchmove(event), element: document },
        { name: 'touchend', fn: event => this.on_touchend(event), element: document },
      ];
    }

    beginListenEvent(name) {
      var item = this.eventListeners.find(item => item.name == name);
      item && item.element.addEventListener(item.name, item.fn, true);
    }

    stopListenEvent(name) {
      var item = this.eventListeners.find(item => item.name == name);
      item && item.element.removeEventListener(item.name, item.fn, true);
    }

    setupEventListener() {
      this.initEventListener();
      this.beginListenEvent('mousedown');
      this.beginListenEvent('touchstart');
    }

    /** 鼠标按下后，开始监听移动和放开事件 */
    beginMoreListener() {
      this.eventListeners.map(item => {
        if (item.element == document && !item.listening) {
          item.element.addEventListener(item.name, item.fn, { passive: false });
          item.listening = true;
        }
      });
    }

    /** 取消后，终止监听移动和放开事件，以提高性能 */
    stopMoreListener() {
      this.eventListeners.map(item => {
        if (item.element == document && item.listening) {
          item.element.removeEventListener(item.name, item.fn, { passive: false });
          item.listening = false;
        }
      });
    }

    addDirective(fire) {
      this.directives = this.directives.filter(a => a.name != fire.name);
      this.directives.push(fire);
    }
    fireDirective(name) {
      this.directives.map(fire => {
        if (fire.name == name) fire.fire();
      })
    }

    on_mousedown(event) {
      this.onStart({ t: event.timeStamp, x: event.pageX, y: event.pageY });
      this.beginListenEvent('mousedown', document);
    }
    on_mousemove(event) {
      if (this.onMove({ t: event.timeStamp, x: event.pageX, y: event.pageY })) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    on_mouseup(event) {
      if (this.onEnd({ t: event.timeStamp, x: event.pageX, y: event.pageY })) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    on_touchstart(event) {
      if (event.touches.length != 1) return this.onCancel();
      this.onStart({ t: event.timeStamp, x: event.touches[0].pageX, y: event.touches[0].pageY });
    }
    on_touchmove(event) {
      if (this.onMove({ t: event.timeStamp, x: event.touches[0].pageX, y: event.touches[0].pageY })) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    on_touchend(event) {
      if (this.onEnd({ t: event.timeStamp })) {
        event.preventDefault();
        event.stopPropagation();
      }
    }


    onStart(x_y_t) {
      this.beginMoreListener();
      this.handlers.onStart && this.handlers.onStart(this, x_y_t);
      this.begin = true;
      this.moved = false;
      this.x0 = this.x1 = x_y_t.x;
      this.y0 = this.y1 = x_y_t.y;
      this.fastX = { x: this.x1, t: x_y_t.t };
      this.fastY = { y: this.y1, t: x_y_t.t };
      //console.log("滑屏, 开始", this);
    }

    onMove(x_y_t) {
      if (!this.begin) return;
      this.x1 = x_y_t.x;
      this.y1 = x_y_t.y;
      var beginSlideX = beginSlide(this.x1, this.x0);
      var beginSlideY = beginSlide(this.y1, this.y0);
      //console.log("滑屏, onMove", beginSlideX, beginSlideY);
      if (!this.moved && !beginSlideX && !beginSlideY) {
        return;
      }
      this.handlers.onMove && this.handlers.onMove(this, x_y_t);
      this.moved = true;
      /** 要随时检查快速移动情况, 保证慢速时, 重置快慢状态 */
      this.checkFastX(x_y_t.t);
      this.checkFastY(x_y_t.t);
      /** 总是要阻止默认行为，以防止变成拖拽 */
      return true;
    }

    onEnd(x_y_t) {
      this.stopMoreListener();
      this.begin = false;
      var xSlided = isSlided(x_y_t.t - this.fastX.t, this.x1, this.fastX.x, this.x0);
      var ySlided = isSlided(x_y_t.t - this.fastX.t, this.y1, this.fastY.y, this.y0);
      this.handlers.onEnd && this.handlers.onEnd(this, { xSlided, ySlided, });
      //console.log("滑屏, onEnd", xSlided, x_y_t.t - this.fastX.t, this.x1 - this.x0, this.fastX.x - this.x0);
      if (!xSlided && !ySlided) return;
      if (xSlided) {
        if (this.x1 > this.x0) this.fireDirective("slideRight");
        else this.fireDirective("slideLeft");
      }
      if (ySlided) {
        if (this.y1 > this.y0) this.fireDirective("slideDown");
        else this.fireDirective("slideUp");
      }
      return true;
    }

    onCancel(x_y_t) {
      this.begin = false;
      this.stopMoreListener();
      this.handlers.onCancel && this.handlers.onCancel(this, x_y_t);
    }


    checkFastX(t) {
      var dt = t - this.fastX.t;
      var fast_x = checkFast(dt, this.x1, this.fastX.x);
      // if (fast_x) console.log("快！", this.x1 - this.fastX.x, dt)
      if (fast_x) return true;
      // 不够快，数据重置
      this.fastX = { x: this.x1, t: t };
      return false;
    }
    checkFastY(t) {
      var dt = t - this.fastY.t;
      var fast_y = checkFast(dt, this.y1, this.fastY.y);
      if (fast_y) return true;
      // 不够快，数据重置
      this.fastY = { y: this.y1, t: t };
      return false;
    }


    animateSlide($scope, ctrl, slided) {
      if (slided.xSlided) {
        var to_left = ctrl.element[0].offsetWidth * (ctrl.x1 > ctrl.x0 ? 1 : -1);
        $scope.$emit("slide-left-right-start", { ctrl: ctrl, slided });
        var animator = ctrl.$animateCss(ctrl.element, {
          from: { left: ctrl.element[0].offsetLeft + "px" },
          to: { left: to_left + "px" },
          easing: 'ease',
          duration: 0.36 // 秒
        });
        animator.start().then(() => {
          ctrl.element[0].style.left = "0";
          $scope.$emit("slide-left-right-end", { ctrl: ctrl, slided });
        });
        return false;
      }
    }
  }

  CSlideMove.attach = (element, params) => {
    /** 多个相同指令, 仅监听一次 */
    if (!element.slideEvent) {
      element.slideEvent = new CSlideMove(params);
    }
    return element.slideEvent;
  }

})(window, angular);