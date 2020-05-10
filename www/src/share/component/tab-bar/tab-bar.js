/**
 * tab条组件
 * ver: 0.0.1
 * build: 2017-12-20
 * power by LJH.
 */
!(function (window, angular, undefined) {

  var theModule = angular.module('dj-view');

  theModule.directive('tabBar', function () {
    return {
      restrict: 'AE',
      scope: {
        list: '=',
        active: '@',
        itemCss: '@',
        activeCss: '@',
        tabClick: '&',
        change: '&',
      },
      transclude: true,
      controller: ['$scope', '$transclude', '$element', '$compile', function ($scope, $transclude, $element, $compile) {

        /** 构建模板 */
        !(function () {
          var theTemplate = `
            <div 
              class="{{item.css||itemCss||'flex-cc tab-bar-item'}} {{active==$index&&(activeCss||'active')}}"
              ng-if="!item.hidden"
              ng-repeat="item in list track by $index"
              ng-click="clickTab($index, item)"
            ><tab-bar-item></div>
          `;
          $transclude(function (clone) {
            var content_transcluded = [].filter.call(clone, (item) => {
              return (item.tagName || "").toLowerCase() == 'tab-bar-item'
            });
            // console.log("tab条组件,构建模板", content_transcluded);
            if (content_transcluded.length > 0) {
              initTemplate(content_transcluded[0].innerHTML);
            }
            else {
              initTemplate(`<span class="{{item.cssSpan||''}}">{{item.text||item}}</span>`);
            }
          });
          function initTemplate(itemHtml) {
            var html = theTemplate.replace("<tab-bar-item>", itemHtml);
            $element.html(html);
            $compile($element.contents())($scope);
          }
        })();

        $scope.$watch("active", function (vNew) {
          $scope.active = vNew || 0;
        });
        $scope.clickTab = function (index, item) {
          $scope.tabClick && $scope.tabClick({ $n: index, item: item });
          if (item.disabled) {
            return;
          }
          $scope.active = index;
          $scope.change && $scope.change({ $n: index, item: item });
        };
      }]
    };
  });

})(window, angular);