// pages/web.js

var DefaultShare = {
  title: "一物一码系统",
  desc: '欢迎您',
  imageUrl: "https://jdyhy.oss-cn-beijing.aliyuncs.com/www/elink/assert/images/elink.jpg",
  path: ""
}


function hash(path, search) {
  search = search || {};
  var queryString = Object.keys(search).map(k => `${k}=${encodeURIComponent(search[k])}`).join("&");
  return path + (queryString && "?" || "") + queryString;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: "https://www.xlsgdjj.com/qrcode-xcx",
    query: "/my",
    bindmessage: function(e) {
      // console.log("来自H5的消息" + JSON.stringify(e));
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log("参数2：", options);
    if(!options.hash || ! options.code) return;
    // wx.showModal({ title: '页面参数2', content: JSON.stringify(options, 0, 2) });
    var self = this;
    var query = options.hash;

    if (options.code) {
      // 从 index 页面传来的登录 code
      var search = {
        code: options.code
      };
      if (query) search.hash = query
      query = hash("/xcx-login", search);
    }
    query = decodeURI(query);
    self.setData({
      query: query
    });
  },

  /**
   * 来自H5的消息
   */
  bindmessage: function(e) {
    this.H5 = this.H5 || {};
    // this.H5.message = e.detail.data;
    this.H5.message = e.detail.data.filter(item => item.type == "微信分享");
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(event) {
    console.log("点击右上角分享, event=", event);
    this.H5 = this.H5 || {};
    console.log("分享, H5的消息", this.H5.message);
    if (this.H5.message) {
      var item = this.H5.message[this.H5.message.length - 1];
      if (item) {
        item = item.data;
        var path = item.path || event.webViewUrl;
        return {
          title: item.title || DefaultShare.title,
          desc: item.desc || DefaultShare.desc,
          imageUrl: item.imageUrl || DefaultShare.imageUrl,
          path: "/pages/index/index?hash=" + encodeURIComponent(path)
        }

      }
    }

    return {
      title: DefaultShare.title,
      desc: DefaultShare.desc,
      imageUrl: DefaultShare.imageUrl,
      path: "/pages/index/index?hash=" + encodeURIComponent(event.webViewUrl.split("#")[1] || "")
    }

  }
})