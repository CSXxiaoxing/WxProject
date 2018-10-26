
import {host, util} from '../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor:host.tColor,
    randomtProducts: [],
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  call:function(){
    if(this.data.phone){
      wx.makePhoneCall({
        phoneNumber: this.data.phone,
      })
    }else{
      util.showMsg('当前商家客服正忙，请稍后尝试')
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      logisticsId: options.logisticsId,
      logisticsNumber: options.logisticsNumber,
      addressAll: options.addressAll,
      sellerId: options.sellerId,
      logisticsName: options.logisticsName,
    })
    this.reqService();

  },
  reqService: function () {
    var url = host.host + '/express/query?sellerId='+this.data.sellerId+'&type=' + this.data.logisticsId + '&postid=' + this.data.logisticsNumber;
    util.showLoading('加载中..');
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var data = data.data;
      var logistic_data = data.kuaiDi100QueryData.data;
      var timer = []
      for (var v = 0; v < logistic_data.length; v++) {
        timer.push(logistic_data[v].time.slice(5, 16));
      }
      console.log(timer)


      //设置页面数据
      this.setData({
        logistic_data: logistic_data,
        timer: timer,
        phone: data.phone,
        status: data.status
      })
    }.bind(this), function () { }, '请求物流详情')

  },


})