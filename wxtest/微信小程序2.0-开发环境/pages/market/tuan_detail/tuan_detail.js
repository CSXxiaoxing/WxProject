import {host, util, common, cl, dict, WxParse} from '../../../utils/server';


Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 商品详情
    currentTab: 0,
    // 是否显示选择配置
    hideOrShowConfig: true,
    // 商品选择数量
    sel_num: 1,
    // 货物id
    goodId: 11,
    // 商品id
    tColor: host.tColor,

  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  // 跳转到支付
  jumpToPay: function () {
    if (this.data.sel_num > this.data.tuan_data.stock){
      util.showMsg('当前库存不足')
      return;
    }
    var url = dict.pages.add_tuan_indent + '?productId=' + this.data.productId + '&styleId=' + this.data.styleId + '&sellerId=' + this.data.tuan_data.seller_id + '&count=' + this.data.sel_num + '&goodId=' + this.data.goodId;
    wx.redirectTo({
      url: url,
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
  // 切换选项卡
  change_tab: function (e) {
    var currentTab = e.currentTarget.dataset.tabnum;
    this.setData({
      currentTab: currentTab
    })
  },
  // 商品数量增加
  add: function () {

    if (this.data.tuan_data == undefined) {
      return
    } else {
      if (this.data.sel_num < this.data.tuan_data.purchase) {
        this.data.sel_num += 1
      }
      this.setData({
        sel_num: this.data.sel_num
      })
    }
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
        styleId: that.data.styleId,
        good_styles: that.data.good_styles,
      })
    }, function () { }, '选中样式后请求数据', this.data.currentPageUrl)

  },
  reqService: function () {
    var that = this;
    var url = host.host + '/tuan/' + this.data.goodId + '.html';
    util.showLoading('加载中..')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var data = data.data;
        // 富文本
        WxParse.wxParse('article', 'html', data.product.desc, that, );

      var config = data.config.image_resource;

      // 首页数据
      var banners = [] //轮播图
      banners[0] = config + data.actGroup.image;

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
        firstprice: common.toDecimal(data.actGroup.firstPrice),//参团价格
        marketPrice: common.toDecimal(data.actGroup.marketPrice),//市场价格
        saleNum: data.actGroup.saleNum,//已售数量
        end_day: Math.round(data.countTime / (60 * 60 * 24)),//结束时间

        name: data.actGroup.productName,//商品名称
        stock: data.actGroup.stock,//库存
        purchase: data.actGroup.purchase,//限购人数
        seller_id: data.seller.id,//店铺id
        act_end: data.actGroup.endTime,//结束时间
        pay_end: data.actGroup.firstEndTime,//开始时间
        balance_end: data.actGroup.lastEndTime,//上次
        price: common.toDecimal(data.actGroup.price),//参团价格
        // 团购人数
        actGroupPrices: common.toDecimal(data.actGroupPrices),
        // goods_desc:
      }
      that.setData({
        styleId: data.goods.id,//货品id
        banners: banners,
        tuan_data: tuan_data,
        good_styles: good_styles
      })
    }, function () { }, '請求團購數據', this.data.currentPageUrl)

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
  },
  onShow:function(){
    util.checkSsId(function () {
      this.reqService();
      util.markHistory(this.data.productId)
    }.bind(this))

  },
  onShareAppMessage: function () {
    // 用户点击右上角分享
    var that = this;
    return {
      title: host.companyName, // 分享标题
      path: that.data.currentPageUrl // 分享路径
    }
  },
})