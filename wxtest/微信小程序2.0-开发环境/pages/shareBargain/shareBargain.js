
import {host, util, common, onfire, dict} from '../../utils/server';

var refreshId = -1;
var refreshEvent = onfire.on('refreshBGPage', function (data) {
  console.log('刷新砍价页面'+data)
  refreshId = data
})
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    posY: 0,
    dis: 900,
    showRet: false,
    showBarginMsg: false,
    showRule: false,
    pageIndex:1,
    cutTotal:0.00,
    //帮砍成功后的价格
    afterCutPrice:0.00
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  showOrhideBarginRule: function () {
    this.setData({
      showRule: true
    })
  },
  showBarginMsg: function (fc) {
    this.setData({
      showBarginMsg: !this.data.showBarginMsg
    })
    typeof fc == "function" && fc();
  },
  hideDialog: function () {
    this.setData({
      showBarginMsg: false,
      showRule: false
    })
  },
  scroll: function (e) {
    this.setData({
      showRet: (common.exchangeToRpx(e.detail.scrollTop) > 900)
    })
  },
  //分享至好友

  backTop: function () {
    this.setData({
      showRet: false,
      posY: 0
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var pages = getCurrentPages();
    this.setData({
      registrationId: options.registrationId,
      sellerId: (options.sellerId ? options.sellerId:-1),
      fromType: (options.fromType ? options.fromType : 0),
      currentPageUrl: '/' + pages[pages.length - 1].route + '?registrationId=' + options.registrationId + (options.sellerId ? '&sellerId=' + options.sellerId : '') + (options.fromType ? '&fromType=' + options.fromType : ''),
      actId: options.actId
    })

  },
  reqService:function(e){
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    var url = host.host + '/bargain/toCutDetail.html?registrationId=' + this.data.registrationId; 
    util.httpsGetWithId(url,function(data){
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource;
      data.registrations.productPrice = common.toDecimal(data.registrations.productPrice);
      data.registrations.productNewPrice = common.toDecimal(data.registrations.productNewPrice);
      data.registrations.image = config + data.registrations.image;
      this.setData({
        registrations: data.registrations,
        status: data.status,
        actId: data.registrations.actId,
        sellerId: data.sellerId,
        orderId: (data.status == 4 ? (data.orderId ? data.orderId:-1):-1)
      })
    }.bind(this), function () { wx.hideLoading(); }, '请求砍价分享页', this.data.currentPageUrl)
  },
  reqBargainRecord:function(){
    var url = host.host + '/bargain/getRecord.html?registrationId=' + this.data.registrationId;
    util.httpsGetWithId(url,function(data){
      data.data.bargainRecords.forEach((item,i)=>{
        data.data.bargainRecords[i].cutPrice = common.toDecimal(item.cutPrice)
        data.data.bargainRecords[i].currPrice = common.toDecimal(item.currPrice)
      })
        this.setData({
          bargainRecords: data.data.bargainRecords,
          cutTotal: common.toDecimal(data.data.cutTotal),
          total: data.total
        })
    }.bind(this), function () { }, "请求帮砍列表", this.data.currentPageUrl)
  },
  //请求更多帮看数据
  reqMore:function(e){
      wx.showLoading({
        title: '加载中',
        mask: true,
      })
      var url = host.host + '/bargain/getRecord.html?registrationId=' + this.data.registrationId +'&page='+(this.data.pageIndex + 1);
      util.httpsGetWithId(url, function (data) {
        wx.hideLoading();
        data.data.bargainRecords.forEach((item, i) => {
          data.data.bargainRecords[i].cutPrice = common.toDecimal(item.cutPrice)
          data.data.bargainRecords[i].currPrice = common.toDecimal(item.currPrice)
        })
        this.setData({
          bargainRecords: this.data.bargainRecords.concat(data.data.bargainRecords),
          pageIndex: (data.data.bargainRecords.length > 0 ? this.data.pageIndex + 1 : this.data.pageIndex),
          total: data.total
        })
      }.bind(this), function () { wx.hideLoading(); }, "请求更多帮砍列表", this.data.currentPageUrl)
  },
  //刷新页面
  refresh:function(e){
    this.reqService();
    this.reqBargainRecord();
  },
  //发起砍价
  startBargin:function(){
    wx.showLoading({
      title: '加载中..',
      mask: true,
    })
    var url = host.host + '/bargain/helpBargain.html';
    var data = {
      registrationId: this.data.registrationId
    }
    util.httpsPostWithId(url,data,function(data){
      wx.hideLoading();
      if(data.success){
        this.setData({
          afterCutPrice: common.toDecimal(data.data.cutPrice)
        })
        this.showBarginMsg(function(){
          this.reqService();
          this.reqBargainRecord();
        }.bind(this))
      }else{
        util.showMsg(data.message)
      }
    }.bind(this),function(){
      wx.hideLoading();
      }, "帮砍", this.data.currentPageUrl)
  },
  jumpToIndentDetail:function(e){
    if (this.data.orderId != -1){
      util.navigateTo('/pages/indent_details/indent_details?indentId=' + this.data.orderId)
    }

  },
  //跳转到列表
  toBarginList:function(){
    util.navigateTo(dict.pages.bargainList)
  },
  jumpToIndent:function(){
    util.navigateTo(dict.pages.add_bargainIndent+'?registrationId=' + this.data.registrationId + '&productId=' + this.data.registrations.productId + '&productGoodId=' + this.data.registrations.goodsId + '&sellerId=' + this.data.sellerId + '&actId=' + this.data.registrations.actId + '&number=1&registrationId=' + this.data.registrationId)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
    if(refreshId!=-1){
      wx.redirectTo({
            url: '/pages/shareBargain/shareBargain?registrationId=' + refreshId + '&sellerId=' + this.data.sellerId + (this.data.fromType ? this.data.fromType : 0),
            complete:function(){
              refreshId = -1;
            }
      })
    }else{
      util.checkSsId(function () {
        this.refresh();
      }.bind(this))
   
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // onfire.un('refreshBGPage');
    
  },

  preSingleImage: function (e) {
    var imgUrl = e.currentTarget.dataset.imgurl;
    if (imgUrl == '') {
      return;
    }
    wx.previewImage({
      current: imgUrl,
      urls: [imgUrl],
    })
  },
  onShareAppMessage: function (e) {

    var shareMsg;
    if (e.from == 'button') {
      shareMsg = {
        title: '【砍价活动】快来帮我砍~~~',
        path: this.data.currentPageUrl,
        success: function (res) {
          // 转发成功
          console.log(res)
        },
        fail: function (res) {
          // 转发失败
          console.log(res)
        }
      }
    } else {
      shareMsg = {
        title: '【砍价活动】',
        path: dict.pages.bargainDetail + '?actId=' + this.data.actId + "&productId=" + this.data.registrations.productId,
        success: function (res) {
          // 转发成功
          console.log(res)
        },
        fail: function (res) {
          // 转发失败
          console.log(res)
        }
      }
    }
    return shareMsg


  }
})