/** 可观察对象 */
!(function (angular, window, undefined) {

  var theModule = angular.module("dj.observable", []);

  /**
   * 可观察对象 主类
   * 
   * Observable
   */
  var CObservable = (function () {

    /**
     * 可观察对象项
     */
    function CObservableItem(parent, name) {
      this.parent = parent; // 有风险？
      this.name = name;
      this.callback = [];
      var self = this;
      Object.defineProperty(parent, name, {
        get: function () {
          return self.value;
        },
        set: function (newValue) {
          self.value = newValue;
          self.run();
          return newValue;
        }
      });
    }
    CObservableItem.prototype = {
      run: function () {
        if (this.timerId) return;
        var timeout = this.$timeout || setTimeout;
        this.timerId = timeout(() => {
          this.callback.map(fn => angular.isFunction(fn) && fn(this.value));
          this.timerId = 0;
        });
      },
      then: function (callback) {
        if (angular.isFunction(callback)) {
          // 不重复添加观察
          if (this.callback.indexOf(callback) < 0) this.callback.push(callback);
          // 已有值的，将立即被观察到
          if (this.hasOwnProperty("value")) {
            callback(this.value);
          }
        }
        return this;
      },
      unobserve: function (callback) {
        this.callback = this.callback.filter(fn => fn != callback);
        return this;
      },
    }

    /**
     * 可观察对象类
     */
    function CObservable($timeout) {
      this.$timeout = $timeout;
      this.names = [];
    }
    CObservable.prototype = {
      create: function (name, initValue) {
        var item = this.names.find(item => item.name == name)
        if (!item) {
          item = new CObservableItem(this, name);
          item.$timeout = this.$timeout;
          if (arguments.length > 1) item.value = initValue;
          this.names.push(item);
        }
        return item;
      },

      /**
       * 不再被观察
       * 不能移除setter getter, 只能删除观察者回调
       */
      remove: function (name) {
        var item = this.names.find(item => item.name == name);
        if (item) {
          item.callback = [];
        }
      },

      /**
       * 添加一个可观察对象
       * @param name: 属性名
       * @param callback: 回调函数，空则只确保这个属性可观察
       */
      observe: function (name, callback) {
        var item = this.create(name);
        return item.then(callback);
      },
      /**
       * 停止观察
       */
      unobserve: function (name, callback) {
        var item = this.names.find(item => item.name == name);
        item && item.unobserve(callback);
        return item;
      },
    }
    return CObservable;
  })();

  /**
   * 可观察类 工厂模式
   */
  theModule.factory("CObservable", ["$q", function ($q) {
    return CObservable;
  }]);

  /**
   * 可观察对象 工厂模式
   * 
   * var ob = Observable("my-name");
   * ob.observe("k1").then(function(v){
   *   // watch v
   * });
   * ob.observe("k1", function(v){
   *   // watch v
   * });
   * Observable("my-name").observe("k1").then(function(v){
   *   // watch v
   * });
   * Observable("my-name", "k1").then(function(v){
   *   // watch v
   * });
   * 
   * // 以上几种方式，都可以观察到下面的赋值操作：
   * ob.k1 = 1;
   * Observable("my-name").k1 = 2;
   */
  !(function () {
    var list = {};
    theModule.factory("Observable", ["$timeout", function ($timeout) {
      function Observable(name, k) {
        name = name || "default";
        if (!list[name]) {
          list[name] = new CObservable($timeout);
        }
        if(typeof k == "string"){
          return list[name].observe(k);
        }
        return list[name];
      }
      return Observable;
    }]);

  })();

  theModule.run(["$http", "$q", "sign", function ($http, $q, sign) {
    /**
     * 可观察对象 http 模式
     */
    sign.registerHttpHook({
      match: /^Observable$/,
      hookRequest: function (config, mockResponse, match) {
        return mockResponse.resolve(CObservable);
      }
    });

    /**
     * 快速设置观察者对象
     *
     * $http.post("observe", {name: "k1"});
     *
     * $http.post("observe", {name: "k1", function(v) => {
     *   // 只要有赋值，即可被观察到，即使值并未改变
     *   console.log("k1 = ", v);
     * }}).then(obj => {
     *   setTimeout(()=>{
     *     // 可以再次赋值, 并被观察者观察到
     *     obj.k1 = "new Value"
     *   }, 2000)
     * })
     *
     * $http.post("observe/k1", function(v) => {
     *   // 只要有赋值，即可被观察到，即使值并未改变
     *   console.log("k1 = ", v);
     * }).then(obj => {
     *   setTimeout(()=>{
     *     // 可以再次赋值, 并被观察者观察到
     *     obj.k1 = "new Value"
     *   }, 2000)
     * })
     */
    var quickObservable = new CObservable();
    function observe(name, callback) {
      quickObservable.observe(name, callback && function (value) {
        $q.when(value).then(value => {
          callback(value);
        });
      });
    }
    sign.registerHttpHook({
      match: /^observe$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        var name = param.name;
        var callback = param.callback;
        name && callback && observe(name, callback);
        return mockResponse.resolve(quickObservable);
      }
    });
    sign.registerHttpHook({
      match: /^observe\/(.+)$/,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data || {};
        var name = match[1];
        var callback = param;
        name && callback && observe(name, callback);
        return mockResponse.resolve(quickObservable);
      }
    });
  }]);
})(angular, window);