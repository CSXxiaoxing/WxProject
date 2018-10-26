
import {host, util, onfire, dict} from '../../../utils/server';

var refreshId = -1
var refreshEvent = onfire.on('refreshEvalList', function (data) {
  util.log('刷新评论列表', data)
  // refreshControl = true;
  refreshId = data;
})
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    tabId: 0,
    wait_eval: [],//待评价
    is_eval: [],  //已评价
    w_index: 1, //待评价页数
    i_index: 1, //
    reqLock: true,
    control1: false,
    control2: false
  },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },

  changeTab: function (e) {
    var tabId = e.currentTarget.dataset.tabid;
    this.setData({
      tabId: tabId
    })
    if (this.data.tabId == 0) {

      this.reqService(0);

    } else {

      this.reqService(1);

    }
  },

  reqService: function (tabId) {
    var url = host.host + '/member/getordersproduct.html?evaluate=' + tabId + '&pageIndex=1'
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      this.setData({
        config: data.data.config.image_resource
      })
      if (tabId == 0) {
        this.setData({
          wait_eval: data.data.ordersProdute,
          control1: (data.data.ordersProdute.length == 0),
          w_index: 1
        })
      } else {
        this.setData({
          is_eval: data.data.ordersProdute,
          control2: (data.data.ordersProdute.length == 0),
          i_index: 1
        })
      }
    }.bind(this), function () {
      wx.hideLoading();
      if (tabId == 0) {
        this.setData({
          control1: true
        })
      } else {
        this.setData({
          control2: true
        })
      }
    }.bind(this), (tabId == 0 ? '请求未评价的已购买商品列表' : '请求已评价的已购买商品列表'))
  },

  reqMore: function () {
    if (this.data.reqLock) {
      this.setData({
        reqLock: false
      })
      wx.showLoading({
        title: '加载中..',
        mask: true,
      })
      var url = host.host + '/member/getordersproduct.html?evaluate=' + this.data.tabId + '&pageIndex=' + (this.data.tabId == 0 ? (this.data.w_index + 1) : (this.data.i_index + 1))


      util.httpsGetWithId(url, function (data) {
        wx.hideLoading();
        this.setData({
          reqLock: true
        })
        if (data.data.ordersProdute.length > 0) {
          if (this.data.tabId == 0) {

            this.setData({
              wait_eval: this.data.wait_eval.concat(data.data.ordersProdute),
              w_index: this.data.w_index + 1
            })

          } else {

            this.setData({
              is_eval: this.data.is_eval.concat(data.data.ordersProdute),
              i_index: this.data.i_index + 1
            })
          }
        }
      }.bind(this), function () {
        wx.hideLoading();
        this.setData({
          reqLock: true
        })
      }, '请求商品评价列表')
    }


  },
  jumpToEvalDetail: function (e) {
    let goodsImg = e.currentTarget.dataset.goodsimg
    let goodsName = e.currentTarget.dataset.goodsname
    let orderSn = e.currentTarget.dataset.ordersn
    let productId = e.currentTarget.dataset.productid
    let productGoodsId = e.currentTarget.dataset.productgoodsid
    let ordersProductId = e.currentTarget.dataset.ordersproductid
    let url = dict.pages.eval_detail + "?goodsImg=" + goodsImg + "&goodsName=" + goodsName + "&orderSn=" + orderSn + "&productId=" + productId + "&productGoodsId=" + productGoodsId + "&ordersProductId=" + ordersProductId
    util.navigateTo(url)
  },
  jumpToAddEval: function (e) {
    let goodsImg = e.currentTarget.dataset.goodsimg
    let goodsName = e.currentTarget.dataset.goodsname
    let orderSn = e.currentTarget.dataset.ordersn
    let productId = e.currentTarget.dataset.productid
    let productGoodsId = e.currentTarget.dataset.productgoodsid
    let ordersProductId = e.currentTarget.dataset.ordersproductid
    var url = dict.pages.add_evaluate+"?goodsImg=" + goodsImg + "&goodsName=" + goodsName + "&orderSn=" + orderSn + "&productId=" + productId + "&productGoodsId=" + productGoodsId + "&ordersProductId=" + ordersProductId
    util.navigateTo(url)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.reqService(0);
  },
  onShow: function () {
    if (refreshId != -1) {
      this.data.wait_eval.forEach((orderProduct, i) => {
        if (orderProduct.ordersSn == refreshId) {
          this.reqService(1)
          refreshId = -1
        }
      })
      this.setData({
        wait_eval: this.data.wait_eval,
        is_eval: this.data.is_eval,
        control1: (this.data.wait_eval.length == 0),
        control2: (this.data.is_eval.length == 0),
        tabId: 1
      })
    }
  },
  onUnload: function () {
    onfire.un('refreshEvalList');
    refreshId = -1;//还原变量，避免缓存
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.reqMore();
  },

})