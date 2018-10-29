//logs.js
import {host, util} from '../../utils/server';
var utils = util

Page({
  data: {
    pageI: 1,
    moreFlag: true,
    products: [],
    noMsg: false,
    loading: false,
    tColor: host.tColor,
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    var that = this;
    var url = host.host + '/newproduct.html';
    utils.showLoading('加载中...')
    utils.httpsGet(url, function (res) {
      wx.hideLoading()
      var imgUrl = res.data.config.image_resource;
      that.setData({
        imgUrl: imgUrl
      })
      var product = res.data.newProducts;
      if (product.length < 6) {
        that.setData({
          noMsg: true
        })
      }
      that.newProducts(product)
    },function(){},'请求最新产品列表')
  },
  newProducts: function (array) {//商品列表重组,可分页
    // console.log(array)
    var imgUrl = this.data.imgUrl;
    var products = [];
    var product = [];
    for (var i = 0; i < array.length; i++) {
      var obj = {
        name: array[i].name1,
        id: array[i].id,
        price: array[i].malMobilePrice,
        imgUrl: imgUrl + array[i].masterImg,
      };
      product.push(obj);
    }
    products = this.data.products.concat(product);

    this.setData({
      products: products,
      moreFlag: true,
    })

  },
  onReachBottom: function () {
    utils.showLoading('加载中...')
    var that = this;
    var flag = this.data.moreFlag;
    if (flag) {
      var thisPage = this.data.pageI;
      thisPage++;
      this.setData({
        noMsg: false,
        loading: true,
        moreFlag: false,
        pageI: thisPage
      })
      var url = host.host + '/newproduct.html?page=' + thisPage;
      utils.httpsGet(url, function (res) {
        wx.hideLoading();
        if (res.data.newProducts.length > 0) {
          var product = res.data.newProducts;
          that.newProducts(product)
        } else {
          that.setData({
            loading: false,
            noMsg: true,
            moreFlag: true,
            pageI: thisPage - 1
          })
        }
      },function(){},'请求更多产品分页')
    }
  },
  goodsDetails: function (e) {
    var detailsType = e.currentTarget.dataset.type;//商品详情类型
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?productId=' + id
    })
  }

})