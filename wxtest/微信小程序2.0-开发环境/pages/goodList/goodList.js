
import {host, util} from '../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    tabId: 0,
    sortType: 0,
    pageIndex: 1,
    control: false

  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var cateId = options.url;//二级分类id
    this.setData({
      cateId: cateId
    })
    // util.checkSsId(function () {
      this.reqService();
    // }.bind(this))
  },
  onShareAppMessage: function () {
    // 用户点击右上角分享
    var that = this;
    return {
      title: host.companyName, // 分享标题
      path: '/pages/goodList/goodList?url=' + that.data.cateId // 分享路径
    }
  },
  // 跳转到商品详情页
  jumpToGoodDetail: function (e) {
    var productId = e.currentTarget.dataset.productid;

    util.navigateTo('/pages/goods_detail/goods_detail?productId=' + productId)
  },
  // 切换排序
  changeTab: function (e) {
    var tabId = e.currentTarget.dataset.tabid;
    var sortType;

    if (tabId == 0) {
      sortType = 0
    } else if (tabId == 1) {
      sortType = 5;
    } else if (tabId == 2) {
      sortType = 2;
    } else {
      sortType = 3;
    }
    this.setData({
      tabId: tabId,
      sortType: sortType
    })
    this.reqService();
  },
  // 请求分类数据
  reqService: function () {

    var url = host.host + '/list/' + this.data.cateId + '-1-' + this.data.sortType + '.html';
    util.showLoading('加载中..')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource;
      var goods = [];
      if (data.productList) {
        data.productList.forEach((item) => {
          var good = {
            id: item.id,
            name: item.name1,
            price: item.malMobilePrice,
            img: config + item.masterImg,
          }
          goods.push(good)
        })
      }
      wx.setNavigationBarTitle({
        title: data.productCate.name,
      })
      this.setData({
        goods: goods,
        pageIndex: 1,
        control: true
      })
    }.bind(this), function () { }, '请求商品列表')
  },
  // 请求更多数据
  reqMore: function () {

    var url = host.host + '/list/' + this.data.cateId + '-' + (this.data.pageIndex + 1) + '-' + this.data.sortType + '.html';
    util.showLoading('加载中')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource;
      var goods = [];
      if (data.productList.length != 0) {
        data.productList.forEach((item) => {
          var good = {
            id: item.id,
            name: item.name1,
            price: item.malMobilePrice,
            img: config + item.masterImg,
          }
          goods.push(good)
        })
        this.setData({
          goods: this.data.goods.concat(goods),
          pageIndex: this.data.pageIndex + 1,
        })
      } else {
        util.showToast('已加载全部数据');
      }

    }.bind(this), function () { }, '请求更多数据')
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.reqMore();
  },


})