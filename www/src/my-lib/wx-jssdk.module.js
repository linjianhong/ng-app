!(function (angular, window, undefined) {
  // 只在微信浏览器中运行
  // @var useWX: 是否应该使用微信 JSSDK
  var isWx = (/micromessenger/i).test(navigator.userAgent);
  var useWX = location.origin.length > 12 && location.origin.indexOf('192.168') < 0 && isWx;
  var initWx;
  var theModule = angular.module('wx-jssdk', []);
  var theCounter = 8012252;

  /** 微信 JSSDK 初始化 */
  theModule.run(['$http', '$q', function ($http, $q) {

    initWx = function () {
      // 只在微信浏览器中运行
      if (!useWX) return $q.reject('not wx');
      if (initWx.promise) {
        return $q.when(initWx.promise);
      }

      var deferred = $q.defer();
      var url = location.href.split('#')[0];

      $http.post("系统参数").then(json_datas => json_datas.app_wx).then(wx_app => {
        $http.post("app/jsapi_sign", { name: wx_app.name, url: encodeURIComponent(url) })
          .then(function (json) {
            var config = json.datas.config;
            if (!config) {
              deferred.reject('config error!');
              return;
            }
            wx.config({
              debug: false,
              appId: config.appId,
              timestamp: config.timestamp,
              nonceStr: config.nonceStr,
              signature: config.signature,
              jsApiList: [
                // 所有要调用的 API 都要加到这个列表中
                'updateTimelineShareData',
                'updateAppMessageShareData',
                'onMenuShareQQ',
                'onMenuShareWeibo',
                'onMenuShareQZone',
                'startRecord',
                'stopRecord',
                'onVoiceRecordEnd',
                'playVoice',
                'pauseVoice',
                'stopVoice',
                'onVoicePlayEnd',
                'uploadVoice',
                'downloadVoice',
                'chooseImage',
                'previewImage',
                'uploadImage',
                'downloadImage',
                'translateVoice',
                'getNetworkType',
                'openLocation',
                'getLocation',

                'hideOptionMenu',
                'showOptionMenu',
                'hideMenuItems',
                'showMenuItems',
                'hideAllNonBaseMenuItem',
                'showAllNonBaseMenuItem',
                'closeWindow',
                'scanQRCode',
                'chooseWXPay'
              ]
            });

            wx.ready(function () {
              // alert("JSSDKOK");
              deferred.resolve(initWx.promise = wx);
            });

            wx.error(function (res) {
              initWx.promise = false;
              alert("JSSDK失败：\n\n" + JSON.stringify(res, 0, 2));
              deferred.reject("JSSDK失败");
            });
          })
          .catch(e => {
            deferred.reject({ text: 'getWjSign error!', e });
          });
      });

      return initWx.promise = deferred.promise;
    }

  }]);

  /** 提供 JSSDK 功能 */
  theModule.factory('WxJssdk', ['$http', '$q', function ($http, $q) {
    // ------------------------ 接口 ------------------------
    function reshare(wx, options) {
      console.log("设置分享, 正式参数：", options);
      if(options.alert)alert(options.alert);
      var deferTimeline = $q.defer();
      var deferAppMessage = $q.defer();
      var fn_Timeline = wx.updateTimelineShareData && "updateTimelineShareData" || "onMenuShareTimeline";
      //分享到朋友圈
      wx[fn_Timeline]({
        title: options.shareTitle, // 分享标题
        link: options.link, // 分享链接
        imgUrl: options.imgUrl, // 分享图标
        success: function (res) {
          console.log("分享到朋友圈, OK", res);
          deferTimeline.resolve(res);
        },
        cancel: function (res) {
          console.log("分享到朋友圈, EE", res);
          deferTimeline.reject(res);
        }
      });
      //分享给朋友 updateAppMessageShareData
      var fn_ShareData = wx.updateAppMessageShareData && "updateAppMessageShareData" || "onMenuShareAppMessage";
      wx[fn_ShareData]({
        title: options.title, // 分享标题
        desc: options.desc, // 分享描述
        link: options.link, // 分享链接
        imgUrl: options.imgUrl, // 分享图标
        success: function (res) {
          console.log("分享给朋友, OK", res);
          deferAppMessage.resolve(res);
        },
        cancel: function (res) {
          console.log("分享给朋友, EE", res);
          deferAppMessage.reject(res);
        }
      });
      return {
        onMenuShareTimeline: deferTimeline.promise,
        onMenuShareAppMessage: deferAppMessage.promise,
      }
    };

    return {
      initWx: function () { return initWx(); },
      setShare: function (options) {
        // console.log("设置分享", options, "默认参数：", defaultShare);
        var defaultShare = window.theSiteConfig && window.theSiteConfig.wx_share || {};
        options = angular.extend({}, defaultShare, options);
        options.shareTitle = options.shareTitle || options.title; // 发送到朋友圈标题

        // console.log("设置分享, 最终参数：", options);
        return initWx().then(wx => reshare(wx, options));
      },
    }
  }]);



  /** 提供 JSSDK 功能 */
  theModule.run(['$rootScope', '$http', '$q', 'sign', 'WxJssdk', function ($rootScope, $http, $q, sign, WxJssdk) {

    /**
     * 用 $http 模拟 WX-JSSDK
     */
    sign.registerHttpHook({
      match: /^WxJssdk\/(.*)$/i,
      hookRequest: function (config, mockResponse, match) {
        var param = config.data;
        return mockResponse.resolve(WxJssdk[match[1]](param));
      }
    });

    /**
     * 请求经纬度
     */
    sign.registerHttpHook({
      match: /^经纬度$/,
      hookRequest: function (config, mockResponse) {
        var deferred = $q.defer();
        initWx().then(wx => {
          wx.getLocation({
            type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            success: function (res) {
              var lat = res.latitude; // 纬度，浮点数，范围为90 ~ -90
              var lng = res.longitude; // 经度，浮点数，范围为180 ~ -180。
              var speed = res.speed; // 速度，以米/每秒计
              var accuracy = res.accuracy; // 位置精度
              console.log('扫描结果 = ', res);
              deferred.resolve({
                lat, lng, speed, accuracy,
              });
            },
            fail: function (res) {
              deferred.reject(res);
            }
          });
        }).catch(e => {
          console.log("请求经纬度错误, 模拟输出", e);
          if (!isWx) deferred.resolve({
            lat: 25.36, lng: 118.68, speed: 0, accuracy: 1,
          });
          else deferred.reject(e);
        })
        return mockResponse.resolve(deferred.promise)
      }
    });


    /**
     * 请求二维码扫描
     */
    sign.registerHttpHook({
      match: /^扫描二维码$/,
      hookRequest: function (config, mockResponse) {
        var deferred = $q.defer();
        initWx().then(wx => {
          wx.scanQRCode({
            needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
            scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
            success: function (res) {
              var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
              console.log('扫描结果 = ', result);
              deferred.resolve(result);
            },
            fail: function (res) {
              deferred.reject(res);
            }
          });
        }).catch(e => {
          console.log("请求二维码扫描错误, 模拟输出", e);
          if (!isWx) deferred.resolve("https://abc.def.com/id/" + ++theCounter);
          else deferred.reject(e);
        })
        return mockResponse.resolve(deferred.promise)
      }
    });
    /**
     * 请求二维码扫描（模拟，用于调试）
     */
    sign.registerHttpHook({
      match: /^模拟扫描二维码$/,
      hookRequest: function (config, mockResponse) {
        var deferred = $q.defer();
        window.setTimeout(() => {
          console.log('模拟扫描结果 = ', config.data || '模拟数据');
          deferred.resolve(config.data || '模拟数据');
        }, 120)
        return mockResponse.resolve(deferred.promise)
      }
    });

    /**
     * 请求二维码扫描
     */
    sign.registerHttpHook({
      match: /^微信预览图片$/,
      hookRequest: function (config, mockResponse) {
        var deferred = $q.defer();
        var param = config.data;
        initWx().then(wx => {
          deferred.resolve(1);
          wx.previewImage({
            current: param.imgs[param.active], // 当前显示图片的http链接
            urls: param.imgs // 需要预览的图片http链接列表
          });
        }).catch(e => {
          deferred.reject(e);
        });
        return mockResponse.resolve(deferred.promise);
      }
    });

  }]);

})(angular, window);
