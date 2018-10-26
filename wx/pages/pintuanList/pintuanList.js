
import {host, util, common, dict} from '../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    tColorHelp: host.tColorHelp,
    pageIndex:1,
    total:1,
    control:false,
    
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  reqService:function(){
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    let url = host.host + '/pintuan.html'
    util.httpsGet(url,function(data){
          wx.hideLoading();
        var list = [];
        var config = data.data.config.image_resource;
        data.data.actpintuans.forEach((pintuan)=>{
          let item = {
            productId: pintuan.productId,
            id: pintuan.id,
            img: config + pintuan.image,
            name: pintuan.name,
            price: common.toDecimal(pintuan.price)
          };
          list.push(item)
        })
        this.setData({
          list: list,
          control:true,
          total: data.total
        })
    }.bind(this),function(){
      wx.hideLoading();
    this.setData({
        control:true
    })
    }.bind(this),"请求列表数据")
  },
  jumpToActPage:function(e){
    util.navigateTo(dict.pages.pintuanDetail+'?productId=' + e.currentTarget.dataset.productid + '&actId=' + e.currentTarget.dataset.actid)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.reqService();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
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
    if (this.data.list.length > 8) {
      wx.showLoading({
        title: '加载中',
        mask: true,
      })
      let url = host.host + '/pintuan.html?page='+(this.data.pageIndex+1);
      util.httpsGet(url, function (data) {
        wx.hideLoading();
        var config = data.data.config.image_resource;
        data.data.actpintuans.forEach((pintuan) => {
          let item = {
            productId: pintuan.productId,
            id: pintuan.id,
            img: config + pintuan.image,
            name: pintuan.name,
            price: common.toDecimal(pintuan.price)
          };
          this.data.list.push(item)
        })
        this.setData({
          list: this.data.list,
          pageIndex: (data.data.actpintuans.length > 0 ? this.data.pageIndex + 1 : this.data.pageIndex)
        })
      }.bind(this), function () { wx.hideLoading(); }, "请求列表数据")
    }
  }


})