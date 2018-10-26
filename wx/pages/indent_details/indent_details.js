
import {host, util, common, dict} from '../../utils/server';

Page({
    data: {
        tColor: host.tColor,
    },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderId: options.indentId,
      isback: options.isback
    }) 
  },
  onShow:function(){
    this.reqService();
  },
  // 立即支付
  pay:function(){ 

    var that = this;
    util.repeatPay(this.data.indent_data.id, this.data.indent_data.orderSn, common.accMul(this.data.indent_data.total, 100),'订单支付', function(){
      that.reqService();
    },function(){
      
    })
  },
  // 确认收货
  sure_GetGoods:function(){
    var that = this;
    util.showModal('提示', '是否确认已收货?', '取消', '确认收货', function () {
      var url = host.host + '/member/goodreceive.html?ordersId=' + that.data.orderId;
      util.httpsGetWithId(url, function () {
        util.showToast('已确认收货',true,function(){
          that.reqService();
        })
      },function(){},'确认收货请求');
    })
  },
  // 跳转到物流
  logistics: function () {

    wx.navigateTo({
      url: '/pages/logistic/logistic?ordersId=' + this.data.orderId + '&logisticsId=' + this.data.logisticsId + '&logisticsNumber=' + this.data.logisticsNumber + '&addressAll=' + this.data.indent_data.address + "&sellerId=" + this.data.indent_data.sellerId + "&logisticsName=" + this.data.indent_data.logisticsName
    })

   
  
  },
  //跳转到退换详情
  jumpToBackUpList:function(){
    wx.navigateTo({
      url: dict.pages.change_goods,
    })
  },
  // 跳转到晒单评价
  jumpToBackUp: function () {
    wx.navigateTo({
      url: dict.pages.back_goods + '?orderId=' + this.data.orderId,
    })
  }, 
  jumpToaddEvaluate:function(){
    wx.navigateTo({
      url: dict.pages.add_evaluate+'?orderId=' + this.data.orderId,

    })
  },
  jumpToEvaluate:function(){
    wx.navigateTo({
      url: dict.pages.evaluate,
    })
  },
  reqService:function(){
    var that = this;
    // util.showLoading('加载中...')
    var url = host.host + '/member/orderdetail.html?id=' + this.data.orderId;
    util.showLoading('加载中..')
    util.httpsGetWithId(url, function (data) {
        wx.hideLoading()    
        var data = data.data;
        var config = data.config.image_resource;
        var logisticsId = data.order.logisticsId;//物流公司名称   
        var logisticsNumber=data.order.logisticsNumber;//运单号
        var addressAll = data.order.addressAll;//地址

       
        var indent_data = {
          id:data.order.id,
          state: data.order.orderState,//订单状态
          orderType: data.order.orderType,//订单类型
          num: data.order.orderSn,//订单编号
          time: data.order.createTime,//下单时间
          total: data.order.moneyOrder,//订单金额
          address: data.order.addressAll + data.order.addressInfo,//地址
          consignee: data.order.name,//收货人
          phone: data.order.mobile,//电话
          goods:[],
          orderType: data.order.orderType,
          backOrExchangeNum: data.order.backOrExchangeNum,
          paySn: data.order.paySn,
          orderSn: data.order.orderSn,
          paymentName: data.order.paymentName,//支付方式
          paymentCode: data.order.paymentCode,
          integral: data.order.integral,
          invoiceStatus: data.order.invoiceStatus,//发票方式
          goods_price: data.order.moneyProduct,//商品金额
          moneyCoupon: data.order.moneyCoupon,//优惠券节省
          moneyIntegral: data.order.moneyIntegral,//积分优惠
          moneyDiscount: data.order.moneyDiscount,//全部优惠
          moneyLogistics: data.order.moneyLogistics,//运费
          invoiceTitle:data.order.invoiceTitle,
          invoiceType: data.order.invoiceType,
          evaluateState: data.order.evaluateState, //评价状态
          sellerId: data.order.sellerId,
          logisticsName: data.order.logisticsName
        }
        for (var i = 0; i < data.order.orderProductList.length;i++){
          // this.setData({
          //   goodsImg: options.goodsImg,
          //   goodsName: options.goodsName,
          //   orderSn: options.orderSn,
          //   productId: options.productId,
          //   productGoodsId: options.productGoodsId,
          //   ordersProductId: options.ordersProductId
          // })
          var goodItem = {
            id: data.order.orderProductList[i].productId,
            name: data.order.orderProductList[i].productName,
            count: data.order.orderProductList[i].number,
            img: config+data.order.orderProductList[i].productLeadLittle,
            style: data.order.orderProductList[i].specInfo,
            isEvaluate: data.order.orderProductList[i].isEvaluate,//是否评价
            ordersSn: data.order.orderProductList[i].ordersSn,
            productGoodsId: data.order.orderProductList[i].productGoodsId,
            productId: data.order.orderProductList[i].productId,
            ordersProductId: data.order.orderProductList[i].id
          }
          indent_data.goods[i] = goodItem;
        }
        that.setData({
          indent_data: indent_data,
          logisticsNumber: logisticsNumber,
          logisticsId: logisticsId,
          addressAll:addressAll
        })
    })
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
  // 取消订单
  cancel_order:function(){

    var url = host.host + '/member/cancalorder.html?id=' + this.data.orderId;
    util.showModal('提示', '是否取消该订单?', '返回', '确认取消', function () {
      util.showLoading('加載中',true)
      util.httpsGetWithId(url, function (data) {
        wx.hideLoading()
        if (data.success) {
          this.reqService()
          util.showToast('已取消');
        }else{
          util.showMsg(data.message)
        }
      }.bind(this),function(){},'取消订单接口')
    }.bind(this))

  },

})