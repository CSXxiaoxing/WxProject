
import {host, util} from '../../../utils/server';

Page({
  data: {
    tColor: host.tColor,
    pageIndex:1,
    bottom_desc:'上拉加载更多数据',
    collected_btn_limit:true,
    btn_limit: true,
    goods_count: 0,
    shops_count: 0,
    selected : '1',
    control1:false,
    control2:false,
    hidden1 : false,
    hidden2 : true,
  }, 
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  // 标题选择
  title_selected: function (event) {
    var id = event.currentTarget.id;
    var hidden1,hidden2,selected;
    selected = id;
    if (selected == '1') {
      hidden1 = false;
      hidden2 = true;
      this.reqService(1)
    } else {
      hidden2 = false;
      hidden1 = true;
      this.reqService(2)
    }
    this.setData({
      selected: selected,
      hidden1: hidden1,
      hidden2: hidden2
    })
  },
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    // util.login();
    // var id = options.id;
    // console.log(id + 'asdasdasdassssssssssssssss')
    // selected = id;
       util.checkSsId(function () {

         this.reqService(1)
    }.bind(this))

    var hidden1, hidden2;
    if (this.data.selected == '1') {
      hidden1 = false;
      hidden2 = true;
    } else {
      hidden2 = false;
      hidden1 = true;
    }
    this.setData({
      hidden1: hidden1,
      hidden2: hidden2
    })
  },
  // 跳转到商店详情
  jumpToGoodDetail:function(e){
    var productId = e.currentTarget.dataset.productid;
    wx.redirectTo({
      url: '/pages/goods_detail/goods_detail?productId=' + productId,
    })
  },
  // 跳转到店铺详情
  jumpToShopDetail:function(e){
    var shopId = e.currentTarget.dataset.shopid;
    wx.redirectTo({
      url: '/pages/shop_detail/shop_detail?shopId=' + shopId,
    })
  },
  // 请求类型
  reqService: function (reqType) {
    var that = this;
    var url = host.host + '/member/collect.html';
    if (reqType == '1') {
      util.showLoading('加载中..');
      util.httpsGetWithId(url, function (data) {
        wx.hideLoading();
        var goods_datas = [];
        var config = data.data.config.image_resource;
        for (var i = 0; i < data.data.productList.length; i++) {
          var goods_item = new Object;
          var jsonData = data.data.productList[i];
          goods_item.name = jsonData.productName;
          goods_item.imgUrl = config + jsonData.productLeadLittle;
          goods_item.price = jsonData.mallMobilePrice;
          goods_item.id = jsonData.productId;
          goods_datas[i] = goods_item;
        }
        that.setData({
          control1:true,
          goods_datas: goods_datas,
          goods_count: data.data.productList.length,
          pageIndex:1,
          bottom_desc:'上拉加载更多数据'
        })
      },function(){},'请求收藏商品列表');
    } else {
      util.showLoading('加载中..');
      util.httpsGetWithId(url, function (data) {
        wx.hideLoading();
        var shops_datas = [];
        var jsonData = data.data.sellerList;
        var config = data.data.config.image_resource;
        for (var i = 0; i < jsonData.length; i++) {
          var shop_item = new Object;
          shop_item.icon = config+jsonData[i].sellerLogo;
          shop_item.id = jsonData[i].seller.id;
          shop_item.name = jsonData[i].sellerName;
          shop_item.fens = jsonData[i].seller.collectionNumber;
          shops_datas[i] = shop_item;
        }
        that.setData({
          control2: true,
          pageIndex: 1,
          bottom_desc: '上拉加载更多数据',
          shops_datas: shops_datas,
          shops_count: jsonData.length,
        })
      },function(){},'请求收藏的店铺');
    }

  },
  // 取消关注
  cancel_goods: function (event) {
    var that = this;
    var id = event.currentTarget.id;
    if (that.data.collected_btn_limit) {
      if (id != undefined) {
        that.data.collected_btn_limit = false;
        util.showLoading('加载中..')
        var url = host.host + '/member/cancelcollectproduct.html?productId=' + id;
        util.httpsGetWithId(url,function(data){
          wx.hideLoading();
          var title = '';
          if (data.success) {
            title = '已取消'
            util.showToast(title);
            that.data.collected_btn_limit = true;
            that.reqService(1)
          }
        })
      }
    } else {
      util.showToast('当前网络不佳')
    }
  },


  // 取消关注商店
  cancel_shop: function (event) {
    var that = this;
    var shopId = event.currentTarget.dataset.shopid;
    if (that.data.btn_limit) {
      var that = this;
      var url = host.host + '/member/cancelcollectshop.html?sellerId=' + shopId;
      util.showLoading('加载中..');
      util.httpsGetWithId(url,function(data){
        wx.hideLoading();
        var title = '';
        if (data.success) {
          util.showToast('已取消')
          that.data.btn_limit = true;
        }
        that.reqService(0)
      })
    } else {
      util.showToast('当前网络不佳')
    }
  },

  // 跳转至商店界面
  jumpToShop: function (e) {
    var shopId = e.currentTarget.dataset.shopid;
    if (shopId != -1) {
      var url = '/pages/hot_shop/hot_shop?shopId=' + shopId
      wx.navigateTo({
        url: url,
      })
    }
  },
  // 跳转到对应商品的详情页
  jumpToDetail: function (event) {
    var id = event.currentTarget.id;
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?id=' + id,
    })
  },
  reqMore:function(){
    var that = this;
    var url;
    if (this.data.selected==1){
      url = host.host +'/member/morecollectproduct.html?pageIndex='+(this.data.pageIndex+1)
    }else{
      url = host.host + '/member/morecollectseller.html?pageIndex=' + (this.data.pageIndex+1)
    }
    util.showLoading('加载中..');
    util.httpsGetWithId(url,function(data){
      wx.hideLoading();
      if (that.data.selected == 1){
        if (data.data.productList.length!=0){
          var goods_datas = [];
          var config = data.data.config.image_resource;
          for (var i = 0; i < data.data.productList.length; i++) {
            var goods_item = new Object;
            var jsonData = data.data.productList[i];
            goods_item.name = jsonData.productName;
            goods_item.imgUrl = config + jsonData.productLeadLittle;
            goods_item.price = jsonData.mallMobilePrice;
            goods_item.id = jsonData.productId;
            goods_datas[i] = goods_item;
          }
          that.setData({
            pageIndex: that.data.pageIndex + 1,
            goods_datas: that.data.goods_datas.concat(goods_datas),
            has_more:false
          })
        }else{
          that.setData({
            bottom_desc:'已加载全部商品数据',
            has_more: false
          })
        }
        
      }else{

        if (data.data.sellerList.length != 0) {

        var shops_datas = [];

        var jsonData = data.data.sellerList;

        for (var i = 0; i < jsonData.length; i++) {

          var shop_item = new Object;

          shop_item.id = jsonData[i].seller.id;

          shop_item.name = jsonData[i].sellerName;

          shop_item.fens = jsonData[i].seller.collectionNumber;

          shops_datas[i] = shop_item;

        }
        that.setData({

          has_more:false,

          pageIndex: that.data.pageIndex + 1,

          shops_datas: that.data.shops_datas.concat(shops_datas),

        })
        } else {

          that.setData({

            has_more: false,

            bottom_desc: '已加载全部店铺数据',

          })
        }
      }
    })
  },
  onReachBottom: function () {
    var that = this;

    this.setData({

      has_more: true

    })
    this.reqMore()


  },

})