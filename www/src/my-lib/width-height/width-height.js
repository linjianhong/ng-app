
!(function (window, angular, undefined) {

  var theModule = angular.module('dj-ui');

  theModule.directive('widthHeight', [function () {
    return function (scope, element, attrs) {
      scope.$watch(function () {
        return element[0].offsetHeight;
      }, height => {
        element[0].style.width = height + "px";
      });
    };
  }]);

  theModule.directive('heightWidth', [function () {
    return function (scope, element, attrs) {
      scope.$watch(function () {
        return element[0].offsetWidth;
      }, width => {
        element[0].style.height = width + "px";
      });
    };
  }]);

  function directiveWidthHeight(name, delay) {
    var isWidth = /width/i.test(name);
    var isHeight = /height/i.test(name);
    if (!isHeight && !isWidth) return;
    var isParent = /parent/i.test(name);
    var isMax = /max/i.test(name);
    var watchName = isWidth && "offsetWidth" || "offsetHeight";
    var setName = isMax && (isWidth && "maxWidth" || "maxHeight") || (isWidth && "width" || "height");
    theModule.directive(name, [function () {
      var timer = 0;
      return function (scope, element, attrs, a, b, c) {
        function delayEmit(px) {
          if (attrs[name] == "no") return;
          if (angular.isNumber(delay)) {
            if (timer) $timeout.cancel(timer);
            timer = $timeout(() => {
              element[0].style[setName] = px + "px";
            }, delay);
          } else {
            element[0].style[setName] = px + "px";
          }
        }
        var fromElement = (isParent ? element.parent() : element)[0];
        scope.$watch(function () {
          return fromElement[watchName] - (attrs[name] || 0);
        }, delayEmit);
      };
    }]);
  }
  directiveWidthHeight('widthSelf');
  directiveWidthHeight('heightSelf');
  directiveWidthHeight('widthParent');
  directiveWidthHeight('heightParent');
  directiveWidthHeight('maxWidthParent');
  directiveWidthHeight('maxHeightParent');


  /** 剩余的高度 */
  theModule.directive('heightSpace', ["$parse", "$timeout", function ($parse, $timeout) {
    return function (scope, element, attrs) {
      var parentElement = element.parent()[0];
      var selfElement = element[0];
      scope.$watch(function () {
        return parentElement.offsetHeight;
      }, parentHeight => {
        var height = parentHeight;
        // console.log(`id=${scope.$id}, H=${parentHeight}`, parentElement, selfElement);
        for (var i = parentElement.children.length - 1; i >= 0; i--) {
          var node = parentElement.children[i];
          if (node != selfElement) {
            height -= node.offsetHeight;
          }
        };
        element[0].style.height = height + "px";
      });
    };
  }]);

  /** 剩余的宽度 */
  theModule.directive('widthSpace', [function () {
    return function (scope, element, attrs) {
      var parentElement = element.parent()[0];
      var selfElement = element[0];
      scope.$watch(function () {
        return parentElement.offsetWidth;
      }, parentWidth => {
        var width = parentWidth;
        // console.log(`id=${scope.$id}, H=${parentWidth}`, parentElement, selfElement);
        for (var i = parentElement.children.length - 1; i >= 0; i--) {
          var node = parentElement.children[i];
          if (node != selfElement) {
            width -= node.offsetWidth;
          }
        };
        element[0].style.width = width + "px";
      });
    };
  }]);

  /** 剩余的宽度 */
  theModule.directive('onWidth', ["$parse", "$timeout", function ($parse, $timeout) {
    return function (scope, element, attrs) {
      var handler = $parse(attrs.onWidth);
      var timer = 0;
      function delayEmit() {
        if (timer) $timeout.cancel(timer);
        timer = $timeout(() => {
          var width = element[0].offsetWidth;
          handler(scope, { width });
        }, 150);
      }

      scope.$watch(function () {
        return element[0].offsetWidth;
      }, delayEmit);

      scope.$on('window-resize', function (event, data) {
        delayEmit();
        $timeout(() => 0, 150);
      });
    };
  }]);

})(window, angular);