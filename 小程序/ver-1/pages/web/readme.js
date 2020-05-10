/**

1. 微信分享

1.1 H5部分
  wx.miniProgram.postMessage({
    data: {
      type: "微信分享",
      data: {
        title: '我的大程序，' + (item.hash),
        desc: '直接到达页面啦！',
        imageUrl: "https://jdyhy.oss-cn-beijing.aliyuncs.com/www/msa/assert/images/msa.logo.jpg",
        path: location.hash
      }
    }
  });


1.2 小程序部分

  var DefaultShare = {
    title: "分享标题",
    desc: '描述',
    imageUrl: "https://jdyhy.oss-cn-beijing.aliyuncs.com/www/msa/assert/images/msa.logo.jpg",
    path: ""
  }
  Page({
    // ...
    bindmessage: function (e) {
      this.H5 = this.H5 || {};
      this.H5.message = e.detail.data.filter(item => item.type == "微信分享");
    },
    onShareAppMessage: function (event) {
      this.H5 = this.H5 || {};
      if (this.H5.message) {
        var item = this.H5.message.reverse()[0];
        if (item) {
          item = item.data || {};
          return {
            title: item.title || DefaultShare.title,
            desc: item.desc || DefaultShare.desc,
            imageUrl: item.imageUrl || DefaultShare.imageUrl,
            path: "/pages/Web/web" + (item.path && "?hash=" + encodeURIComponent(item.path) || "")
          }
        }
      }

      return {
        title: DefaultShare.title,
        desc: DefaultShare.desc,
        imageUrl: DefaultShare.imageUrl,
        path: "/pages/Web/web?hash=" + encodeURIComponent(event.webViewUrl.split("#")[1]||"")
      }

    }
  })


2. 参数页面

2.1 约定
  小程序收到的参数为: /pages/Web/web?hash=HASH




 */