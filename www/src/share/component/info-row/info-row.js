/* info-row */
!(function (angular, window, undefined) {

  var theModule = angular.module("dj-view");

  theModule.component("infoRow", {
    template: `
      <div class="info-row flex flex-stretch {{$ctrl.d.css}}" ng-click="$ctrl.d.click($ctrl.d)">
        <div class="img flex flex-cc" ng-if="$ctrl.d.img">
          <img class="{{$ctrl.d.img.css||''}}" ng-src="{{$ctrl.d.img.url||$ctrl.d.img}}">
        </div>
        <div class="icon flex flex-cc" ng-if="$ctrl.d.fa&&!$ctrl.d.img">
          <i class="fa fa-{{$ctrl.d.fa.text||$ctrl.d.fa}}" ng-style="{color:$ctrl.d.fa.color||$ctrl.d.t1.color||$ctrl.d.color}"></i>
        </div>
        <div class="box flex-v flex-stretch flex-between flex-1 {{($ctrl.d.t3 || $ctrl.d.t4)&&' '||'single-line'}}">
          <div class="top flex-between {{($ctrl.d.t3 || $ctrl.d.t4)&&'flex-top'||'flex-v-center flex-1'}}">
            <div class="t1 {{$ctrl.d.t1.css}}" ng-style="{color:$ctrl.d.t1.color||$ctrl.d.color}">{{$ctrl.d.t1.text}}</div>
            <div class="t2 {{$ctrl.d.t2.css}}" ng-style="{color:$ctrl.d.t2.color||$ctrl.d.color}">{{$ctrl.d.t2.text}}</div>
          </div>
          <div class="bottom flex-between flex-bottom" ng-if="$ctrl.d.t3 || $ctrl.d.t">
            <div class="t3 {{$ctrl.d.t3.css}}" ng-style="{color:$ctrl.d.t3.color}">{{$ctrl.d.t3.text}}</div>
            <div class="t4 {{$ctrl.d.t4.css}}" ng-style="{color:$ctrl.d.t4.color}">{{$ctrl.d.t4.text}}</div>
          </div>
        </div>
        <div class="next flex-cc" ng-if="$ctrl.d.next">
          <i class="fa fa-angle-right"></i>
        </div>
      </div>`,
    bindings: {
      d: "<",
    },
    controller: ["$scope", function ($scope) {
    }]
  });


})(angular, window);
