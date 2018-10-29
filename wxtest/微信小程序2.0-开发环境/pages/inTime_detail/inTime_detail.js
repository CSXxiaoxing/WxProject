
import {host, util, common, cl, dict, WxParse} from '../../utils/server';
var time_inter;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    // 商品详情
    currentTab: 0,
    // 是否显示选择配置
    hideOrShowConfig: true,
    // 商品选择数量
    sel_num: 1,
    // 货物id
    goodId: 11,
    // 商品id

    timepos1:0,
    timepos2: 0,
    timepos3: 0,
    timepos4: 0,
    timepos5: 0,
    timepos6: 0,

  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  // 切换选项卡
  change_tab: function (e) {
    var currentTab = e.currentTarget.dataset.tabnum;
    this.setData({
      currentTab: currentTab
    })
  },
  // 预览图片
  preImage: function (e) {
    var that = this;
    var imgUrl = e.currentTarget.dataset.imgurl;
    wx.previewImage({
      current: imgUrl,
      urls: that.data.banners,
    })
  },
  // 跳转到支付
  jumpToPay: function () {
    if (this.data.sel_num > this.data.tuan_data.stock) {
      util.showMsg('当前库存不足')
     
      return;
    }
    var url = dict.pages.add_qj_indent+'?productId=' + this.data.productId + '&styleId=' + this.data.styleId + '&sellerId=' + this.data.tuan_data.seller_id + '&count=' + this.data.sel_num + '&goodId=' + this.data.goodId;

    wx.redirectTo({
      url: url,
    })
  },

  sub: function () {
    //商品数量减少
    if (this.data.tuan_data == undefined) {
      return
    } else {
      if (this.data.sel_num > 1) {
        this.data.sel_num -= 1
      }
      this.setData({
        sel_num: this.data.sel_num
      })
    }
  },
  // 显示或隐藏配置
  hideOrShowConfig: function () {
    if (this.data.hideOrShowConfig) {
      this.data.hideOrShowConfig = false;
    } else {
      this.data.hideOrShowConfig = true;
    }
    this.setData({
      hideOrShowConfig: this.data.hideOrShowConfig
    })
  },
  // 选择样式
  sel_Style: function (e) {
    var that = this;
    var normid = e.currentTarget.dataset.normid;
    var pos = e.currentTarget.dataset.pos;
    // 选中的位置发生变化
    // for (var x = 0; x < this.data.good_styles.length; x++) {
    for (var y = 0; y < this.data.good_styles[pos].attrList.length; y++) {
      if (this.data.good_styles[pos].attrList[y].id == normid) {
        this.data.good_styles[pos].attrList[y].sel = true;
      } else {
        this.data.good_styles[pos].attrList[y].sel = false;
      }
    }
    // }
    // 循环拿选中的值
    var normAttrId = '';
    for (var x = 0; x < this.data.good_styles.length; x++) {
      for (var y = 0; y < this.data.good_styles[x].attrList.length; y++) {
        if (this.data.good_styles[x].attrList[y].sel) {
          if (x != this.data.good_styles.length - 1) {
            normAttrId = normAttrId + this.data.good_styles[x].attrList[y].id + ',';

          } else {
            normAttrId = normAttrId + this.data.good_styles[x].attrList[y].id;
          }
        }
      }
    }

    var url = host.host + '/getGoodsInfo.html';
    var data = {
      productId: that.data.productId,
      normAttrId: normAttrId
    }

    util.showLoading('加载中...')
    util.httpsPostWithId(url, data, function (data) {
      wx.hideLoading()
      var data = data.data;
      if (data != null) {

        that.data.styleId = data.id

      }
      that.setData({
        tuan_data: that.data.tuan_data,
        good_styles: that.data.good_styles,
        styleId: that.data.styleId,
      })
    })

  },
  reqService: function () {
    var that = this;
    var url = host.host + '/product/' + this.data.productId + '.html?type=1';
    util.showLoading('加载中..');
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var data = data.data;
      // 富文本
      WxParse.wxParse('article', 'html', data.product.desc, that, );
      var config = data.config.image_resource;

      // 首页数据
      var banners = [] //轮播图
      for (var i = 0; i < data.productLeadPicList.length;i++){
        banners[i] = config + data.productLeadPicList[i];
      }
      // 选择商品样式
      var good_styles = [];
      for (var x = 0; x < data.norms.length; x++) {
        var choiceItem = {
          name: data.norms[x].name,
          attrList: []
        }
        for (var y = 0; y < data.norms[x].attrList.length; y++) {
          var sels = {
            name: data.norms[x].attrList[y].name,
            id: data.norms[x].attrList[y].id,
          }
          if (y == 0) {
            sels.sel = true;
          } else {
            sels.sel = false;
          }
          choiceItem.attrList[y] = sels;
        }
        good_styles[x] = choiceItem;
      }
      // 商品信息
      var tuan_data = {
        actPrice: data.actFlashSaleProduct.price,//参团价格
        marketPrice: data.actFlashSaleProduct.marketPrice,//市场价格

        goodId: data.goods.id,
        name: data.product.name1,//商品名称
        stock: data.actFlashSaleProduct.stock,//库存

        seller_id: data.seller.id,//店铺id


        price: data.goods.mallMobilePrice,//原价价格
       
      }

      that.countTime(data.countTime)
      that.setData({
      
        styleId: data.goods.id,//货品id
        banners: banners,
        tuan_data: tuan_data,
        good_styles: good_styles
      })
    }, function () { }, '请求限时抢购商品详情', this.data.currentPageUrl)

  },
  countTime: function (countTime){

    var that = this;
    if (time_inter != null || time_inter != undefined) {


      clearInterval(time_inter)

    }

    time_inter = setInterval(function () {
      var day = 0,
        hour = 0,
        minute = 0,
        second = 0;//时间默认值 
      if (countTime > 0) {
        day = Math.floor(countTime / (60 * 60 * 24));
        hour = Math.floor(countTime / (60 * 60)) - (day * 24);
        minute = Math.floor(countTime / 60) - (day * 24 * 60) - (hour * 60);
        second = Math.floor(countTime) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
      }
      if (day <= 9) day = '0' + day;
      if (hour <= 9) hour = '0' + hour;
      if (minute <= 9) minute = '0' + minute;
      if (second <= 9) second = '0' + second;

      // -------------切割数组

      var timepos1 = (hour + '').split("")[0];
      var timepos2 = (hour + '').split("")[1];
      var timepos3 = (minute + '').split("")[0];
      var timepos4 = (minute + '').split("")[1];;
      var timepos5 = (second + '').split("")[0];
      var timepos6 = (second + '').split("")[1];

      that.setData({
        timepos1: timepos1,
        timepos2: timepos2,
        timepos3: timepos3,
        timepos4: timepos4,
        timepos5: timepos5,
        timepos6: timepos6,
      })

      countTime--;

      if (countTime < 0) {

        clearInterval(time_inter)

        that.reqService();

      }

    }, 1000);


  },
  jumpToGoodDetail: function () {
    wx.redirectTo({
      url: '/pages/goods_detail/goods_detail?productId=' + this.data.productId,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      productId: options.productId,
      goodId: options.goodId,
      currentPageUrl: common.getPageRouteUrl(options),
    })

    // this.countTime(10000)

  },
  onShow:function(){
    util.checkSsId(function () {
      util.markHistory(this.data.productId)
      this.reqService();
    }.bind(this))

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