
import {host, util, common} from '../../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
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
      id: options.id,
      fromType: (options.fromType ? options.fromType:0)  //1的时候说明是全部订单 跳转来的
    })
    this.reqService();
  },
  //重新支付
  rePay: function () {

    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    util.repeatPay(this.data.id, this.data.indentData.orderSn, common.accMul(this.data.indentData.totolPrice, 100), '订单支付', function () {
      this.reqService()
    }.bind(this), function () {

    })
  },
  // 取消订单
  cancelOrder: function () {

    var url = host.host + '/member/cancalorder.html?id=' + this.data.indentData.ordersId;
    util.showModal('提示', '是否取消该预约订单?', '返回', '确认取消', function () {
      util.showLoading('加載中', true)
      util.httpsGetWithId(url, function (data) {
        wx.hideLoading()
        if (data.success) {
          this.reqService()
          util.showToast('已取消');
        } else {
          util.showMsg(data.message)
        }
      }.bind(this), function () { }, '取消订单接口')
    }.bind(this))

  },

  //網絡請求
  reqService: function () {
    util.showLoading('加载中')
    var url = host.host + '/appointmentdetail/' + this.data.id + '.html' + (this.data.fromType == 1 ? '?order=' + this.data.id:'');
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var data = data.data;
      var infoList = [];
      if (data.key1 && data.value1){
        data.key1.forEach((key, i) => {
          var item = {
            title: key,
            content: (data.value1[i] ? data.value1[i] : '无')
          }
          infoList.push(item)
        })
      }
      

      this.setData({
        //购买的商品信息
        indentData:{
        img: data.config.image_resource + data.actAppointment.image,
        goodsName: data.actAppointmentDetail.actName,
        number: (data.actAppointmentDetail.number ? data.actAppointmentDetail.number : 1),
        norm: (data.actAppointmentDetail.specInfo != null && data.actAppointmentDetail.specInfo != '' ? data.actAppointmentDetail.specInfo : '默认规格'),
        marketPrice: common.toDecimal(data.actAppointment.marketPrice),//商品市场单价
        price: common.toDecimal(data.actAppointment.price),//商品预约单价
        sellerName: data.actAppointment.sellerName,
        totolOriginalPrice: common.toDecimal(common.accMul(data.actAppointment.marketPrice, (data.actAppointmentDetail.number != null ? data.actAppointmentDetail.number : 1))),
        totolPrice: common.toDecimal(common.accMul(data.actAppointment.price, (data.actAppointmentDetail.number != null ? data.actAppointmentDetail.number : 1))),
        finalPayment: common.toDecimal(common.Subtr(common.accMul(data.actAppointment.marketPrice, (data.actAppointmentDetail.number != null ? data.actAppointmentDetail.number : 1)), common.accMul(data.actAppointment.price, (data.actAppointmentDetail.number != null ? data.actAppointmentDetail.number : 1)))),//尾款
        ordersId: data.actAppointmentDetail.ordersId,
        infoList: infoList,
        reason: (data.actAppointmentDetail.reason ? data.actAppointmentDetail.reason:'无'),
        state: data.actAppointmentDetail.state,
        orderId: data.actAppointmentDetail.orderSn,
        createTime: data.actAppointmentDetail.createTime,
        reserve_price: data.actAppointmentDetail.price,
        name: data.actAppointmentDetail.name,
        phone: data.actAppointmentDetail.mobile,
        other: (data.actAppointmentDetail.comment ? data.actAppointmentDetail.comment:'无'),
        startTime: common.getDate(data.actAppointmentDetail.startTime),
        endTime: common.getDate(data.actAppointmentDetail.endTime),
        orderSn: data.actAppointmentDetail.orderSn
        }
      })

    }.bind(this), function () { wx.hideLoading();}.bind(this), "请求订单数据")
  },

})