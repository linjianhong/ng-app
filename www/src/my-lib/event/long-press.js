
!(function (window, angular, undefined) {

  var MAX_MOVE = 15;

  var theModule = angular.module('dj-ui');
  theModule.directive('longPress', [function () {

    return function (scope, element, attrs) {

      /** 指令传输的数据 */
      function getDelay() {
        return scope.$eval(attrs.delay) || 1000;
      }


      /** 处理功能 */
      var Mouse = {
        x: 0,
        y: 0,
        pressed: 0,
        fired: 0,
        reset: function (event) {
          Mouse.fired && event && event.preventDefault();
          Mouse.x = Mouse.y = Mouse.fired = Mouse.pressed = 0;
          clearTimeout(Mouse.timerId);
          // console.log("长按取消");
        },

        fire: function () {
          // console.log("长按生效...");
          Mouse.fired = 1;
          scope.$eval(attrs.longPress);
          scope.$apply();
        },

        onPress: function (event) {
          if (event.touches && event.touches.length > 1) return Mouse.reset();
          Mouse.x = (event.touches && event.touches[0] || event).clientX;
          Mouse.y = (event.touches && event.touches[0] || event).clientY;
          pressed = 1;
          // console.log("长按开始...");
          Mouse.timerId = setTimeout(Mouse.fire, getDelay());
        },

        onMove: function (event) {
          if (!Mouse.pressed) return;
          var x = (event.touches && event.touches[0] || event).clientX;
          var y = (event.touches && event.touches[0] || event).clientY;
          if (Mouse.x - x > MAX_MOVE || Mouse.y - y > MAX_MOVE || x - Mouse.x > MAX_MOVE || y - Mouse.y > MAX_MOVE)
            Mouse.reset();
        },

      }

      /** 事件监听 */
      element[0].addEventListener('mousedown', Mouse.onPress, true);
      element[0].addEventListener('touchstart', Mouse.onPress, true);
      element[0].addEventListener('mousemove', Mouse.onMove, true);
      element[0].addEventListener('touchmove', Mouse.onMove, true);
      element[0].addEventListener('mouseup', Mouse.reset, true);
      element[0].addEventListener('touchend', Mouse.reset, true);

    };
  }]);
})(window, angular);