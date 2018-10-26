
import {host, util, common, dict} from '../../utils/server';

Page({
  data: {
    tColor: host.tColor,
    slected: 1,
    coupon_datas: [],
    pageIndex: 1,
    bottom_desc: '上拉加载更多数据'
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
    onLoad: function (options) {
        // 生命周期函数--监听页面加载
        util.checkSsId(function () {
            this.reqCouponService(1)
        }.bind(this))
    },

  // 请求服务器

  reqCouponService: function (sortType) {

    // 请求优惠券接口
    var url = host.host + '/coupon.html';

    if (sortType != 1) {
      url = host.host + '/coupon.html?s=' + sortType
    }

 
    util.showLoading('加载中...')
    util.httpsGet(url, function (data) {
      wx.hideLoading();
      if (data.data.couponList.length > 0) {
        var coupon_datas = [];
        data.data.couponList.forEach((item)=>{
          var couponData = {
            couponId: item.id,
            name: item.couponName,
            rule: item.minAmount,
            price: item.couponValue,
            time_start: common.getDate(item.sendStartTime),
            time_end: common.getDate(item.sendEndTime),
            shopId: item.sellerId,
            shopName: item.sellerName,
          }
          coupon_datas.push(couponData)
        })

        this.setData({
          coupon_datas: coupon_datas,
          pageIndex: 1
        })
      } else {

        util.showMsg('当前暂无优惠券')

      }

    }.bind(this), function () { }, '请求优惠券列表')
  },
  // 领取优惠券
  getCoupon: function (event) {
    var couponId = event.currentTarget.dataset.couponid;
    var url = host.host + '/member/coupon/reveivecoupon.html'
    var data = {
      couponId: couponId,
    }
    util.httpsPostWithId(url, data, function (data) {
      if (data.success) {
        util.showToast("领取成功")
      } else {
        util.showMsg(data.message)
      }
    }.bind(this), function () {

    }, '领取优惠券请求')

  },
  // 优惠券分页
  reqMore(sortType) {

    var url = host.host + '/couponjson.html?page=' + (this.data.pageIndex + 1) + '&s=' + sortType;
    util.showLoading('加载中')
    util.httpsGet(url, function (data) {
      wx.hideLoading();
      if (data.data.length != 0) {
        var coupon_datas = [];
        data.data.forEach((item) => {
          var couponData = {
            couponId: item.id,
            name: item.couponName,
            rule: item.minAmount,
            price: item.couponValue,
            time_start: common.getDate(item.sendStartTime),
            time_end: common.getDate(item.sendEndTime),
            shopId: item.sellerId,
            shopName: item.sellerName,
          }
          coupon_datas.push(couponData)
        })
        
        this.setData({
          pageIndex: this.data.pageIndex + 1,
          coupon_datas: this.data.coupon_datas.concat(coupon_datas),
          has_more: false
        })
      }
    }.bind(this), function () { }, '请求更多优惠券')
  },

  type_select: function (event) {
    var id = event.currentTarget.id;

    this.setData({
      slected: id
    })
    this.reqCouponService(id)
  },

  onReachBottom: function () {


    this.setData({
      has_more: true
    })
    var sortType;
    if (this.data.slected == 1) {
      sortType = 0;
    } else if (this.data.slected == 2) {
      sortType = 2
    } else {
      sortType = 1
    }
    this.reqMore(sortType);
  },
  onShareAppMessage: function () {
    // 用户点击右上角分享
    return {
      title: host.companyName, // 分享标题
      path: dict.pages.coupon // 分享路径
    }
  }
})