
import {host, util, common} from '../../utils/server';

Page({

  data: {
    tColor: host.tColor,
    tColorHelp: host.tColorHelp,
    slected: 0,
    pageIndex:1,
    bottom_desc:'上拉加载更多数据'
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    util.checkSsId(function () {

      this.reqCouponService()
    }.bind(this))

  },
  // 请求服务器
  reqCouponService: function () {
    var that = this;
    var url = host.host + '/member/coupon/list.html?s='+this.data.slected;

    util.httpsGetWithId(url,function(data){
      console.log(data)
      var coupon_datas = [];
      for (var i = 0; i < data.data.couponUsers.length; i++) {
        var couponData = new Object;
        var jsonData = data.data.couponUsers[i];
        couponData.name = jsonData.couponName;
        couponData.rule = jsonData.minAmount;
        couponData.price = jsonData.couponValue;
        couponData.time_start = common.getDate(jsonData.useStartTime);
        couponData.time_end = common.getDate(jsonData.useEndTime);
        couponData.shopId = jsonData.sellerId;
        couponData.shopName = jsonData.sellerName;
        couponData.timeout = jsonData.timeout;
        coupon_datas[i] = couponData;

        console.log(couponData)
      }
      that.setData({
        coupon_datas: coupon_datas,
      })
      if (coupon_datas.length == 0){
        util.showMsg('当前无已领取的优惠券')
      }
    })
  },
  toShop:function(e){
    var shopId = e.currentTarget.dataset.shopid;
    wx.redirectTo({
      url: '/pages/shop_detail/shop_detail?shopId='+shopId+'&tabId='+0,
    })
  },
  type_select: function (event) {
    var id = event.currentTarget.id;
    console.log(id)
    this.setData({
      slected: id
    })
    this.reqCouponService(id)
  },
  reqMore:function(){
    var that = this;
    var url = host.host + '/member/coupon/list.html?rownum=&page='+(this.data.pageIndex+1);
    util.httpsGetWithId(url,function(data){
      console.log(data)
      if (data.data.couponUsers.length!=0){
        var coupon_datas = [];
        for (var i = 0; i < data.data.couponUsers.length; i++) {
          var couponData = new Object;
          var jsonData = data.data.couponUsers[i];
          couponData.name = jsonData.couponName;
          couponData.rule = jsonData.minAmount;
          couponData.price = jsonData.couponValue;
          couponData.time_start = common.getDate(jsonData.useStartTime);
          couponData.time_end = common.getDate(jsonData.useEndTime);
          couponData.shopId = jsonData.sellerId;
          couponData.shopName = jsonData.sellerName;
          couponData.timeout = jsonData.timeout;
          coupon_datas[i] = couponData;
        }
        that.setData({
          coupon_datas: that.data.coupon_datas.concat(coupon_datas),
          pageIndex: that.data.pageIndex+1,
          has_more: false
        })
      }else{
        that.setData({
          bottom_desc:'已加载全部商品',
          has_more: false
        })
      }
    })
  },
  onReachBottom: function () {
    console.log('底部')
    var that = this;
    this.setData({
      has_more: true
    })
    this.reqMore()
  },

})