
import {host, util} from '../../utils/server';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    com_data: []
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  onLoad(){
  },

  /**
   * 生命周期函数--监听页面加载
   */
  reqSellerList: function () {

    var that = this;

    var url = host.host + '/sellerShow';

    util.showLoading('加载中')

    util.httpsGet(url, function (data) {

      wx.hideLoading();

      var data = data.data;

      var config = data.config.image_resource

      if (data.sellerApplys.length != 0) {

        var child;

        for (var i = 0; i < data.sellerApplys.length; i++) {

          child = data.sellerApplys[i];

          var item = {

            id: child.id,

            name: child.company,

            add: child.companyAdd,

            img: config + child.sellerImage,

            logo: config + child.sellerLogo
          }
          that.data.com_data[i] = item;

        }
        that.setData({
          com_data: that.data.com_data
        })
      }
    }, function () {

    },'请求热门商店数据')

  },
  jumpToShop: function (e) {
    var shopId = e.currentTarget.dataset.shopid;
    
    var url = '/pages/shop_detail/shop_detail?shopId=' + shopId

    wx.navigateTo({
      url: url,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.reqSellerList()
  },

  onShareAppMessage: function () {
    // 用户点击右上角分享
    var that = this;
    return {
      title: host.companyName, // 分享标题
      path: '/pages/hot_shop/hot_shop'// 分享路径
    }
  },
})