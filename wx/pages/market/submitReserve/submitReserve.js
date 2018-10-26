// 预约参数
import {dict, host, util, common} from '../../../utils/server';
var CHECK = common.check;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    todayDate: common.returnDate("date"),
    scrollHeight: common.exchangeToRpx(wx.getSystemInfoSync().windowHeight) - 160,//表单滑动列表

    msgPanelHeight: common.exchangeToRpx(wx.getSystemInfoSync().windowHeight) - 90,

    msgPanelScrollHeight: common.exchangeToRpx(wx.getSystemInfoSync().windowHeight) - 430,
    showIndentDetail: false,

    startDate: '',//使用开始日期
    endDate: '',//结束日期
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  customInputEvent: function (e) {
    console.log(e)
    let index = e.currentTarget.dataset.index;
    this.data.msgItems[index].content = e.detail.value
    this.setData({
      msgItems: this.data.msgItems
    })
  },
  reqService: function () {
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    let url = host.host + '/appointment/' + this.data.actId + '.html?goodsId=' + this.data.goodsId;
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var data = data.data;
      var msgItems = [];
      if (data.key1){
      data.key1.forEach((key, i) => {
        let item = {
          title: key,
          holderString: (data.key2[i] ? data.key2[i] : ''),
          content: ''
        }
        msgItems.push(item)
      })
      }

      this.setData({
        goodsName: data.ActAppointment.name,
        img: data.config.image_resource + data.ActAppointment.image,
        goodsPrice: common.toDecimal(data.ActAppointment.price),
        priceTotal: common.toDecimal(data.ActAppointment.price * this.data.selNum),
        normName: (data.goods.normName != '' ? data.goods.normName : '默认规格'),
        msgItems: msgItems,
        sellerId: data.seller.id
      })

    }.bind(this), function () {
      wx.hideLoading();
    }, "请求提交信息页面初始化数据")
  },
  hideOrShowDialog: function () {
    this.setData({
      showIndentDetail: !this.data.showIndentDetail
    })
  },
  chooseDate: function (e) {
    console.log(e)

    switch (e.currentTarget.dataset.datetype) {
      case "0":
        this.setData({
          startDate: e.detail.value
        })
        break;
      case "1":
        this.setData({
          endDate: e.detail.value
        })
        break;
    }
  },
  submitMsg: function (e) {
    console.log(e)
    let name = e.detail.value.name;
    let phoneNumber = e.detail.value.phoneNumber;
    let other = e.detail.value.other;
    let startDate = e.detail.value.startDate;
    let endDate = e.detail.value.endDate;
    if (common.checkSpace(name, true)) {
      util.showMsg('预约人姓名信息不能全为空格')
      return;
    }
    if (name == '') {
      util.showMsg('请输入预约人姓名')
      return;
    }
    if (!common.checkStr(name)) {
      util.showMsg('预约人姓名不支持特殊符号(包括表情等)')
      return;
    }
    if (startDate == '') {
      util.showMsg('请选择预约使用的开始日期')
      return;
    }
    if (endDate == '') {
      util.showMsg('请选择预约使用的结束日期')
      return;
    }
    if (phoneNumber == '') {
      util.showMsg('请输入手机号码')
      return;
    }
    if (phoneNumber.length < 11) {
      util.showMsg('手机号码长度有误')
      return;
    }
    if (!CHECK.phone(phoneNumber)) {
      util.showMsg('手机号码格式有误')
      return;
    }
    var flag = false;
    this.data.msgItems.forEach((item) => {
      if (common.checkSpace(item.content, true)) {
        util.showMsg(item.title + '信息不能全为空格')
        flag = true;
        return;
      }
      if (!common.checkStr(item.content)) {
        util.showMsg(item.title + '信息不支持特殊符号(包括表情等)')
        flag = true;
        return;
      }
    })
    if (flag) {
      return;
    }
    if (common.checkSpace(other, true)) {
      util.showMsg('商家留言信息不能全为空格')
      return;
    }
    if (!common.checkStr(other)) {
      util.showMsg('商家留言信息不支持特殊符号(包括表情等)')
      return;
    }
    this.setData({
      name: name,
      phoneNumber: phoneNumber,
      other: other,
    })
    this.hideOrShowDialog();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      productId: options.productId,
      actId: options.actId,
      selNum: options.selNum,
      goodsId: options.goodsId
    })
    util.checkSsId(function () {
      
      this.reqService();
    }.bind(this))
   
  },
  pay: function (e) { 
    util.markFormId(e.detail.formId);
    wx.showLoading({
      title: '加载中..',
      mask: true,
    })
    var url = host.host + '/order/orderSubmitForAppointment.html';
    //预定订单信息
    var value1 = [];
    this.data.msgItems.forEach((item) => {
      value1.push(item.content);
    })
    var data = {
      // 订单使用的积分数
      integral: 0,
      // 订单来源 1、pc；2、H5；3、Android；4、IOS 
      source: 2,
      // 支付方式名称     
      paymentName: '微信支付',
      // 支付方式
      paymentCode: 'wxpay',
      // 订单备注
      remark: '',
      // 产品productId
      productId: this.data.productId,
      //数量
      number: this.data.selNum,
      //活动id
      actAppointmentId: this.data.actId,
      //货品id
      productGoodsId: this.data.goodsId,
      //发票相关
      invoiceStatus: '',
      invoiceType: '',
      invoiceTitle: '',
      invoiceTitleSlt: '个人',
      newInvoiceTitleText: '',
      sellerId: this.data.sellerId,
      //预定订单信息
      detail: JSON.stringify({
        name: this.data.name,
        mobile: this.data.phoneNumber,
        comment: this.data.other,
        startTime: this.data.startDate,
        endTime: this.data.endDate,
      }),
      value1: value1.toString()
    }
    console.log(data)
    util.httpsPostWithId(url, data, function (data) {
      wx.hideLoading();
      if (data.data != null) {
        if (data.success) {
          // 生成订单成功
          var paySn = data.data.paySn;//订单id
          var money = common.accMul(data.data.payAmount, 100);//支付的金额
          var describe = host.companyName;
          //支付成功回调方法
          util.reqPay(paySn, money, describe, function () {
            util.showModal('提示', '支付成功!是否前往预定订单列表？', '返回首页', '订单列表', function () {
              wx.redirectTo({
                url: '/pages/myReserve/myReserve',
              })
            }, function () {
              wx.switchTab({
                url: dict.pages.index,
              })
            })
            //取消支付回调方法
          }, function () {
            util.showModal('提示', '支付已取消!当前已生成订单，是否预定前往订单列表', '返回', '订单列表', function () {
              wx.redirectTo({
                url: '/pages/myReserve/myReserve',
              })
            }, function () {
              wx.navigateBack({
                delta: 1,
              })
            })
          })
        }
      } else {
        wx.hideLoading();
        util.showMsg(data.message, function () {
          util.showModal('提示', '订单已生成,是否前往订单列表', '取消', '确定', function () {
            wx.redirectTo({
              url: '/pages/myReserve/myReserve',
            })
          })
        })
      }
    }, function () { }, "请求支付")
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

})