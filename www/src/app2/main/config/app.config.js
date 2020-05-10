!(function (window, angular, undefined) {

  /**
   * 网站通用配置
   */
  window.theSiteConfig = angular.extend({
    localStorage_KEY_UserToken: '__stock_user_token__',
    apiRoot: '../../api/src/app1/', //本地的API
    //apiRoot: "https://api.jdyhy.com/api-msa-vers/0.0.9/src/msa", //正式的API
    //apiRoot: 'https://api.esunion.com/msa/master/src/msa', //服务器正式版

    title: {
      hide: false,  // 默认是否隐藏上方标题栏
      text: "默认标题" // 默认标题
    },

  },
    window.theSiteConfig
  );

})(window, angular);
