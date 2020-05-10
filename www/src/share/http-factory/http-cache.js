!(function (angular, window, undefined) {

  var MAX_CACHE_LENGTH = 500;

  var theModule = angular.module('dj-http')

  /**
   * 延时缓存类
   * 
   * // 在5秒内有请求的，使用原请求，否则重新请求
   * $http.post("缓存请求", { api: "user/info", data:{}, delay: 5000 })
   * 
   * // 清除缓存
   * $http.post("缓存请求", { api: "user/info", reset: true })
   */
  theModule.run(['$http', '$q', 'sign', function ($http, $q, sign) {

    function CHttpCache($q, delay, fn_ajax) {
      this.cacheDelay = delay || $q || 30;
      this.timestamp = 0;
      this.promise = false;
      this.fn_ajax = fn_ajax;
      if ($q && $q.defer && !CHttpCache.$q) {
        CHttpCache.$q = $q;
      }
    }
    CHttpCache.prototype = {
      getPromise: function (delay, debugInfo) {
        delay = delay || this.cacheDelay;
        var timestamp = Math.round((new Date()).getTime());
        var hasCache = this.promise && timestamp - this.timestamp <= delay;
        if (!hasCache) {
          this.promise = CHttpCache.$q.when(this.fn_ajax()).catch(e => {
            this.promise = false;
            // console.log("api reject", e)
            return CHttpCache.$q.reject(e);
          });
          this.timestamp = timestamp;
          // console.log("缓存已失效, 重新请求... ", debugInfo.name);
        } else {
          // console.log("缓存有效", debugInfo.name);
        }
        return CHttpCache.$q.when(this.promise).then(json => {
          // console.log("缓存请求成功", debugInfo.name, json);
          return this.promise = json;
        }).catch(e => {
          console.error("缓存请求失败", debugInfo.name, e);
          return CHttpCache.$q.reject(e);
        });
      },
    };
    var theHttpCaches = [];
    function getHttpCache(options) {//api, data, delay){
      options = angular.extend({ data: {} }, options);
      var data = options.data;
      var name = options.name || options.api;
      var cache = theHttpCaches.find(cache => cache.name == name && angular.equals(cache.data, data));
      // 如果是要删除：
      if (options.reset) {
        // 删除这一缓存
        if (cache) {
          theHttpCaches.splice(theHttpCaches.indexOf(cache), 1);
          // console.log("删除缓存 OK", name, cache);
          return $q.when("reset!");
        }
        // console.log("删除缓存 无", name);
        return $q.reject("reset none!");
      }
      if (!cache) {
        cache = {
          name,
          data,
          ajaxing: new CHttpCache($q, options.delay, () => {
            // console.log("缓存无效或过期, 重新请求, ", name, options);
            return $http.post(options.api, options.data);
          })
        };
        if (theHttpCaches.length > MAX_CACHE_LENGTH) theHttpCaches.shift();
        theHttpCaches.push(cache);
      }
      // 正常返回请求
      return cache.ajaxing.getPromise(options.delay, { name }).then(json => angular.merge({}, json));
    }


    /** 请求拦截 */
    sign.registerHttpHook({
      match: /^缓存请求$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data
        return mockResponse.resolve(getHttpCache(param));
      }
    });
  }]);


})(angular, window);
