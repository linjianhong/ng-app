!(function (angular, window, undefined) {

  var theConfigModule = angular.module('dj-pop')

  /**
   * 地址信息
   */
  theConfigModule.run(['sign', '$http', function (sign, $http) {
    sign.registerHttpHook({
      match: /^地址信息$/,
      hookRequest: function (config, mockResponse, match) {
        var ajax = $http.post("经纬度").then(json => {
          console.log("经纬度", json)
          var pos = json.lat + "," + json.lng;
          return $http.post("geo/city", { pos }).then(json => {
            var arr = json.datas.result.address_component;
            var str = [arr.province, arr.city, arr.district];
            if (arr.street) str.push(arr.street);
            //var more = json.datas.result.formatted_addresses.recommend;
            var more = json.datas.result.address_reference.landmark_l2.title;
            str.push(more);
            return str;
            return sign.OK({ info: str });
          }).catch(e => {
            console.error("地理位置", e)
          })
        }).catch(e => {
          console.error("经纬度", e)
        });
        return mockResponse.resolve(ajax);
      }
    });
  }]);


})(angular, window);
