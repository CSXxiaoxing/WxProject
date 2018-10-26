
import {host, util, common} from '../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // shopId: 17,
    tabId: 0,
    shopData: null,
    pageIndex:1,
    sortType:0,
    tColor: host.tColor,
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var shopId = options.shopId;
    if (shopId != null && shopId != undefined){
      this.setData({
        shopId: shopId,
        currentPageUrl: common.getPageRouteUrl(options),
      })
      util.checkSsId(function () {
        this.reqService();
        this.reqGoodsMsg();
      }.bind(this))

    }
  },
  onShareAppMessage: function () {
    // 用户点击右上角分享
    var that = this;
    return {
      title: host.companyName, // 分享标题
      path: this.data.currentPageUrl, // 分享路径
    }
  },
  //跳转到商品详情
  jumpToGoodDetails:function(e){
    var productId = e.currentTarget.dataset.productid;

    wx.redirectTo({
      url: '/pages/goods_detail/goods_detail?productId=' + productId+'&fromType=1',
    })
  },
  reqService: function () {
    var that = this;
    var url = host.host + '/store/' + this.data.shopId+'.html'
    util.showLoading('加载中..')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var data = data.data;
      console.log(data)
      var config = data.config.image_resource;
      var shopData = {
        collected: data.collected,
        shopName: data.seller.sellerName,//商店名
        img: config + data.seller.sellerImage,
        logo: config + data.seller.sellerLogo,
        collectionNumber: data.seller.collectionNumber,
        phone: data.cmpanyPhone,
        address: data.cmpanyAdd,
        floors: data.floors
      }
      that.setData({
        shopData: shopData
      })
    }, function () { }, '店铺数据', this.data.currentPageUrl)
  },
  changeTab: function (e) {
    var tabId = e.currentTarget.dataset.tabid;
    var sortType = -1;
    if (tabId==0){
      sortType = 0
    } else if (tabId==1){
      sortType = 5
    } else if (tabId == 2) {
      sortType = 4
    }
    this.setData({
      tabId: tabId,
      sortType: sortType
    })
    if (tabId!=3){
      this.reqGoodsMsg();
    }else{
      this.reqService();
    }


  },
  // 请求商品信息
  reqGoodsMsg:function(){
    var that = this;
    var url = host.host + '/product-' + this.data.shopId + '-' +this.data.sortType+'-0-1' +'.html'
    util.showLoading('加载中')
    util.httpsGetWithId(url,function(data){
      wx.hideLoading();
      var data = data.data;
      if (data.allProducts!=null){
        var goods_data = [];
        // 图片
        var config = data.config.image_resource;
        for (var i = 0; i < data.allProducts.length;i++){
         var good_item = {
            img: config + data.allProducts[i].masterImg,
            id: data.allProducts[i].id,
            name: data.allProducts[i].name1,
            price: data.allProducts[i].malMobilePrice,
          }
          goods_data[i] = good_item;
        }
        that.setData({
          pageIndex:1,
          goods_data: goods_data,
        })
      }
    }, function () { }, '请求商品数据', this.data.currentPageUrl)
  },
  // 关注或取消关注
  attention: function () {
    var that = this;
    var url;
    
    if (this.data.shopData != null) {
      if (this.data.shopData.collected=="false") {
        // 关注
        url = host.host + '/member/docollectshop.html?sellerId=' + this.data.shopId;
      } else {
        //取消关注
        url = host.host + '/member/cancelcollectshop.html?sellerId=' + this.data.shopId;
      }
      util.showLoading('加载中')
      util.httpsGetWithId(url,function(data){
        wx.hideLoading();
        var title = '';
        if (data.success) {
          
          if (that.data.shopData.collected=="true"){
            // 已取消
            that.data.shopData.collected = "false";
            title = '已取消'
          }else{
            // 关注成功
            that.data.shopData.collected = "true";
            title = '关注成功'
          }
    
          that.setData({
            shopData: that.data.shopData
          })
          util.showToast(title)
          
        }
      },function(){
        
      },'关注请求')
    }


},
// 下拉加载更多
  reqMore: function (){
    var that = this;
    var url = host.host + '/product-' + this.data.shopId + '-' + this.data.sortType+'-0-'+(this.data.pageIndex+1) + '.html';
    util.showLoading('加载中')
    util.httpsGetWithId(url,function(data){
      wx.hideLoading();
      var data = data.data;
      if (data.allProducts != null) {
        var goods_data = [];
        // 图片
        var config = data.config.image_resource;
        if (data.allProducts.length!=0){
          for (var i = 0; i < data.allProducts.length; i++) {
            var good_item = {
              img: config + data.allProducts[i].masterImg,
              id: data.allProducts[i].id,
              name: data.allProducts[i].name1,
              price: data.allProducts[i].malMobilePrice,
            }
            goods_data[i] = good_item;
          }

          that.setData({
            pageIndex: that.data.pageIndex + 1,
            goods_data: that.data.goods_data.concat(goods_data),
          })
        }else{
          util.showToast('没有更多商品了')
        }
       
      }
    })
  },
  // 拨号
  makePhone:function(){
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.shopData.phone,
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.tabId!=3){
      this.reqMore()
    }
 
  },

})