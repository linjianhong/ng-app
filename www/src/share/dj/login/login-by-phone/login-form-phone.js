/* 手机验证码登录组件 */
!(function (angular, window, undefined) {

  var theModule = angular.module('dj-view');
  theModule.component('loginFormPhone', {
    template: `
      <div class="flex-v flex-cc flex-1 login-form-phone">
        <div class="phone-login-box flex-v flex-stretch">
          <div class="em-12 strong flex-cc">手机登录</div>
          <dj-form class="flex-v flex-stretch"
            configs="phoneLoginForm"
            init-values="formValue"
            on-form-values="formValueChange(value, item, valid, dirty)"
            on-form-status="formStatusChange(item, valid, dirty)"
          ></dj-form>
          <div class="btns flex">
            <div class="flex-1 flex-cc btn {{valid&&'primary'||'disabled'}}" ng-click="smsLogin()">登录</div>
            <div class="flex-1 flex-cc btn derault" ng-click="cancle()">取消</div>
          </div>
          <div class="text-warning flex-cc" ng-show="prompt">{{prompt}}</div>
        </div>
      </div>`,
    controller: ['$scope', '$http', ctrl]
  })

  function ctrl($scope, $http) {

    console.log("手机验证码登录组件");

    var phoneCodeTimerId;
    var phoneCodeTimerSeconds;

    this.$onDestroy = ()=>{
      clearInterval(phoneCodeTimerId);
    }

    // 表单定义
    $scope.phoneLoginForm = {
      items: [
        {
          name: 'phone', title: "手机号码", type: "input", param: {
            valid: { required: true, pattern: /^1[34589]\d{9}$/, errorTip: '格式不对' },
            invalid: { required: '请输入手机号' }
          }
        },
        {
          name: 'code', title: "验证码", component: "input-phone-verify-code", param: {
            valid: { required: true, errorTip: '请输入验证码' },
            invalid: { required: '请输入验证码' }
          }
        },
      ]
    }

    // 数据监听
    $scope.formValueChange = function (value, item, valid, dirty) {
      $scope.prompt = "";
      //console.log("收到", value, item, valid, dirty)
      if (item.name == "phone") {
        $scope.$broadcast('phone-number-valid', { valid: item.valid });
      }
      $scope.valid = valid;
      $scope.value = value;
    }

    // 获取验证码
    $scope.$on('phone-verify-code-click', () => {
      console.log("发送验证码");
      $http.post("sms/getcode", { phone: $scope.value.phone }).then(json => {
        $scope.$broadcast("phone-number-valid", { text: '验证码已发送', valid: false });
        phoneCodeTimerSeconds = 60;
        phoneCodeTimerId = setInterval(() => {
          $scope.$apply(() => {
            console.log('倒计时', phoneCodeTimerSeconds);
            $scope.$broadcast("phone-number-valid", { text: `${phoneCodeTimerSeconds}秒后再次获取`, valid: false });
            phoneCodeTimerSeconds--;
            if (phoneCodeTimerSeconds <= 0) {
              clearInterval(phoneCodeTimerId);
              $scope.$broadcast("phone-number-valid", { text: '重新获取验证码', valid: true });
            }
          })
        }, 1005);
      }).catch(e => {
        $scope.prompt = e.errmsg || e;
      })
    });

    // 登录
    $scope.smsLogin = () => {
      if (!$scope.valid) return;
      var phone = $scope.value.phone;
      var code = $scope.value.code;
      $http.post("sms/login", { phone, code }).then(json => {
        $scope.$emit('dj-pop-box-close', { btnName: 'OK', token: angular.extend({ phone }, json.datas) });
        //$scope.$emit('sms-login-success', json);
      }).catch(e => {
        $scope.prompt = e.errmsg || e;
        $scope.valid = false;
        console.log("登录失败: ", e);
      })
    };

    // 取消
    $scope.cancle = () => {
      console.log("取消...");
      $scope.$emit('dj-pop-box-close', 0);
    };

    $http.post("用户", "刷新个人信息").then(json => {
      $scope.me = json.datas.me || {};
    })
  };

  theModule.component('inputPhoneVerifyCode', {
    bindings: {
      configs: '<',
      theValid: '<',
      djRequire: '<',
      initValue: '<',
      onChange: '&'
    },
    template: `
      <djui-input class="flex-3 flex-cc" 
        param="$ctrl.configs.param"
        placeholder="{{$ctrl.configs.param.placeholder}}"
        init-value="$ctrl.initValue"
        on-change="$ctrl.onChange({value: value})"
      ></djui-input>
      <div class="flex-2 flex-cc {{phoneNumberValid&&' '||'disabled'}}" ng-click="getCode()">{{sendBtnText||'获取验证码'}}</div>
      `,
    controller: ['$scope', '$element', function ($scope, $element) {
      this.$onChanges = (changes) => {
        if (changes.initValue) {
          $scope.value = changes.initValue.currentValue;
        }
      }
      setTimeout(() => {
        $element.addClass("flex flex-stretch");
      })
      $scope.change = (value) => {
        this.onChange({ value });
      };
      $scope.getCode = (value) => {
        $scope.$emit('phone-verify-code-click', {});
      };
      $scope.$on('phone-number-valid', function (event, data) {
        //console.log('收到 valid', valid);
        $scope.phoneNumberValid = !!data.valid;
        if (data.text) {
          $scope.sendBtnText = data.text;
        }
      });

    }]
  });

})(angular, window);
