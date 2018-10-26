
import {host, util, common} from '../../utils/server';

Page({
  data: {
    tColor: host.tColor,
    tColorHelp: host.tColorHelp,
    tabId: 0,
    Integeral_datas: {},
    // 分页
    bottom_desc: '上拉查看更多商品', 
    pageIndex: 1,
    control: false
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  changeTab: function (event) {
    // 刷新列表的网络请求写在这
    var tabId = event.currentTarget.dataset.tabid;
    this.setData({
      tabId: tabId,
    })

      this.reqService(tabId);

  
  },
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    this.setData({
      currentPageUrl: common.getPageRouteUrl(options),
    })
    util.checkSsId(function () {
      this.reqService(0);
    }.bind(this))

  },
  // 签到
  sign_up: function (event) {
    if (this.data.Integeral_datas.isSign == 1) {
      return;
    } else {
      this.reqSign();
    }
  },
  // 请求签到
  reqSign: function () {
    var url = host.host + '/member/sign.html';
    var data = {};
    util.showLoading('签到中..')
    util.httpsPostWithId(url, data, function (data) {
      wx.hideLoading()
      if (data.data) {
        this.data.Integeral_datas.isSign = 1
        this.reqService(this.data.tabId);
        util.showToast('签到成功')
      }
      this.setData({
        Integeral_datas: this.data.Integeral_datas,
      })

    }.bind(this), function () {
      wx.hideLoading()
    }, "请求签到")


  },// 跳转商品详情
  JumpToDetail: function (event) {
    util.navigateTo('/pages/intergral_detail/intergral_detail?goodId=' + event.currentTarget.dataset.goodid + '&productId=' + event.currentTarget.dataset.productid)
  },
  // 请求信息
  reqService: function (Reqtype) {
    var url = host.host + '/jifen.html?type=0&sort=' + Reqtype;
    util.showLoading('加载中');
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading()
      var data = data.data;
      var config = data.config.image_resource;
      // 拼装数据
      var Integeral_datas = new Object;
      var goods_items = [];
      data.actIntegrals.forEach((actInt) => {
        var item = {
          productId: actInt.productId,
          imgUrl: config + actInt.image,
          name: actInt.name,
          price: actInt.marketPrice,
          integral: actInt.price,
          id: actInt.id,
          saleNum: actInt.saleNum
        }
        goods_items.push(item)
      })

      if (data.member.integral != undefined) {
        Integeral_datas.integral = data.member.integral;
      }
      Integeral_datas.isSign = data.isSign;
      Integeral_datas.goods_items = goods_items;
      this.setData({
        bottom_desc: '上拉查看更多商品',
        pageIndex: 1,
        Integeral_datas: Integeral_datas,
        control: true
      })

    }.bind(this), function () {
      wx.hideLoading()
      this.setData({
        control: true
      })
    }.bind(this), "请求积分商城数据", this.data.currentPageUrl)

  },
  reqMore: function () {
    var url = host.host + '/jifenJson.html?type=0&page=' + (this.data.pageIndex + 1) + '&sort=' + this.data.tabId;

    util.showLoading('加载中...')
    util.httpsGet(url, function (data) {
      wx.hideLoading();
      if (data.data != null) {
        var goods_items = [];
        data.data.forEach((actInt) => {
          var item = {
            productId: actInt.productId,
            imgUrl: config + actInt.image,
            name: actInt.name,
            price: actInt.marketPrice,
            integral: actInt.price,
            id: actInt.id,
            saleNum: actInt.saleNum
          }
          goods_items.push(item)
        })

        this.data.Integeral_datas.goods_items = this.data.Integeral_datas.goods_items.concat(goods_items)
        this.setData({
          pageIndex: this.data.pageIndex + 1,
          Integeral_datas: this.data.Integeral_datas,
        })
      } else {
        util.showToast('已无更多商品')
      }
    }.bind(this))

  },
  onReachBottom: function () {

    this.reqMore();

  },
  onShareAppMessage: function () {
    // 用户点击右上角分享
    var that = this;
    return {
      title: host.companyName, // 分享标题
      path: this.data.currentPageUrl// 分享路径
    }
  },
})