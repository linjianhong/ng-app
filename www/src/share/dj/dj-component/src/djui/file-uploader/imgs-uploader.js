(function () {

  angular.module('dj-ui')
    .filter('preview', function () { //可以注入依赖
      return function (url, width, height) {
        return url;
      }
    })
    .directive("multiFileUpload", function () {
      return {
        controller: ['$scope', '$element', function ($scope, $element) {
          $element.bind("change", function (e) {
            // console.log('有文件');
            $scope.change && $scope.change({ $files: e.target.files });
          });
        }],
        scope: {
          change: "&"
        }
      }
    })
    .component('imgsUploader', {
      template: `
        <div class="box flex flex-left flex-wrap">
          <div class="img preview" ng-click="clickImg($index)" ng-repeat='img in imgList track by $index'>
            <img ng-src="{{img|preview}}" />
          </div>
          <div class="img uploading" ng-repeat='file in File.uploadingFiles track by $index'>
            <img ng-src="{{file}}"/>
            <div class="per">{{file.error||(file.per+'%')}}</div>
          </div>
          <div class="img add" ng-if="mode!='show' && imgList.length < (maxCount||9)" ng-click="addClick()">
          </div>
          <input type="file" multiple accept="image/*,video/mp4" multi-file-upload change="File.onFile($files)">
        </div>`,
      bindings: {
        appData: "<",
        maxCount: "<",
        imgs: "<",
        mode: '@',
        preview: '@',
        onChange: "&",
        updateImg: "&" //选择图片更新用的回调函数
      },
      controller: ["$scope", "$http", "$element", "IMG", "DjPop", ctrl]
    });

  function ctrl($scope, $http, $element, IMG, DjPop) {
    var imgData = this.imgData = { uploadings: [] };
    $scope.imgList = [];
    this.countError = 0;
    this.$onInit = function () {
    }
    this.$onChanges = (changes) => {
      if (changes.imgs) {
        $scope.imgList = angular.merge([], changes.imgs.currentValue || []);
      }
      if (changes.maxCount) {
        $scope.maxCount = +changes.maxCount.currentValue || 9;
      }
      if (changes.mode) {
        $scope.mode = changes.mode.currentValue || "";
      }
    }

    this.deleteImg = (n, imgs) => {
      if (n < 0 || n >= $scope.imgList.length) return;
      return DjPop.confirm("您确认要删除当前图片?").then(a => {
        imgs.splice(n, 1);
        $scope.imgList = angular.merge([], imgs);
      }).then(() => {
        //console.log("删除图片", $scope.imgList);
        var imgs = angular.merge([], $scope.imgList);
        this.updateImg({ imgs, value: imgs });
        this.onChange({ imgs, value: imgs });
      })
    }
    $scope.clickImg = (n) => {
      if (this.preview === 'no') return;
      IMG.preview(n, $scope.imgList);
    }
    this.addImg = (url) => {
      if ($scope.imgList.length >= $scope.maxCount) return;
      $scope.imgList.push(url);
      //console.log("添加图片", $scope.imgList);
      var imgs = angular.merge([], $scope.imgList);
      this.updateImg({ imgs, value: imgs });
      this.onChange({ imgs, value: imgs });
    };


    $scope.addClick = function () {
      $http.post("http-hook", "请求图片已上传地址").then(hook => {
        return $http.post("请求图片已上传地址").then(json => {
          if (json.datas && json.datas.url) {
            self.addImg(json.datas.url);
          }
        });
      }).catch(e => {
        return $http.post("http-hook", "请求图片本地文件名").then(hook => {
          return $http.post("请求图片本地文件名").then(json => {
            var url = json.datas && json.datas.localUrl || json.datas.url;
            if (url) {
              File.uploadingFiles.push(url);
              File.upload();
            }
          });
        }).catch(e => {
          var fileBox = $element[0].querySelector("input[type='file']");
          fileBox.click();
        })
      });
    }

    /**
     * 上传模块
     **/
    var self = this;
    var File = $scope.File = {
      subTreeId: 0,
      uploadingFiles: [],

      /**
       * 文件选择事件
       **/
      onFile: function (files) {
        //console.log(files);
        if (!files) return;
        //console.info('添加文件', files);
        File.uploadingFiles = File.uploadingFiles || [];
        for (var i = 0; i < files.length; i++) {
          File.uploadingFiles.push(files[i]);
        }
        $scope.$apply();
        this.upload();
      },

      /**
       * 上传
       **/
      uploadFile: function (url, file, data) {
        IMG.upload(url, file, data).then(
          json => {
            //console.info('已上传, ', file, json);
            if (json.datas) {
              self.addImg(json.datas.url);
            }
            var n = File.uploadingFiles.indexOf(file);
            //console.info('删除已上传, ', n, file);
            File.uploadingFiles.splice(n, 1);
          },
          e => {
            //console.info('上传失败, ', file, e);
            file.error = e;
            setTimeout(() => {
              var n = File.uploadingFiles.indexOf(file);
              File.uploadingFiles.splice(n, 1);
              $scope.$apply();
            }, 5000)
          },
          process => {
            //console.info('上传进度, ', file, process);
            file.per = (process.loaded / file.size * 80).toFixed(2);
            if (file.per > 100) file.per = 100;
          }
        )
      },

      /**
       * 上传
       **/
      upload: function () {
        return $http.post("签名", "upload/img")
          .then(json => json.datas)
          .catch(e => {
            //console.log("准备上传图片，无签名！")
            return { url: "/api/file/upload/img", data: {} };
          })
          .then(signed => {
            angular.forEach(File.uploadingFiles, file => {
              File.uploadFile(signed.url, file, signed.data);
            });
          })
      }
    }
  }

})();
