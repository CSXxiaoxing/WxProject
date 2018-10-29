
import {host, util} from '../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
  data: { 
   
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  onLoad: function (options) {
    this.reqService();
  },

  reqService:function(){
    var url = host.host + '/about/us';

    util.showLoading('加载中..')
    util.httpsGet(url,function(data){
      wx.hideLoading();
      data = data.data
      if (data.compayInfo.coordinate!=null){
        var array = data.compayInfo.coordinate.split(',')
        var latitude = array[0];
        var longitude = array[1];
        var markers = [{
          iconPath: "/images/biao.png",
          id: 0,
          latitude: latitude,
          longitude: longitude,
          width: 20,
          height: 20
        }]

        this.setData({
          longitude: longitude,
          latitude: latitude,
          markers: markers
        })
      }

    
      this.setData({
        data: data,
      })
     
    }.bind(this),function(){

    },'请求联系我们数据')
  },
  makePhone:function(e){
      wx.makePhoneCall({phoneNumber: e.currentTarget.dataset.phone})
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.reqService();
  },

  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {

    return {
      title: host.companyName,
      path: '/pages/contact/contact'
    }
  },
})