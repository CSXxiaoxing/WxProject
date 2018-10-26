import {host, util, common, dict} from '../../utils/server';

Page({
  data: {
    tabId:-1,
    hideOrShow:true,
    pageIndex:1,
    tColor: host.tColor,
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  // 显示隐藏
  hideOrShowType: function () {
    var flag = true;
    if (this.data.hideOrShow) {
      flag = false;
    } else {
      flag = true;
    }
    this.setData({
      hideOrShow: flag
    })
  },
  jumpToNavigator: function (e) {
    var routUrl = e.currentTarget.dataset.linkurl;
    //  = null;
    //是否是普通商品
    var url = '';
    var matchStr = routUrl.match("/product/")
    if (matchStr) {
      var productId = routUrl.match(/\d+/)
      url = '/pages/goods_detail/goods_detail?productId=' + productId[0]

    } else if (routUrl.match('-0-0-0-0-0-0-0-0.html')) {
      routUrl = routUrl.replace('-0-0-0-0-0-0-0-0.html', '')
      routUrl = routUrl.replace('/0-', '')
      url = '/pages/goods_type/goods_type?typeId=' + routUrl
    } else if (routUrl.match("/news/details/")) {
      var newId = routUrl.match(/\d+/)
      url = '/pages/discover_detail/discover_detail?newId=' + newId[0]
    } else if (routUrl.match("/list/")) {
      routUrl = routUrl.replace('-1-0.html', '')
      routUrl = routUrl.replace('/list/', '')
      url = '/pages/goodList/goodList?url=' + routUrl;
    } else if (routUrl.match("/news/alllist.html")) {
      url = dict.pages.discover
    }
    util.navigateTo(url)
  }, 
    // 跳转到团购详情
    jumpToDetail: function (e) {
        var goodId = e.currentTarget.dataset.goodid;
        var productId = e.currentTarget.dataset.productid;
        wx.navigateTo({
            url: dict.pages.tuan_detail+'?goodId=' + goodId + '&productId=' + productId,
        })
    },
  // 请求服务器

  reqService:function(){
    var that = this;
    var url = host.host + '/tuan.html';
    util.showLoading('加载中...')
    util.httpsGetWithId(url,function(data){
      wx.hideLoading();
        var data = data.data;
        var config = data.config.image_resource;
        var tuangou_data = {
          banners:[],
          titles:[],
          hideTitles:[],
        }
        var goods=[]
        // 轮播图
        for (var i = 0; i < data.actGroupBanners.length;i++){
          var banner = {
            id: data.actGroupBanners[i].id,
            img: config + data.actGroupBanners[i].image,
            linkUrl: data.actGroupBanners[i].linkUrl,
          }
          tuangou_data.banners.push(banner)
        }
        // 拼装标题数据
        for(var i = 0; i < data.actGroupTypes.length;i++){
          var title = {
            name: data.actGroupTypes[i].name,//标题名称
            id: data.actGroupTypes[i].id,//标题id
            productId: data.actGroupTypes[i].productId//标题productid
          }
          if(i<3){
            tuangou_data.titles.push(title)
          }else{
            tuangou_data.hideTitles.push(title)
          }
        }
        // 商品列表数据
        for(var i = 0; i < data.actGroups.length;i++){
          var good = {
            id: data.actGroups[i].id,
            productId: data.actGroups[i].productId,
            img: config + data.actGroups[i].image,//商品图片
            name: data.actGroups[i].productName,//商品名称
            count: data.actGroups[i].saleNum,//购买人数
            price: common.toDecimal(data.actGroups[i].price),
            marketPrice: common.toDecimal(data.actGroups[i].marketPrice)
          }
          goods.push(good)
        }
        that.setData({
          config: config,
          tuangou_data: tuangou_data,
          goods: goods,
          pageIndex:1
        })
    },function(){},'请求团购数据')
  },
  changeTab:function(e){
    var tabId = e.currentTarget.dataset.tabid;
    this.setData({
      tabId: tabId
    })
    if(tabId == -1){
      this.reqService();
    }else{
      this.reqType();
    }
  },
  reqType:function(){
    var that = this;
    var url = host.host + '/tuan.html?type=' + this.data.tabId;
    util.showLoading('加载中');
    util.httpsGetWithId(url,function(data){
      wx.hideLoading();
      // 商品列表数据
      var data = data.data;
      var config = data.config.image_resource;
      var goods = [];
      for (var i = 0; i < data.actGroups.length; i++) {
        var good = {
          id: data.actGroups[i].id,
          productId: data.actGroups[i].productId,
          img: config + data.actGroups[i].image,//商品图片
          name: data.actGroups[i].productName,//商品名称
          count: data.actGroups[i].purchase,//购买人数
          price: common.toDecimal(data.actGroups[i].price),
          marketPrice: common.toDecimal(data.actGroups[i].marketPrice)
        }
        goods.push(good)
      }
      that.setData({
        goods: goods,
        
        pageIndex: 1
      })
    })
  },
  reqMore:function(){
    var that = this;
    var url = host.host + '/tuanJson.html?page=' + (this.data.pageIndex+1)+ '&type=' + this.data.tabId;
    if (this.data.tabId == -1){
      var url = host.host + '/tuanJson.html?page=' + (this.data.pageIndex+1)
    }
    util.showLoading('加载中...')
    util.httpsGetWithId(url,function(data){
      wx.hideLoading();
      var goods = [];
      for (var i = 0; i < data.data.length; i++) {
        var good = {
          id: data.data[i].id,
          productId: data.data[i].productId,
          img: that.data.config + data.data[i].image,//商品图片
          name: data.data[i].productName,//商品名称
          count: data.data[i].purchase,//购买人数
          price: common.toDecimal(data.data[i].price),
          marketPrice: common.toDecimal(data.data[i].marketPrice)
        }
        goods.push(good)
      }
      that.setData({
        goods: that.data.goods.concat(goods),
        pageIndex:that.data.pageIndex + 1
      })
    },function(){},'请求更多团购数据')
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.reqService();
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.reqMore();
  },

  onShareAppMessage: function () {
    // 用户点击右上角分享
    var that = this;
    return {
      title: host.companyName, // 分享标题
      path: '/pages/tuangou/tuangou' // 分享路径
    }
  },
})