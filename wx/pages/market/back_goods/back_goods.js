
import {host, util, dict} from '../../../utils/server';
Page({

  data: {
    tColor: host.tColor,
    control:false
  },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
  onLoad: function (options) {
    var orderId = options.orderId;
    util.log('订单ord/* a */erId',orderId);
    this.setData({
      orderId: orderId
    })

  },
  onShow: function () {
    var that = this;
    var id = this.data.orderId;
    var url = host.host + '/member/backapply.html?id=' + id;
    util.showLoading('加载中..');
    util.httpsGetWithId(url, that.infoShow)
  },

  infoShow: function (e) {
    wx.hideLoading();
    var orders = e.data.order.orderProductList;
    var imgUrl = e.data.config.image_resource; //商品图片域名
    var sellerId = e.data.order.sellerId;
    var seller = e.data.order.sellerId;
    var orderid = e.data.order.id;
 
    if (e.data.order.backOrExchangeNum == 0) {
      wx.navigateBack({
        delta: 1,
      })
      return;
    }
    this.setData({
      num: e.data.order.backOrExchangeNum,//--------------退换货 写死 最大数
      orders: orders,
      sellerId: sellerId,
      seller: seller,
      imgUrl: imgUrl,
      orderid: orderid,
      control:true
    });
    util.log('可退换商品数量' + this.data.num);
  },
  toComment: function (e) {//退换货
    var that = this;
    var flag = this.data.cFlag;
    var index = e.currentTarget.dataset.index;
    var info = e.currentTarget.dataset.info;
    var orderProductId = info.id;
    var productId = info.productId;
    var orderid = this.data.orderid;
    var ssid = this.data.ssid;
    var url = host.host + '/member/canbackorexchange.html?orderProductId=' + orderProductId + '&orderId=' + orderid ;
    util.showLoading('加载中')
    util.httpsGetWithId(url, function (res) {
      wx.hideLoading();
      that.setData({
        canNum: res.data,
      })
      if (flag != index) {
        that.setData({
          returns: '',
          huan: '',
          checkS: 0,
          num: res.data,
          contentFlag: true,
          cFlag: index,
          orderProductId: orderProductId,
          productId: productId
        })
      }
    })

  },
  checkS: function (e) {
    var that = this;
    var thisBtn = e.currentTarget.dataset.id;
    if (thisBtn == 1) {
      that.setData({
        thisBtn: 1,
        returns: 'on',
        huan: '',
        checkS: thisBtn
      })
    } else {
      that.setData({
        thisBtn: 2,
        returns: '',
        huan: 'on',
        checkS: thisBtn
      })
    }
  },
  numInput: function (e) {
    var num = e.detail.value;
    var that = this;
    var canNum = this.data.canNum;
    if (num == 0) {
      return "";
    }
    if (num > canNum) {
      util.showMsg('没有足够的数量')
      that.setData({
        num: ''
      })
    } else {
      that.setData({
        num: num
      })
    }

  },
  message: function (e) {
        util.markFormId(e.detail.formId);
    var btnType = this.data.thisBtn;
    var content = e.detail.value.textarea;
    var ssid = this.data.ssid;
    var that = this;
    var num = this.data.num;
    var messageData = {
      sellerId: that.data.sellerId,
      seller: that.data.seller,
      orderId: that.data.orderId,
      orderProductId: that.data.orderProductId,
      productId: that.data.productId,
      question: content,
      number: that.data.num,
    }
    if (btnType == 1) {//退货
      if (!num) {
        util.showMsg('请输入正确的数量')
      } else {
        var url = host.host + '/member/doproductback.html';
        util.httpsPostWithId(url, messageData, function (data) {
          that.setData({
            cFlag: ''
          })
          if (data.success) {
            util.showModal('提示', '申请退货成功!', '返回', '退货列表', function () {
              wx.navigateTo({
                url: dict.pages.change_goods,
              })
            }, function () {
              var url = host.host + '/member/backapply.html?id=' + that.data.orderId;
              util.showLoading('加载中')
              util.httpsGetWithId(url, that.infoShow)
              var url1 = host.host + '/member/canbackorexchange.html?orderProductId=' + that.data.orderProductId + '&orderId=' + that.data.orderId
              util.showLoading('加载中')
              util.httpsGetWithId(url1, function (res) {
                wx.hideLoading();
                that.setData({
                  canNum: res.data,
                  num: res.data,
                })
              })
            })
          } else {
            util.showMsg('退货失败,请重新刷新页面后尝试')
          }
        })
      }
    }
    else if (btnType == 2) {//换货
      that.setData({
        cFlag: ''
      })
      if (!num) {
        util.showMsg('请输入正确的数量')

      } else {
        var url = host.host + '/member/doproductexchange.html'
        util.httpsPostWithId(url, messageData, function (data) {
          
          if (data.success) {
            util.showModal('提示', '申请换货成功!', '返回', '换货列表' , function () {
              that.setData({
                cFlag: ''
              })
              util.navigateTo(dict.pages.my_backGoods)
            }, function () {
              var url = host.host + '/member/backapply.html?id=' + that.data.orderId;
              util.showLoading('加载中')
              util.httpsGetWithId(url, that.infoShow)
              var url1 = host.host + '/member/canbackorexchange.html?orderProductId=' + that.data.orderProductId + '&orderId=' + that.data.orderId
              util.showLoading('加载中')
              util.httpsGetWithId(url1, function (res) {
                wx.hideLoading();
                that.setData({
                  canNum: res.data,
                  num: res.data,
                })
              })
            })
          } else {
            util.showMsg(data.message)
          }
        })
      }
    } else {
      util.showMsg('请选择服务类型')
    }
  }
})