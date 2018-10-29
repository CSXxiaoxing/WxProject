
import {host, util, common, dict} from '../../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      var id = options.id;
      var pages = getCurrentPages();
      this.setData({
        id:id,
      })
      this.reqService();
  },
  reqService:function(){

    var url = host.host + '/partner/info/'+this.data.id+'.html';
    util.showLoading('加载中..');
    util.httpsGet(url,function(data){
         wx.hideLoading();
         this.setData({
            data: data.data,
            passage: common.parsePassage(data.data.partner.description)
          })
    }.bind(this),function(){},'请求伙伴详情')
  },
  //预览图片
  previewImage: function (e) {
    util.previewImage(e);
  },

  /**
* 用户点击右上角分享
*/
  onShareAppMessage: function () {
    var that = this;
    return {
      title: host.companyName,
      path: dict.pages.partnerDetail + '?id='+that.data.id
    }
  },
})