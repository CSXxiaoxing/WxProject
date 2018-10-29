
import {host, util, common, dict} from '../../../utils/server';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor:host.tColor
  },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var caseId = options.caseId;
      this.setData({
        caseId:caseId
      })
      this.reqService();
  },
  reqService:function(){
    var url = host.host + '/case/info/'+this.data.caseId+'.html';
    util.showLoading('加载中');
    util.httpsGet(url,function(data){
        wx.hideLoading();
        this.setData({
          data:data.data,
          passage: common.parsePassage(data.data.info.content)
        })
    }.bind(this),function(){},'请求案例详情数据')
  },
  //预览图片
  previewImage: function (e) {
    util.previewImage(e);
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.reqService();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    return {
      title: host.companyName,
      path:  dict.pages.caseDetail + '?caseId=' + that.data.caseId
    }
  },
})