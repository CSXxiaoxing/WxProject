
import {host, util, common, dict} from '../../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    pageIndex:1,
    newss:[]
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  onShow:function(){
    if (this.data.newss.length==0){
      this.reqService();
    }

  },
  // 跳转到对应的详情页
  jumpToNewsDetail:function(e){
    var newId = e.currentTarget.dataset.newid;
    wx.navigateTo({
      url: '/pages/discover_detail/discover_detail?newId='+newId,
    })
  },
  // 请求服务器
  reqService:function(){
    var url = host.host + '/news/alllist.html?pageIndex=1';
    util.showLoading('加载中..')
    var that = this;
    util.httpsGetWithId(url,function(data){
      console.log(data)
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource
      var newss = [];



      for (var i = 0; i < data.news.length;i++){
        var content = util.HtmlToText(data.news[i].content);
        var contents = content.split('\r\n')
        console.log(contents)
          var news = {
            id: data.news[i].id,
            name: data.news[i].title,
            img: config + data.news[i].image,
            news: common.removeSpace(contents[0]) + common.removeSpace(contents[1])
          }
          newss.push(news)
      }
      that.setData({
        newss: newss
      })
    })
  },
  //请求更多数据
  reqMore:function(){
    var url = host.host + '/news/alllist.html?pageIndex='+(this.data.pageIndex+1);
    util.showLoading('加载中..')
    var that = this;
    util.httpsGetWithId(url, function (data) {
      console.log(data)
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource


      if (data.news.length>0){
        var newss = [];
        for (var i = 0; i < data.news.length; i++) {
          var content = util.HtmlToText(data.news[i].content);
          var contents = content.split('\r\n')
          var news = {
            id: data.news[i].id,
            name: data.news[i].title,
            img: config + data.news[i].image,
            news: contents[0] + contents[1]
          }
          newss.push(news)
        }
        that.setData({
          pageIndex: that.data.pageIndex + 1,
          newss: that.data.newss.concat(newss)
        })
      }else{
        wx.showToast({
          title: '已无更多数据',

          image: '/images/dax.png',
          duration: 1500,


        })
      }

    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.reqMore()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    this.reqService();

  },
  onShareAppMessage: function () {

    // 用户点击右上角分享

    return {

      title: host.companyName, // 分享标题


      path: dict.pages.discover // 分享路径
    }
  }
})