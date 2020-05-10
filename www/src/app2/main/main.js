!(function (window, angular, undefined) {

  angular.isPC = !/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent);

  //alert(location.href);
  //alert(decodeURIComponent(location.href));

  if (location.search) {
    //alert("有参数,href=" + location.href);
    history.replaceState({}, null, location.pathname + location.hash);
    //location.href = location.pathname + location.hash;
    setTimeout(() => {
      angular.module('my-app', ['dj-app']);
      angular.bootstrap(document, ['my-app']);
    }, 200)
  } else {
    angular.module('my-app', ['dj-app']);
    angular.bootstrap(document, ['my-app']);
  }

})(window, angular);
