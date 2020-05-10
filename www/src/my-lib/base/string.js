
/** 字符串数字排序 */
!(function () {
  if (!Number.isInteger) {
    Number.isInteger = function (num) {
      return typeof num == "number" && num % 1 == 0;
    };
  }
  function compUseNumber(a, b) {
    var aa = ((a || "") + "").match(/(\d+|[^\d]+)/g) || [];
    var bb = ((b || "") + "").match(/(\d+|[^\d]+)/g) || [];
    var length = aa.length;
    for (var i = 0; i < length; i++) {
      if (bb.length < i) {
        this.console.log("太短了")
      }
      if (Number.isInteger(+aa[i]) && Number.isInteger(+bb[i])) {
        var c = aa[i] - bb[i];
        if (c) return c;
      }
      else {
        var c = aa[i].localeCompare(bb[i] || "")
        if (c) return c;
      }
    }
    return bb.length > aa.length ? -1 : 0;
  }
  String.compUseNumber = compUseNumber;
  String.prototype.compUseNumber = function (b) {
    return compUseNumber(this.toString(), b);
  };
})();