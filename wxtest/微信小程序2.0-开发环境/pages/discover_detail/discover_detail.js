import {host,util,common} from "../../utils/server";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  reqService:function(){
    var that = this;
    var url = host.host + '/news/details/' + this.data.newId+'.html'
    util.showLoading('加载中..');
    util.httpsGetWithId(url,function(data){
        var data = data.data;
        wx.hideLoading();
        if (data.news!=undefined){
          var content = util.HtmlToText(data.news.content);
          var contents = content.split('\r\n')
          for (var i = 0; i < contents.length; i++) {
            contents[i] = common.removeSpace(contents[i])
          }
          var title = data.news.title;
          var time = data.news.createTime
          that.setData({
            title: title,
            time: time,
            contents: contents
          })
        }
       
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      newId:options.newId,
    })
    this.reqService();
  },


})