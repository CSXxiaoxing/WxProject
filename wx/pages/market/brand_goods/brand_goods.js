
import {host, util, dict} from '../../../utils/server';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    tabId:0,
    sortType:0,
    pageIndex:1,
  },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var cateId = options.cateId;
    var brandId = options.brandId;
    this.setData({
      cateId: cateId,
      brandId: brandId
    })
    this.reqService();
  },
  // 跳转到商品详情
  jumpToDetail:function(e){
    var productId = e.currentTarget.dataset.productid;
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?productId=' + productId,
    })
  },
  changeTab:function(e){
    var tabId = e.currentTarget.dataset.tabid;
    var sortType;
    if (tabId==0){
      sortType = 0 //排序默认
    } else if (tabId == 1){
      sortType = 5 //排序时间
    } else if (tabId == 2) {
      sortType = 1 //排序销量
    } else if (tabId == 3) {
      sortType = 4 //排序价格
    }
    this.setData({
      tabId: tabId,
      sortType:sortType
    })
    this.reqService();
  },
  reqService:function(){
    var that = this;
    var url = host.host + '/0-' + this.data.cateId + '-1-' + this.data.sortType + '-0-0-' + this.data.brandId+'-0-0-0.html';
    util.showLoading('加载中...')
    util.httpsGetWithId(url,function(data){
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource;
      if (data.producListVOs.length!=0){
        var goods = [];
        for (var i = 0; i < data.producListVOs.length; i++) {
          var good = {
            name: data.producListVOs[i].name1,
            id: data.producListVOs[i].id,
            img: config + data.producListVOs[i].masterImg,
            price: data.producListVOs[i].malMobilePrice
          }
          goods.push(good)
        }
        that.setData({
          goods: goods,
          pageIndex:1
        })
      }
    },function(){},'请求品牌街数据')
  },
  //上拉加载更多
  reqMore:function(){
    var that = this;
    var url = host.host + '/0-395-'+(this.data.pageIndex+1)+'-' + this.data.sortType + '-0-0-59-0-0-0.html';
    util.showLoading('加载中..');
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource;
      if (data.producListVOs.length != 0) {
        var goods = [];
        for (var i = 0; i < data.producListVOs.length; i++) {
          var good = {
            name: data.producListVOs[i].name1,
            id: data.producListVOs[i].id,
            img: config + data.producListVOs[i].masterImg,
            price: data.producListVOs[i].malMobilePrice
          }
          goods.push(good)
        }
        that.setData({
          goods: that.data.goods.concat(goods),
          pageIndex: that.data.pageIndex+1
        })
      }else{
        util.showToast('已加载全部数据');
      }
    },function(){},'请求更多品牌街数据')
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.reqMore();
  },
})