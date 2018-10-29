
import {host, util, dict} from '../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex:1,
    control:false
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.reqService();
  },
  reqService:function(){
    var url = host.host + '/partner/list';
    util.showLoading('加载中..')
    util.httpsGet(url,function(data){
        wx.hideLoading();
        this.setData({
          data: data.data,
          control:true
        })
    }.bind(this),function(){},'请求伙伴列表数据')    
  },
  jumpToPartnerDetail:function(e){
      util.navigateTo(dict.pages.partnerDetail + "?id=" + e.currentTarget.dataset.id)
  },
  reqMore: function () {
    var url = host.host + '/partner/list?pageIndex='+(this.data.pageIndex+1);
    var that = this;
    util.showLoading('加载中...')
    util.httpsGet(url, function (data) {
      wx.hideLoading();
      if (data.data.partnerList.length!=0){
        that.data.data.partnerList=that.data.data.partnerList.concat(data.data.partnerList)
          that.setData({
            pageIndex: that.data.pageIndex+1,
            data:that.data.data
          })
      }
    },function(){},'请求更多伙伴数据')    
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.reqService();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.reqMore();
  },

  /**
* 用户点击右上角分享
*/
  onShareAppMessage: function () {
    var that = this;
    return {
      title: host.companyName,
      path: '/pages/partner/partner'
    }
  },
})