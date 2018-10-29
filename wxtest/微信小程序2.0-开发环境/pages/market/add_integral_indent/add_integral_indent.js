
import {host, util, common, onfire, dict} from '../../../utils/server';

var address = -1;
// 订阅的事件
var eventObj = onfire.on('seladd', function (addid) {
  address = addid;  //做具体的事
  util.log('选择地址后返回的地址Id',address)
});
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    // 显示和隐藏优惠券
    hideOrShowCoupon: true,
    // 输入或选择优惠券
    inputOrSel: 0,
    // 显示或者隐藏发票
    hideOrShowBill: true,
    // 地址数据
    // 商品金额
    goods_price:0.00,
    // 优惠券优惠
    couponValue:0.00,
    // 运费
    ticket:'',
    // address_data:null
    noBill: false, //不要发票
     remark: '',
  },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.reqIndentDetail()
    },
    onLoad:function(options){
        this.setData({
        productId :options.productId,
        styleId :options.styleId,
        sellerId :options.sellerId,
        goodId : options.goodId,
        count:options.count
        })
    },
  // 跳转到选择地址
  jumpToAddress: function () {
    wx.navigateTo({
      url: dict.pages.my_address + '?type=2',
    })
  },
  showDesc:function(){
    wx.showToast({
      title: '您的积分不足',
      duration: 1500,
    })
  },
  //留言输入监听
  InputEvent: function (e) {
    console.log(e)
    this.setData({
      remark: e.detail.value
    })
  },

  // 显示和隐藏发票
  hideOrShowBill: function () {
    this.setData({
      hideOrShowBill: !this.data.hideOrShowBill
    })
  },
  reqIndentDetail: function () {
    var that = this;
    var url = url = host.host + '/order/jifen-' + this.data.productId + '-' + this.data.styleId + '-' + this.data.sellerId + '-' + this.data.goodId + '-' + this.data.count + '.html';
    if (address!=-1){
      var url = url = host.host + '/order/jifen-' + this.data.productId + '-' + this.data.styleId + '-' + this.data.sellerId + '-' + this.data.goodId + '-' + this.data.count + '.html?addressId=' + address;
    }
    util.showLoading('加载中..')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource;
      var shops = [];//订单商品列表
      var address;
      // 地址
      if (data.address != null) {
        address = {
          name: data.address.memberName,//收货人姓名
          addAll: data.address.addAll + data.address.addressInfo,//地址
          phone: data.address.phone,
          id: data.address.id,
        }
      }
      // 商品信息
      var good = {
        sellerLogo:config+data.seller.sellerLogo,
        shopName: data.seller.sellerName,
        shopId: data.seller.id,
        img: config + data.actIntegral.image,
        goodsId: data.actIntegral.productId,
        goodsName: data.product.name1,
        price: data.actIntegral.price * data.number,
        actPrice: data.product.malMobilePrice,
        style: data.productGoods.normName,
        count_num: data.number,
        integral: data.member.integral,
        total: data.actIntegral.firstPrice * data.number + data.transFee,
        // 运费
      }
      that.setData({
        address: address,
        good: good
      })
    })
  },
  // 选择或者输入序列号
  inputOrSel: function (e) {
    var id = e.currentTarget.dataset.id;
    this.setData({
      inputOrSel: id
    })
  },
  // 设置发票抬头
  setTickets: function (e) {
    this.setData({
      ticket: e.detail.value.ticket,
      hideOrShowBill: true,
      noBill: true
    })
  },
  // 确认不使用bill
  noBill: function (e) {
    this.setData({
      ticket: '',
      noBill: false,
      hideOrShowBill: true,
    })
  },
  //支付
  pay:function(e){
    util.markFormId(e.detail.formId);
    var that = this;
    // 判断是否设置了地址
    if (this.data.address == undefined || this.data.address == null){
      util.showModal('提示', '请先设置地址', '取消', '确定', function () {
        that.jumpToAddress();
      })
      return;
    }
    // 判断买家留言是否合法
    if (this.data.remark != '') {
      if (!common.checkStr(this.data.remark)) {
        util.showMsg('留言内容不支持特殊符号')
        return;
      }
    } 
    util.showModal('提示', '请确认订单无误', '取消', '确定', function () {
        var url = host.host + '/order/ordercommitforintegral.html';
        //发票
        var invoiceStatus = '';
        if (that.data.ticket != '') {
          invoiceStatus = 1;
        } else {
          invoiceStatus = 0;
        }
        var data = {
          // 订单使用的积分数
          integral: that.data.good.price,
          // 订单来源 1、pc；2、H5；3、Android；4、IOS 
          source: 2,
          // 支付方式名称     
          paymentName: '微信支付',
          // 支付方式
          paymentCode: 'wxpay',
          // 订单备注
          remark: that.data.remark,
          // 地址ID
          addressId: that.data.address.id,
          productId: that.data.productId,
          sellerId: that.data.sellerId,
          number: that.data.count,
          actIntegralId: that.data.goodId,
          productGoodsId: that.data.styleId,
          invoiceStatus: 1,//发票状态 1个人  2公司
          invoiceType: '明细',
          invoiceTitle: that.data.ticket,
          invoiceTitleSlt: '个人',
          newInvoiceTitleText: that.data.ticket,
        }
        if (!that.data.noBill) {
          data.invoiceStatus = '';
          data.invoiceType = '';
          data.invoiceTitle = '';
          data.invoiceTitleSlt = '个人';
          data.newInvoiceTitleText = '';
        }
        util.showLoading('加载中...')
        util.httpsPostWithId(url, data, function (data) {
          wx.hideLoading();
          if (data.data != null) {
            if (data.success) {
              //线下支付
              var paySn = data.data.paySn;
              var orderId = data.data.ordersList.id;
              util.integralPay(paySn, that, orderId)
            }
          } else {
            if (data.message != null) {
              util.showMsg(data.message)
            }
          }
        }, function () {

        },function(){},'请求积分支付')
    })
  },
  
})