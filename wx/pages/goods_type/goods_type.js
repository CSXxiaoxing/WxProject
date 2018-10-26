
import {host, util, common} from '../../utils/server';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected: '0',
    Integeral_datas: {},
    // 分页
    pageIndex:1,
    bottom_desc:'上拉加载更多数据',
    control:false,
    tColor:host.tColor,
    reqControl:true
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  type_select: function (event) {
    // 刷新列表的网络请求写在这
    var id = event.currentTarget.id;
    this.setData({
      selected: id,
    })

    this.reqService(this.data.typeId,id);
  },
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    // 用户点击右上角分享
    var that = this;
    return {
      title: host.companyName, // 分享标题
      path: '/pages/goods_type/goods_type?id='+that.data.selected// 分享路径
    }
  },
  // 请求信息
  reqService: function (typeId, sort) {
    if (this.data.reqControl){

  
    var that = this;

    var url = host.host + '/0-' + typeId + '-0-' + sort + '-0-0-0-0-0-0.html';
    this.setData({
      reqControl:false
    })
    util.showLoading('加载中');
    util.httpsGetWithId(url,function(data){
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource;
      // 拼装数据
      var Integeral_datas = new Object;
      var goods_items = [];
      for (var i = 0; i < data.producListVOs.length; i++) {
        var item = new Object;
        var JsonData = data.producListVOs[i];
        item.id = JsonData.id;
        item.imgUrl = config + JsonData.masterImg;
        item.name = JsonData.name1;
        item.price = common.toDecimal(JsonData.malMobilePrice);
        goods_items[i] = item;
      }
      Integeral_datas.goods_items = goods_items;
      wx.setNavigationBarTitle({
        title: data.productCate.name,
      })
      that.setData({
        control:true,
        typeId: typeId,
        sort: sort,
        Integeral_datas: Integeral_datas,
        pageIndexL:1,
        bottom_desc: '上拉查看更多数据',
        reqControl: true,
      })
    },function(){
      that.setData({
        reqControl: true
      })
    },'请求分类数据')
    }
  },
  reqMore:function(){
    var url = host.host + '/0-' + this.data.typeId + '-'+(this.data.pageIndex+1)+'-' + this.data.sort + '-0-0-0-0-0-0.html';
    var that = this;
    util.showLoading('加载中');
    util.httpsGetWithId(url,function(data){
        wx.hideLoading();
        if (data.data.producListVOs.length!=0){
        var data = data.data;
        var config = data.config.image_resource;
        // 拼装数据
        var goods_items = [];
        for (var i = 0; i < data.producListVOs.length; i++) {
          var item = new Object;
          var JsonData = data.producListVOs[i];
          item.id = JsonData.id;
          item.imgUrl = config + JsonData.masterImg;
          item.name = JsonData.name1;
          item.price = common.toDecimal(JsonData.malMobilePrice);
          goods_items[i] = item;
        }
        that.data.Integeral_datas.goods_items = that.data.Integeral_datas.goods_items.concat(goods_items);
        that.setData({
          pageIndex: that.data.pageIndex+1,
          Integeral_datas: that.data.Integeral_datas,
          has_more:false
        })
        }else{
          that.setData({
            bottom_desc:'已加载全部商品信息',
            has_more: false
          })
        }
      },function(){},'请求更多数据')
  
  },
  // 跳转商品详情
  JumpToDetail:function (event) {
    var id = event.currentTarget.id;
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?productId=' + id,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var typeId = options.typeId;
    var keyword = options.keyword;
    if (keyword!=undefined){
      wx.setNavigationBarTitle({
        title: keyword,
      })
    }
    util.checkSsId(function () {
      this.reqService(typeId, '0')
    }.bind(this))
 
  },

  onReachBottom: function () {
    var that = this;
    this.setData({
      has_more: true
    })
    this.reqMore()
  },


})