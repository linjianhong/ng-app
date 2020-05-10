/* info-row */
!(function (angular, window, undefined) {

  var theModule = angular.module("dj-view");

  theModule.component("faButton", {
    template: `
      <div class="fa-button flex flex-v-center {{$ctrl.d.css}} {{$ctrl.disabled&&'disabled'}}" ng-click="$ctrl.disabled||$ctrl.d.click($ctrl.d)">
        <i class="fa fa-{{$ctrl.d.fa.text||$ctrl.d.fa}}" ng-style="{color:$ctrl.disabled&&'auto'||$ctrl.d.fa.color||$ctrl.d.color}" ng-if="$ctrl.d.fa"></i>
        <div ng-style="{color:$ctrl.disabled&&'auto'||$ctrl.d.color}">{{$ctrl.d.title||$ctrl.d.name}}</div>
      </div>`,
    bindings: {
      d: "<",
      disabled: "<",
    },
    controller: ["$scope", function ($scope) {
    }]
  });


})(angular, window);
