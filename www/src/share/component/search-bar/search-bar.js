/* 搜索框 */
!(function (angular, window, undefined) {

  var theModule = angular.module('dj-view');

  theModule.component('searchBar', {
    template: `
      <div class="search-bar flex flex-stretch" >
        <div class="box flex flex-1 flex-cc">
          <i class="fa fa-search"></i>
          <input class="flex-1" ng-model="$ctrl.ngModel" ng-change="$ctrl.ngChange({$value:$ctrl.ngModel})" placeholder="搜索">
          <i class="fa fa-times-circle {{!$ctrl.ngModel&&'disabled'}}" ng-click="clear()"></i>
        </div>
        <div class="flex-cc btn {{!$ctrl.ngModel&&'disabled'}}" ng-click="$ctrl.ngModel&&$ctrl.search({$value:$ctrl.ngModel})">搜索</div>
      </div>`,
    bindings: {
      ngModel: '=',
      ngChange: '&',
      clear: '&',
      search: '&',
    },
    controller: ['$scope', function ($scope) {
      $scope.clear = () => {
        if (!this.ngModel) return;
        this.ngModel = "";
        this.ngChange({ $value: "" });
        this.clear();
      }
    }]
  });


})(angular, window);
