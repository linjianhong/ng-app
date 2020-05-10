
/**
 *  原生JS, 让dom元素可调节大小
 * 1. 设置 resize-x 属性，即可在该元素的最右边拖拽宽度
 * 2. 设置 resize-y 属性，即可在该元素的最下边拖拽高度
 * 3. 设置 resize-xy 属性，即可在该元素的右下角拖拽高度
 * 
 * 外观，需自行设置。如：

 ``` css
[resize-x]{position: relative;}
[resize-x]::after{
  content: ' ';
  width:3px;
  border-left: solid 1px #fff;
  border-right: solid 1px #888;
  background: #ccc;
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  cursor: ew-resize;
}
```
 */
!(function (window, undefined) {

  var INSIDE_DX = 10;
  var INSIDE_DY = 10;
  var INSIDE_DXY = 20;
  var MIN_DXY = 10;

  document.addEventListener('mousedown', MouseDown, true);
  document.addEventListener('touchstart', TouchDown, true);

  function MouseDown(event) {
    document.addEventListener('mousemove', MouseMove, true);
    Down(event);
  }
  function TouchDown(event) {
    document.addEventListener('touchmove', TouchMove, true);
    if (event.touches && event.touches.length != 1) return CancelMove();
    /** 获取偏移 */
    var top = 0, left = 0;
    for (var el = event.target; el; el = el.offsetParent) {
      var top = 0, left = 0;
      left += el.offsetLeft;
      top += el.offsetTop;
    }
    var pageX = event.touches[0].pageX;
    var pageY = event.touches[0].pageY;
    var offsetX = pageX - left;
    var offsetY = pageY - top;

    Down({
      target: event.target,
      offsetX,
      offsetY,
      pageX,
      pageY,
    });
  }

  function CancelMove() {
    document.removeEventListener('mousemove', MouseMove, true);
    document.removeEventListener('touchmove', TouchMove, true);
  }

  function MouseMove(event) {
    if (event.buttons && 1) {
      return theResize.Move(event);
    }
    else {
      CancelMove();
    }
  }
  function TouchMove(event) {
    if (event.touches && event.touches.length != 1) return CancelMove();
    var pageX = event.touches[0].pageX;
    var pageY = event.touches[0].pageY;
    return theResize.Move({
      target: event.target,
      pageX,
      pageY,
    });
  }

  function Down(event) {
    var offsetX = event.offsetX;
    var offsetY = event.offsetY;
    for (var el = event.target; el; el = el.parentNode) {
      if (theResize.test(event, el, offsetX, offsetY)) {
        return //"开始捕捉鼠标";
      }
      offsetX += el.offsetLeft;
      offsetY += el.offsetTop;
    }
    CancelMove();
  }
  var theResize = {
    test: function (event, el, offsetX, offsetY) {
      if (!el.hasAttribute) return false;
      theResize.Down = {
        pageX: event.pageX,
        pageY: event.pageY,
        offsetWidth: el.offsetWidth,
        offsetHeight: el.offsetHeight,
        el: el,
        sizing: false,
        X: false,
        Y: false,
      };
      if (el.hasAttribute("resize-x") && el.offsetWidth - offsetX < INSIDE_DX) {
        theResize.Down.X = true;
      }
      if (el.hasAttribute("resize-y") && el.offsetHeight - offsetY < INSIDE_DY) {
        theResize.Down.Y = true;
      }
      if (el.hasAttribute("resize-xy") && el.offsetWidth - offsetX < INSIDE_DXY && el.offsetHeight - offsetY < INSIDE_DXY) {
        theResize.Down.X = theResize.Down.Y = true;
      }
      return theResize.Down.X || theResize.Down.Y;
    },
    Move: function (event) {
      var Down = theResize.Down;
      if (!Down.el) return;
      var dx = event.pageX - Down.pageX;
      var dy = event.pageY - Down.pageY;
      if (!Down.sizing) {
        Down.sizing = Down.X && (dx > MIN_DXY || dx < -MIN_DXY) || Down.Y && (dy > MIN_DXY || dy < -MIN_DXY);
      }
      if (Down.sizing && Down.X) {
        Down.el.style.width = (Down.offsetWidth + dx) + "px";
      }
      if (Down.sizing && Down.Y) {
        Down.el.style.height = (Down.offsetHeight + dy) + "px";
      }
    }
  };

})(window);