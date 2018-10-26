
import {host, util, common} from '../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    pageIndex:1
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
        productId:options.productId
      })
      this.reqService();
  },
  reqService:function(){
    var that = this;
    var url = host.host + '/showProduct/info/' + this.data.productId+'.html';
    util.showLoading('加载中')
    util.httpsGet(url,function(data){
        wx.hideLoading();
        that.setData({
          data:data.data,
          passage: common.parsePassage(data.data.info.content)
        })  
    },function(){},'请求产品详情')
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
      path: '/pages/productDetail/productDetail?productId=' + that.data.productId
    }
  },
})