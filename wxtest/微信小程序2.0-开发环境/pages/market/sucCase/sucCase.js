
import {host, util, dict} from '../../../utils/server';

Page({
    data: {
        tColor: host.tColor,
        pageIndex:1,
        control:false
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
    onLoad: function () {
        this.reqService();
    },
  reqService:function(){
    var that = this;
    var url = host.host + '/case/list';
    util.showLoading('加载中..')
    util.httpsGet(url,function(data){
      wx.hideLoading();
      that.setData({
        caseData: data.data,
        control:true
      })
    },function(){
      that.setData({
        control: true
      })
    },'请求成功案例数据')
  },
  //跳转到成功案例
  jumpToCaseDetail: function (e) {
    util.navigateTo(dict.pages.caseDetail + '?caseId=' + e.currentTarget.dataset.caseid)
  },
  reqMore: function () {
    var url = host.host + '/case/list?pageIndex=' + (this.data.pageIndex+1);
    var that = this;
    util.showLoading('加载中..')
    util.httpsGet(url, function (data) {
      wx.hideLoading();
      if (data.data.successCases.length != 0) {
        that.data.caseData.successCases = that.data.caseData.successCases.concat(data.data.successCases)
        that.setData({
          caseData: that.data.caseData,
          pageIndex: that.data.pageIndex + 1
        })
      }
    })
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
    onShareAppMessage: function () {
        var that = this;
        return {
        title: host.companyName,
        path: dict.pages.sucCase,
        }
    },
})