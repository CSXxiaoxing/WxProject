
import {host, util, onfire, common, dict} from '../../../utils/server';
var address = -1;
// 订阅的事件
var eventObj = onfire.on('seladd', function (addid) {
  address = addid;  //做具体的事
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
    goods_price: 0.00,
    // 优惠券优惠
    couponValue: 0.00,
    // 运费
    ticket: '',
    //使用的优惠券
    userCoupon: [],
    // address_data:null
    noBill: false,
    actualPrice:0,
    couponValue:0,
    total:0,
    remark:'',
  },
    // 全局注入
    onToolFun:function(e){
        this.setData({
            tool: e.detail
        })
    },
    
  onLoad: function (option) {
    let productId = option.productId;
    let productGoodId = option.productGoodId;
    let actId = option.actId;
    let sellerId = option.sellerId;
    let number = option.number;
    let registrationId = option.registrationId;
    this.setData({
      productId: productId,
      productGoodId: productGoodId,
      sellerId: sellerId,
      actId: actId,
      number: number,
      registrationId: registrationId
    })

  },
  //留言输入监听
  InputEvent: function (e) {
    console.log(e)
    this.setData({
      remark: e.detail.value
    })
  },

  // 跳转到选择地址
  jumpToAddress: function () {
    wx.navigateTo({
      url: dict.pages.my_address + '?type=2&address='+address,
    })
  },
  // 显示和隐藏发票
  hideOrShowBill: function () {

    this.setData({
      hideOrShowBill: !this.data.hideOrShowBill
    })
  },
  // 确认使用序列号
  submitSerialNum: function (e) {
    this.setData({
      hideOrShowCoupon: true
    })
  },
  // 确认不使用bill
  noBill: function (e) {
    this.setData({
      ticket:'',
      noBill:false,
      hideOrShowBill: true,
    })
  },
  // 清空序列号
  clearInput: function () {
    this.setData({
      serial_number: ''
    })
  },
  // 显示或隐藏优惠券布局
  hideOrShowCoupon: function (e) {
    var shopId = e.currentTarget.dataset.shopid;
    for (var i = 0; i < this.data.shops.length; i++) {
      if (this.data.shops[i].id == shopId) {
        this.data.shops[i].hideOrShowCoupon = !this.data.shops[i].hideOrShowCoupon;
        this.setData({
          shops: this.data.shops
        })
        // 如果店铺的优惠券列表为空，就请求一遍优惠券
        if (this.data.shops[i].coupons.length == 0 && !this.data.shops[i].hideOrShowCoupon) {
          this.reqCoupon(shopId)
        }
      }
    }
  },
  // 显示优惠券内容
  couponContentSel: function (e) {
    var shopId = e.currentTarget.dataset.shopid;
    var isSel = e.currentTarget.dataset.issel;
    for (var i = 0; i < this.data.shops.length; i++) {
      if (this.data.shops[i].id == shopId) { //找到对应的商店优惠券布局
        this.data.shops[i].couponContentSel = isSel;
        this.setData({
          shops: this.data.shops
        })
      }
    }
  },
  //显示已经选中优惠券的商店提示
  showCouponDesc: function () {
    for (var x = 0; x < this.data.userCoupon.length; x++) {
      for (var y = 0; y < this.data.shops.length; y++) {
        if (this.data.userCoupon[x].shopId == this.data.shops[y].id) {
          this.data.shops[y].selCounponName = this.data.userCoupon[x].name;
          this.data.shops[y].selCouponMinAmount = this.data.userCoupon[x].minAmount;
          this.data.shops[y].selCouponValue = this.data.userCoupon[x].couponValue;
        }
      }
    }
    this.setData({
      shops: this.data.shops
    })
  },
  
  reqIndentDetail: function () {
    var that = this;
    var url = host.host + '/order/bargain-' + this.data.productId + '-' + this.data.productGoodId + '-' + this.data.sellerId+'-'+this.data.actId+'-1'+'.html'
   
    if (address != -1) {
      url = host.host + '/order/bargain-' + this.data.productId + '-' + this.data.productGoodId + '-' + this.data.sellerId + '-' + this.data.actId + '-1' + '.html?addressId=' + address;
    }

    util.showLoading('加载中..')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      if (!data.success) {
        // util.showMsg(data.message, function () {
        //   wx.navigateBack({
        //     delta: 1,
        //   })
        // })
        return;
      }
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
        sellerLogo: config + data.seller.sellerLogo,
        shopName: data.seller.sellerName,
        shopId: data.seller.id,
        img: config + data.actBargain.image,
        goodsId: data.actBargain.productId,
        goodsName: data.actBargain.name,
        price: common.toDecimal(data.actBargain.marketPrice),
        style: data.productGoods.normName,
        count_num: data.number,
   


      }
      that.setData({
        address: address,
        good: good,
        total: common.toDecimal(common.accAdd(data.actBargainRegistration.productNewPrice, data.transFee)),
        cutAmount: common.toDecimal(data.actBargainRegistration.cutAmount),
        // 运费
        transFee: common.toDecimal(data.transFee),
      })
    },function(){},'请求订单详情')
  },
  countAllPrice:function(){
    if (this.data.actualPrice - this.data.couponValue > 0) {
      this.setData({
        total: common.toDecimal2(this.data.actualPrice - this.data.couponValue),
      })
    } else {
      this.setData({
        total: 0,
      })
    }
  },
  // 选择优惠券
  sel_coupon: function (e) {
    // 商店id
    var that = this;
    var shopid = e.currentTarget.dataset.shopid;
    var sellerAmount = e.currentTarget.dataset.selleramount;
    var couponSn = e.currentTarget.dataset.couponsn;
    // 取消优惠券
    for (var i = 0; i < that.data.shops.length; i++) {
      if (shopid == that.data.shops[i].id) {
        for (var x = 0; x < that.data.shops[i].coupons.length; x++) {
          if (couponSn == that.data.shops[i].coupons[x].couponSn) {
            if (that.data.shops[i].coupons[x].isSel) {
              that.data.shops[i].coupons[x].isSel = false;
              // 移除使用的优惠券数组中的优惠券
              var userCoupon = []
              for (var y = 0; y < that.data.userCoupon.length; y++) {
                if (that.data.userCoupon[y].couponSn != couponSn) {
                  userCoupon.push(that.data.userCoupon[y])
                }
              }
              that.showCouponDesc()
              that.setData({
                shops: that.data.shops,
                userCoupon: userCoupon,
              })
              that.count_coupon() //重新计算价格
              return;
            }
          }
        }
      }
    }
    var url = host.host + "/order/checksellercoupon.html?orderAmount=" + sellerAmount + '&couponType=1&couponPassword=&couponSn=' + couponSn + '&sellerId=' + shopid;
    util.showLoading('加载中')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      if (data.data) {
        for (var i = 0; i < that.data.shops.length; i++) {
          if (shopid == that.data.shops[i].id) {
            for (var x = 0; x < that.data.shops[i].coupons.length; x++) {
              if (couponSn == that.data.shops[i].coupons[x].couponSn) {
                that.data.shops[i].coupons[x].isSel = true;
                var flag = true;
                // 判断数组中是否已使用该店铺的优惠券
                for (var y = 0; y < that.data.userCoupon.length; y++) {
                  if (that.data.userCoupon[y].shopId == shopid) {
                    that.data.userCoupon[y] = that.data.shops[i].coupons[x]
                    flag = false;
                  }
                }
                // 如果数组中没有该店铺的优惠券，就加入数组
                if (flag) {
                  that.data.userCoupon.push(that.data.shops[i].coupons[x])
                }
                that.setData({
                  userCoupon: that.data.userCoupon
                })
              } else {
                that.data.shops[i].coupons[x].isSel = false;
              }
            }
          }
        }
        that.setData({
          shops: that.data.shops,
        })
        that.count_coupon();
        that.showCouponDesc();
      } else {
        util.showMsg(data.message)
      }
    },function(){},'选中优惠券')
  },
  // 提交序列号和密码
  submit_serial: function (e) {
    util.log('提交序列号和密码',e)
    var that = this;
    var serialNum = e.detail.value.serialnum;
    var serialPass = e.detail.value.serialpass;
    var shopId = e.detail.target.dataset.shopid;//店铺id
    var sellerAmount = e.detail.target.dataset.selleramount;//使用条件
    if (serialNum == '') {
      util.showMsg('序列号不能为空')
      return;
    } else if (serialPass == '') {
      util.showMsg('密码不能为空')
      return;
    }
    var url = host.host + "/order/checksellercoupon.html?orderAmount=" + sellerAmount + '&couponType=2&couponPassword=' + serialPass + '&couponSn=' + serialNum + '&sellerId=' + shopId;
    util.showLoading('加载中')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      if (data.success) {
        util.showMsg('兑换成功')
        var coupon = {
          couponSn: data.data.couponSn,
          id: data.data.id,
          name: data.data.couponName,
          minAmount: data.data.minAmount,//使用条件
          couponValue: data.data.couponValue,
          timeout: data.data.timeout,
          password: serialPass,
          couponType: 2,
          shopId: data.data.sellerId,
        }
        var flag = true;//判断里面是否已经勾选了该店铺的优惠券
        for (var i = 0; i < that.data.userCoupon.length; i++) {
          if (coupon.shopId == that.data.userCoupon[i].shopId) {
            flag = false;
            that.data.userCoupon[i] = coupon
          }
        }
        if (flag) {
          that.data.userCoupon.push(coupon)
        }
        //将勾选的优惠券去掉
        for (var i = 0; i < that.data.shops.length; i++) {
          if (that.data.shops[i].id == shopId) {
            for (var x = 0; x < that.data.shops[i].coupons.length; x++) {
              that.data.shops[i].coupons[x].isSel = false;
            }
            that.data.shops[i].hideOrShowCoupon = true;
            that.setData({
              shops: that.data.shops,
            })
          }
        }
        that.setData({
          userCoupon: that.data.userCoupon
        })
        that.count_coupon();
      } else {
        util.showMsg(data.message)
      }
    })
  },

  // 计算优惠后的价格
  count_coupon: function () {
    var couponTotalValue = 0;
    for (var i = 0; i < this.data.userCoupon.length; i++) {
      couponTotalValue += this.data.userCoupon[i].couponValue;
    }
    this.setData({
      couponValue: couponTotalValue,
    })
    this.countAllPrice();
  },
  // 清除输入框
  clear_input: function (e) {
    util.log('清除输入框')
    var shopId = e.currentTarget.dataset.shopid;
    for (var i = 0; i < this.data.shops.length; i++) {
      if (shopId == this.data.shops[i].id) {
        this.data.shops[i].serialNum = '';
        this.data.shops[i].serialPass = '';
        this.setData({
          shops: this.data.shops
        })
      }
    }
  },
  // 请求优惠券
  reqCoupon: function (shopId) {
    var that = this;
    var url = host.host + '/order/getsellercoupon.html?sellerId=' + shopId;
    util.showLoading('加载中...')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      if (data.data.length != 0) {
        var coupons = [];
        for (var i = 0; i < data.data.length; i++) {
          var coupon = {
            couponSn: data.data[i].couponSn,
            id: data.data[i].id,
            minAmount: data.data[i].minAmount,//使用条件
            couponValue: data.data[i].couponValue,
            timeout: data.data[i].timeout,
            password: data.data[i].password,
            shopId: data.data[i].sellerId,
            name: data.data[i].couponName,
            couponType: 1,
            isSel: false
          }
          coupons[i] = coupon
        }
        util.log('请求对应的店铺的优惠券数组长度',coupons.length)
        for (var i = 0; i < that.data.shops.length; i++) {
          if (that.data.shops[i].id == shopId) {
            that.data.shops[i].coupons = coupons
            that.setData({
              shops: that.data.shops
            })
          }
        }
      }
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
  //拼接提交订单时，优惠券长度
  couponUrl: function () {
    if (this.data.userCoupon.length != 0) {
      var urlParam = '';
      for (var i = 0; i < this.data.userCoupon.length; i++) {
        urlParam += ('couponType' + this.data.userCoupon[i].shopId + '=' + this.data.userCoupon[i].couponType);
        urlParam += ('&couponSn' + this.data.userCoupon[i].shopId + '=' + this.data.userCoupon[i].couponSn);
        urlParam += ('&couponPassword' + this.data.userCoupon[i].shopId + '=' + this.data.userCoupon[i].password);
        if (i != this.data.userCoupon.length - 1) {
          urlParam += ('&couponValue' + this.data.userCoupon[i].shopId + '=' + this.data.userCoupon[i].couponValue) + '&';
        } else {
          urlParam += ('&couponValue' + this.data.userCoupon[i].shopId + '=' + this.data.userCoupon[i].couponValue);
        }
      }
      return urlParam;
    }
    return '';
  },
  //支付
  pay: function (e) { 
    util.markFormId(e.detail.formId);
    var that = this;
    // 判断是否设置了地址
    if (this.data.address == undefined || this.data.address == null) {
      util.showModal('提示','请先设置地址','取消','确定',function(){
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
      var url = host.host + '/order/orderSubmitForBargain.html';
        //发票
        var invoiceStatus = '';
        if (that.data.ticket != '') {
          invoiceStatus = 1;
        } else {
          invoiceStatus = 0;
        }
        // 积分
        var useCouponSellerIds = '';
        for (var i = 0; i < that.data.userCoupon.length; i++) {
          if (i != that.data.userCoupon.length - 1) {
            useCouponSellerIds = useCouponSellerIds + that.data.userCoupon[i].shopId + ','
          } else {
            useCouponSellerIds = useCouponSellerIds + that.data.userCoupon[i].shopId
          }
        }
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
          remark: that.data.remark,
          actBargainId: that.data.actId,
          productGoodsId: that.data.productGoodId,
          productId: that.data.productId,
          sellerId: that.data.sellerId,
          number:1,
          // 地址ID
          addressId: that.data.address.id,
          couponList: that.couponUrl(),
          invoiceStatus: 1,//发票状态 1个人  2公司
          invoiceType: '明细',
          invoiceTitle: that.data.ticket,
          invoiceTitleSlt: '个人',
          newInvoiceTitleText: that.data.ticket,
        }
        // 如果使用了优惠券
        if (useCouponSellerIds != '') {
          data.useCouponSellerIds = useCouponSellerIds
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
          if (data.data != null) {
            if (data.success) {
              // 生成订单成功
              var paySn = data.data.paySn;//订单id
              var money = common.accMul(data.data.payAmount, 100);//支付的金额
              var describe = host.companyName;
              //支付成功回调方法
              util.reqPay(paySn, money, describe, function () {
          
                util.showMsg('支付成功!',function(){
                  var pages = getCurrentPages();
                  for (var x = 0; x < pages.length; x++) {
                    if (pages[x].route == "pages/shareBargain/shareBargain") {
                      console.log('已经有了这个页面了，需要回退' + (pages.length - x - 1))

                      onfire.fire('refreshBGPage', that.data.registrationId);
                      // onfire.fire('rfMyBargin', -2);
                      wx.navigateBack({
                        delta: pages.length - x - 1,
                      })
                      return;
                    }
                  }
                  console.log('没有这个页面,当前页面有' + pages.length)
                  wx.redirectTo({
                    url: '/pages/shareBargain/shareBargain?actId=' + that.data.actId + '&sellerId=' + that.data.sellerId,
                  })
                })

               
                
                //取消支付回调方法
              }, function () {

                  wx.navigateBack({
                    delta: 1,
                  })
                
              })
            }
          } else {
            wx.hideLoading();
            util.showMsg(data.message,function(){
              wx.navigateBack({
                delta: 1,
              })
            })
          }
        },function(){},'请求生成订单接口')
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      this.reqIndentDetail()
  },
})