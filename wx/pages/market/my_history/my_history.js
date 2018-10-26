
import {host, util, common} from '../../../utils/server';

Page({
  data: {
    history_data: [],
    // 分页
    pageIndex: 1,
    bottom_desc: '上拉加载更多数据',
    tColor: host.tColor,
    control: false
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    this.reqService();
  },

  // 请求网络
  reqService: function () {
    var that = this;
    var url = host.host + '/member/viewed.html';
    util.showLoading('加载中...')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource;
      var history_data = [];

      for (var i = 0; i < data.lookLogList.length; i++) {
        var JsonData = data.lookLogList[i];
        if (JsonData.product != null) {
          var item = {
            id: JsonData.productId,
            img: config + JsonData.product.masterImg,
            name: JsonData.product.name1,
            price: common.toDecimal(JsonData.product.malMobilePrice),
            marketPrice: common.toDecimal(JsonData.product.marketPrice),

          }
          history_data.push(item);
        }

      }
      that.setData({
        history_data: history_data,
        control: true
      })
    }, function () { }, '请求历史足迹列表')


  },
  // 跳转商品详情
  jumpToGoodDetail: function (event) {
    var productId = event.currentTarget.dataset.productid;
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?productId=' + productId,
    })
  },
  reqMore: function () {
    var url = host.host + '/member/moreviewed.html?pageIndex=' + (this.data.pageIndex + 1)
    var that = this;
    util.showLoading('加载中..')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      if (data.data.lookLogList.length != 0) {
        var data = data.data;
        var config = data.config.image_resource;
        var history_data = [];
        for (var i = 0; i < data.lookLogList.length; i++) {
          var JsonData = data.lookLogList[i];
          var item = {
            id: JsonData.product.id,
            img: config + JsonData.product.masterImg,
            name: JsonData.product.name1,
            price: common.toDecimal(JsonData.product.malMobilePrice),
              marketPrice: common.toDecimal(JsonData.product.marketPrice),
          }
          history_data[i] = item;
        }
        that.setData({
          history_data: that.data.history_data.concat(history_data),
          pageIndex: that.data.pageIndex + 1,
        })
      } else {
        util.showToast('已加载全部数据')
      }
    })
  },
  onReachBottom: function () {
    this.reqMore()
  },

})