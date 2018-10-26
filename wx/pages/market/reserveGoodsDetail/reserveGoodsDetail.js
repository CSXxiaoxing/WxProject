import {host, util, common, cl, dict, WxParse} from '../../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    tColorHelp: host.tColorHelp,
    // 商品详情
    currentTab: 0,
    // 是否显示选择配置
    hideOrShowConfig: true,
    // 商品选择数量
    sel_num: 1,
    // 商品id
    // productId:63,
    showDialog: false,
    DialogType: 0, //0选择配置  //1加入购物车

    //点击坐标判断上拉或下拉
    scroll_pos: 0,
    disTop: 0,
    touchX: 0,
    touchY: 0,
    endX: 0,
    endY: 0,

    flag: false
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var productId = options.productId;
    var actId = options.actId;
    var fromType = options.fromType;
    if (fromType) {
      this.setData({
        fromType: fromType
      })
    }
    var pages = getCurrentPages();
    this.setData({
      productId: productId,
      actId: actId,
      currentPageUrl: common.getPageRouteUrl(options),
    })



  },
  reqEvaluates: function () {
    var url = host.host + '/product/comment/' + this.data.productId + '.html?pageIndex=1';
    util.httpsGet(url, function (data) {
      if (data.data.allCommentList instanceof Array) {
        data.data.allCommentList.forEach((comment, i) => {
          data.data.allCommentList[i].createTime = comment.createTime.split(' ')[0];
          if (data.data.allCommentList[i].images instanceof String) {
            data.data.allCommentList[i].images = comment.images.split(',');
          }
        })
      } else {
        data.data.allCommentList = [];
      }

      this.setData({
        allCommentList: data.data.allCommentList,
        control: true
      })
    }.bind(this), function () {
      this.setData({
        control: true
      })
      }.bind(this), '请求评论数据', this.data.currentPageUrl)
  },
  //跳转到购物车
  jumpToScart: function () {
    var url = '/pages/shopCart/shopCart';
    util.navigateTo(url)
  },
  //进入店铺内
  jumpToShopDetail: function () {
    var url = '/pages/shop_detail/shop_detail?shopId=' + this.data.good_data.shopId;
    util.navigateTo(url)
  },
  //跳转到别的商品
  jumpToGoodsDetail: function (e) {
    var productId = e.currentTarget.dataset.productid;
    var url = '/pages/goods_detail/goods_detail?productId=' + productId
    wx.redirectTo({
      url: url,
    })
  },
  //跳转到商品更多咨询
  jumpToConsult: function () {
    util.navigateTo(dict.pages.add_consult + '?productId=' + this.data.productId)
  },
  transEvent: function (e) {
    this.setData({
      flag: !this.data.flag
    })
  },

  touchStartEvent: function (e) {
    console.log(e)
    this.setData({
      touchX: e.changedTouches[0].clientX,
      touchY: e.changedTouches[0].clientY,
    })
  },


  touchEndEvent: function (e) {
    console.log(e)
    this.setData({
      endX: e.changedTouches[0].clientX,
      endY: e.changedTouches[0].clientY,
    })
    if (this.data.endY - this.data.touchY > 0) {
      console.log('下拉')
      this.setData({
        flag: true
      })
    } else if (this.data.endY - this.data.touchY < 0) {
      console.log('上拉')
      this.setData({
        flag: false
      })
    }
  },














  //输入框
  onInputEvent: function (e) {
    if (e.detail.value > this.data.good_data.selGoodsInfo.productStock) {
      e.detail.value = this.data.good_data.selGoodsInfo.productStock
    }
    this.setData({
      sel_num: e.detail.value - 0 //字符串转数字
    })
  },
  //输入商品数量时，校验合法
  onblurEvent: function (e) {
    console.log(e)
    if (e.detail.value <= 0) {
      this.setData({
        sel_num: 1
      })
    }
  },
  //弹出选择框
  onClickdiaView: function (e) {

    this.setData({
      currentTab: this.data.currentTab == '2' ? '0' : this.data.currentTab, //商品咨询组件层级太高影响弹出窗体验
      DialogType: e.currentTarget.dataset.dltype == undefined ? '0' : e.currentTarget.dataset.dltype,
      showDialog: !this.data.showDialog
    });

  },

  preSingleImage: function (e) {
    var that = this;
    var imgUrl = e.currentTarget.dataset.imgurl;
    wx.previewImage({
      current: imgUrl,
      urls: [imgUrl],
    })
  },
  preDetailImage: function (e) {
    var that = this;
    var imgUrl = e.currentTarget.dataset.imgurl;
    wx.previewImage({
      current: imgUrl,
      urls: that.data.GoodDetailImg,
    })
  },
  /**
 * 展示商品详情图
 */
  preImage: function (e) {
    var that = this;
    var imgUrl = e.currentTarget.dataset.imgurl;
    wx.previewImage({
      current: imgUrl,
      urls: that.data.urls,
    })
  },
  // 立即购买
  addToIndent: function () {
    if (this.data.good_data.state != 6) {
      util.showMsg('当前商品已下架')
      return;
    }
    this.setData({
      showDialog:false
    })
    util.navigateTo(dict.pages.add_singleIndent + '?productId=' + this.data.productId + '&productGoodId=' + this.data.good_data.selGoodsInfo.id + '&number=' + this.data.sel_num)
  },
  //发起预约
  startReserve:function(e){
    util.navigateTo(dict.pages.submitReserve + '?selNum=' + this.data.sel_num + '&productId=' + this.data.productId + '&actId=' + this.data.actId + "&goodsId=" + this.data.good_data.selGoodsInfo.id);
  },
  // 选择样式
  sel_Style: function (e) {
    var that = this;
    var normid = e.currentTarget.dataset.normid;
    var pos = e.currentTarget.dataset.pos;
    // 选中的位置发生变化
    for (var x = 0; x < this.data.good_data.goods_styles[pos].attrList.length; x++) {
      if (this.data.good_data.goods_styles[pos].attrList[x].id == normid) {
        this.data.good_data.goods_styles[pos].attrList[x].sel = true;
      } else {
        this.data.good_data.goods_styles[pos].attrList[x].sel = false;
      }
    }

    // 循环拿选中的值
    var normAttrId = '';
    for (var x = 0; x < this.data.good_data.goods_styles.length; x++) {
      for (var y = 0; y < this.data.good_data.goods_styles[x].attrList.length; y++) {
        if (this.data.good_data.goods_styles[x].attrList[y].sel) {
          if (x != this.data.good_data.goods_styles.length - 1) {
            normAttrId = normAttrId + this.data.good_data.goods_styles[x].attrList[y].id + ',';

          } else {
            normAttrId = normAttrId + this.data.good_data.goods_styles[x].attrList[y].id;
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
    util.httpsPost(url, data, function (data) {
      wx.hideLoading()
      var data = data.data;

      if (data != null) {

        if (data.images == null || data.images == '') {
          data.images = that.data.good_data.banners[0].imgUrl;
        } else {
          data.images = that.data.config + data.images;
        }
        that.data.good_data.goodId = data.id

        // that.data.good_data.price = that.data.good_data.price; //写死商品价格为预订价格

        that.data.good_data.stock = data.productStock;

        that.data.good_data.selGoodsInfo = data;
      }
      that.setData({
        good_data: that.data.good_data
      })
    })

  },

  jumpToGoodsEval: function () {
    util.navigateTo('/pages/goods_evaluate/goods_evaluate?productId=' + this.data.productId)
  },

  // 加载商品参数
  loadGoodpara: function () {
    var that = this;
    var url = host.host + '/product/spec/' + this.data.productId + '.html?type=0';
    util.httpsGetWithId(url, function (data) {
        // 富文本
      WxParse.wxParse('article', 'html', data.data.product.desc, that, );
      var productAttr = data.data.productAttr;
      that.setData({
        goodpara: productAttr,
      })
    }, function () { }, '请求商品参数', this.data.currentPageUrl)
  },
  // 加载商品咨询
  loadGoodsAsk: function () {
    var that = this;
    var url = host.host + '/product/ask/' + this.data.productId + '.html?type=0';
    util.httpsGetWithId(url, function (data) {
      var config = data.data.config.image_resource;
      var askList = [];
      for (var i = 0; i < data.data.askList.length; i++) {
        var askItem = {
          askUserImg: data.data.askList[i].profilePhoto,
          name: data.data.askList[i].nickname,   //咨询用户姓名
          content: data.data.askList[i].askContent,//咨询内容
          time: data.data.askList[i].createTime, //咨询时间
          replyName: data.data.askList[i].sellerName,//回复名称
          replyTime: data.data.askList[i].replyTime,//回复时间
          replyContent: data.data.askList[i].replyContent,//回复内容
          sellerLogo: config + data.data.askList[i].sellerLogo,
          state: data.data.askList[i].state,
        }
        askList.push(askItem)
      }
      that.setData({
        askList: askList
      })
    }, function () { }, '加載商品咨詢', this.data.currentPageUrl)
  },
  //联系卖家
  makePhone: function (e) {
    if (this.data.good_data) {
      wx.makePhoneCall({
        phoneNumber: this.data.good_data.phone,
      })
    }

  },
  // 收藏商品
  Cgood: function () {
    if (this.data.good_data != undefined) {
      var that = this;
      var url = '';
      if (!this.data.good_data.isCgoods) {
        url = host.host + '/member/docollectproduct.html?productId=' + this.data.productId;
      } else {
        url = host.host + '/member/cancelcollectproduct.html?productId=' + this.data.productId;
      }
      util.showLoading('加载中')
      util.httpsGetWithId(url, function (data) {
        var title = '';
        wx.hideLoading();
        if (data.success) {
          if (that.data.good_data.isCgoods) {
            title = '已取消'
          } else {
            title = '添加成功'
          }
          that.data.good_data.isCgoods = !that.data.good_data.isCgoods//收藏值取反
          that.setData({
            good_data: that.data.good_data
          })
          util.showToast(title)
        }
      }, function () { }, "收藏商品", this.data.currentPageUrl)
    }
  },

  // 收藏店铺
  Cshop: function () {
    if (this.data.good_data != undefined) {
      var that = this;
      var url = '';
      if (!this.data.good_data.isCshops) {
        url = host.host + '/member/docollectshop.html?sellerId=' + this.data.good_data.shopId;
      } else {
        url = host.host + '/member/cancelcollectshop.html?sellerId=' + this.data.good_data.shopId;
      }
      util.showLoading('加载中')
      util.httpsGetWithId(url, function (data) {
        var title = '';
        wx.hideLoading();
        if (data.success) {
          if (that.data.good_data.isCshops) {
            title = '已取消'
          } else {
            title = '关注成功'
          }
          that.data.good_data.isCshops = !that.data.good_data.isCshops//收藏值取反
          that.setData({
            good_data: that.data.good_data
          })
          util.showToast(title);
        }
      }, function () { }, "收藏店鋪", this.data.currentPageUrl)
    }
  },
  // 商品数量增加
  add: function () {
    if (this.data.good_data == undefined) {
      return
    } else {
      if (this.data.sel_num < this.data.good_data.stock) {
        this.data.sel_num += 1
      }
      this.setData({
        sel_num: this.data.sel_num,
        total: common.toDecimal(common.accMul(this.data.sel_num, this.data.good_data.price))
      })
    }
  },
  sub: function () {
    //商品数量减少
    if (this.data.good_data == undefined) {
      return
    } else {
      if (this.data.sel_num > 1) {
        this.data.sel_num -= 1
      }
      this.setData({
        sel_num: this.data.sel_num,
  
      total: common.toDecimal(common.accMul(this.data.sel_num, this.data.good_data.price))
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
  reqService: function () {
    var that = this;
    // var url = host.host + '/product/' + this.data.productId + '.html'
    var url = host.host + '/appointment/' + this.data.actId+'.html';
    util.showLoading('加载中..');
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      if (!data.success) {
        util.showMsg(data.message, function () {
          wx.navigateBack({
            delta: 1,
          })
        })
        return;
      }
      // return;
      var data = data.data;
      var config = data.config.image_resource;
      var urls = [];//预览图


      
      var good_data = {
        goodId: data.ActAppointment.id,
        name: data.ActAppointment.name,//商品名字
        price: common.toDecimal(data.ActAppointment.price),//商品价格
        marketPrice: common.toDecimal(data.ActAppointment.marketPrice),//市场价格
        shopName: data.seller.sellerName,//店名
        shopIcon: config + data.seller.sellerLogo,
        isCgoods: data.statisticsVO.collectedProduct,//是否收藏商品   
        isCshops: data.statisticsVO.collectedShop,//是否收藏店铺
        shopId: data.seller.id,
        stock: data.goods.productStock,//库存
        banners: [],//轮播图
        goods_styles: [],//商品选择样式
        recommandList: (data.recommendProducts ? data.recommendProducts:[]),
        selGoodsInfo: data.goods,
        phone: data.seller.telephone,
        productNumber: data.seller.productNumber,
        state: data.product.state,
        
      }

      // 拼接轮播图数据
      // for (var i = 0; i < data.productLeadPicList.length; i++) {
        var banner_img = {
          imgUrl: config + data.ActAppointment.image
        }
        good_data.banners[0] = banner_img;
        urls.push(config + data.ActAppointment.image)
      // }
      if (good_data.selGoodsInfo.images == null || good_data.selGoodsInfo.images == '') {
        good_data.selGoodsInfo.images = good_data.banners[0].imgUrl;
      } else {
        good_data.selGoodsInfo.images = config + good_data.selGoodsInfo.images;
      }
      // 拼接选择商品样式
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
        good_data.goods_styles[x] = choiceItem;
      }
      var GoodDetailImg = [];
      //详情图
      // data.ActPintuan.descinfo = data.ActPintuan.descinfo.replace(/\",/g,'')
      if (data.ActAppointment.descinfo != null && data.ActAppointment.descinfo != '') {
        GoodDetailImg = data.ActAppointment.descinfo.split(',');
      }
      //设置页面数据
      that.setData({
        good_data: good_data,
        urls: urls,
        config: config,
        total: common.toDecimal(common.accMul(this.data.sel_num, data.ActAppointment.price)),
        GoodDetailImg: GoodDetailImg
      })
    }.bind(this), function () { }, '请求商品数据', this.data.currentPageUrl)
  },



  onShow: function () {
    util.checkSsId(function () {
      util.markHistory(this.data.productId)
      this.reqService();
      // this.loadGoodDetailImg();
      this.loadGoodpara();
      this.loadGoodsAsk();
      this.reqEvaluates();
    }.bind(this))
    
  },

  onShareAppMessage: function () {
    // 用户点击右上角分享
    var that = this;
    return {
      title: host.companyName, // 分享标题
      path: this.data.currentPageUrl // 分享路径
    }
  },
})