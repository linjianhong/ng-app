/**
 * 动态表单组件
 * ver: 0.1.1
 * build: 2018-05-06
 * power by LJH.
 */
!(function (window, angular, undefined) {
  var DJ_FORM_DEFAULT = {
    pre: "dj-form-default-item-",
  };
  angular.module('dj-form').value("DJ_FORM_DEFAULT", DJ_FORM_DEFAULT);

  angular.module('dj-form').component('djForm', {
    bindings: {
      mode: '<', // edit(默认)/show
      configs: '<',
      initValues: '<',
      onFormValues: '&',
      onFormStatus: '&'
    },
    template: `
      <dj-form-item-host class="{{$ctrl.configs.css.host || 'flex-v'}} {{$ctrl.configs.css.host2}} mode-{{mode}}"
        mode="mode=='show' && 'show' || subItem.mode"
        configs="subItem"
        init-value="memValue[subItem.name]"
        on-status-change="onItemStatusChange(item, valid, dirty)"
        on-value-change="onItemValueChange(item, value, valid, dirty)"
        ng-repeat="subItem in configItems track by $index"
        ng-if="!stop"
      ></dj-form-item-host>`,
    controller: ['$scope', '$element', '$timeout', '$q', 'DjWaiteReady', function ($scope, $element, $timeout, $q, DjWaiteReady) {

      var theMode = false;
      var theChanges = {};

      $scope.stop = true;

      this.$onChanges = (changes) => {
        /** 首先，保存所有的参数传递 */
        ['configs', 'initValues', 'onFormValues', 'onFormStatus'].map(name => {
          if (changes[name]) {
            theChanges[name] = changes[name];
          }
        });

        /** mode 是否改变 ? */
        if (changes.mode) {
          var mode = changes.mode.currentValue;
          if (mode != 'show') mode = 'edit';
          if (mode != theMode) {
            theMode = $scope.mode = mode;
            /** mode 改变，初始化或重新初始化插座 */
            reInit(theMode, theChanges).then(() => {
              theChanges = {};
            })
            return;
          }
        }


        /** 如果已有 mode，且 配置改变，则重新初始化。保留原数据 */
        if (theMode && changes.configs) {
          reInit(theMode, theChanges).then(() => {
            theChanges = {};
          });
          return;
        }

        /** 如果有 mode 数据，就响应参数传递 */
        if (theMode && this.onChangesCtrl) {
          $timeout(() => {
            this.onChangesCtrl(theChanges);
            theChanges = {};
          });
        }
      }

      var reInit = (mode, changes) => {
        $scope.stop = true;
        var theValue = $scope.memValue || {};
        //console.log("有 mode 改变: ", theMode, " => ", mode, ", memValue=", theValue);
        if (!changes.configs) changes.configs = {};
        if (!changes.configs.currentValue) changes.configs.currentValue = $scope.configs;
        if (!changes.initValues) changes.initValues = {};
        if (!changes.initValues.currentValue) changes.initValues.currentValue = theValue;
        return $timeout(() => {
          $scope.stop = false;
          var fn = mode == "show" && ctrlHostShow || ctrlHostEdit;
          fn.call(this, $scope, $element, $timeout, $q, DjWaiteReady);
          this.onChangesCtrl(changes);
        });
      }
    }]
  });







  function ctrlHostEdit($scope, $element, $timeout, $q, DjWaiteReady) {
    var configReady = new DjWaiteReady();

    this.onChangesCtrl = (changes) => {
      if (changes.configs) {
        $scope.configs = changes.configs.currentValue;
        initConfigs(changes.configs.currentValue);
      }
      if (changes.initValues) {
        initValues(changes.initValues.currentValue);
      }
    }

    /**
     * 数据初始化
     */
    $scope.memValue = {};
    function initValues(vNew) {
      $scope.memValue = {};
      if (typeof vNew === 'object') {
        /** 在配置初始化后，执行 */
        configReady.ready(configs => {
          for (var k in vNew) {
            // 在配置中有的名称，才初始化数据
            if (configs.items.find(item => item.name == k)) {
              $scope.memValue[k] = vNew[k];
            }
          }
        })
      }
    }


    /**
     * 初始化配置
     */
    function initConfigs(vNew) {
      //console.log("Form 初始化配置 ", vNew);
      itemValid = {};
      itemDirty = {};
      if (!vNew || !angular.isArray(vNew.items)) return;
      var templates = vNew.templates || {};
      var pre = vNew.pre || DJ_FORM_DEFAULT.pre;
      $scope.configItems = vNew.items.map(item => {
        var css = angular.extend({}, vNew.css, item.css);
        return angular.extend({ pre, template: templates[item.type] }, item, { css });
      });
      /** 通知配置已初始化 */
      vNew && configReady.resolve(vNew);
    };

    /**
     * 子组件事件接收
     */
    $scope.valid = true;
    $scope.dirty = false;
    var itemValid = {}; // 各子组件是否有效
    var itemDirty = {}; // 各子组件是否改变
    $scope.onItemStatusChange = (item, valid, dirty) => {
      itemValid[item.name] = valid;
      itemDirty[item.name] = dirty;
      $scope.valid = !Object.keys(itemValid).find(name => !itemValid[name]);
      $scope.dirty = !!Object.keys(itemDirty).find(name => itemDirty[name]);
      $scope.$emit("dj-form-item-valid", { item, valid, dirty });
      $timeout(notifyParentStatus);
    }

    /**
     * 全局状态监听和通知
     */
    var oldStatus = {}
    var notifyParentStatus = () => {
      if ($scope.valid === oldStatus.valid && $scope.dirty === oldStatus.dirty) return;
      oldStatus.valid = $scope.valid;
      oldStatus.dirty = $scope.dirty;
      /** 通知父组件: 表单状态改变 */
      this.onFormStatus && this.onFormStatus({
        valid: $scope.valid,
        dirty: $scope.dirty
      });
    }

    /**
     * 值改变事件接收
     */
    $scope.onItemValueChange = (item, value, valid, dirty) => {
      //console.log('收到值改变 djForm', item, value, valid, dirty);
      $scope.onItemStatusChange(item, valid, dirty)
      $scope.memValue[item.name] = value;
      /** 通知父组件: 表单数据改变 */
      var data = {
        value: $scope.memValue,
        valid: $scope.valid,
        dirty: $scope.dirty,
        item: angular.extend({}, item, { valid })
      };
      $scope.$emit("dj-form-value-changed", data);
      this.onFormValues && this.onFormValues(data);
    };
  }

  function ctrlHostShow($scope) {
    this.onChangesCtrl = (changes) => {
      if (changes.configs) $scope.configs = changes.configs.currentValue;
      if (changes.initValues) $scope.memValue = changes.initValues.currentValue;
      if (changes.configs || changes.initValues) {
        initConfigs($scope.configs, $scope.memValue);
      }
    }
    /**
     * 初始化配置
     * 首次 configs 和 values 数据到来时，编译
     * 以后，configs 变化时，重新编译; values 变化时，仅传递数据
     */
    function initConfigs(configs, values) {
      if (!configs || !values) return;
      var templates = configs.templates || {};
      var pre = configs.pre || DJ_FORM_DEFAULT.pre;
      var css = configs.css || {};
      $scope.configItems = configs.items.map(item => {
        return angular.extend({ pre, css, template: templates[item.type + "-show"] }, item);
      });
    };



    /**
     * 不接收事件
     */
    $scope.onItemStatusChange = () => { }
    $scope.onItemValueChange = () => { }
  }


})(window, angular);