

import {host, util, common} from '../../utils/server';

var refreshId = -1;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    control: false,
    total: 1,
    pageIndex: 1,
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.checkSsId(function () {
      this.reqService();
    }.bind(this))

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  jumpToShareBargin: function (e) {
    refreshId = e.currentTarget.dataset.id;
    util.navigateTo('/pages/shareBargain/shareBargain?registrationId=' + e.currentTarget.dataset.id +"&fromType=1&actId="+e.currentTarget.dataset.actid)
  },
  jumpToRSDetail: function (e) {

    util.navigateTo('/pages/indent_details/indent_details?indentId=' + e.currentTarget.dataset.orderid)
  },
  reqService: function () {
    util.showLoading('加载中');
    var url = host.host + '/member/bargain/list';
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var config = data.data.config.image_resource;
      var list = [];
      // return;
      data.data.registrations.forEach((barItem) => {
        let item = {
          img: config + barItem.image,
          actName: barItem.name,
          state: barItem.awardsStatus,
          id: barItem.id,
          createTime: barItem.createTime,
          price: common.toDecimal(barItem.productPrice),
          number: barItem.number,
          cutPrice: common.toDecimal(common.Subtr(barItem.productPrice,barItem.productNewPrice)),
          specInfo: (barItem.normName ? barItem.normName : '默认规格'),
          orderId: barItem.orderId,
          actId: barItem.actId
        }
        list.push(item)
      })
      this.setData({
        list: list,
        total: data.total,
        
        control: true
      })
    }.bind(this), function () {
      wx.hideLoading();
      this.setData({
        control: true
      })
    }.bind(this), "请求订单列表")
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (refreshId != -1) {
      setTimeout(function () {
        var url = host.host + '/member/bargain/list?regId=' + refreshId;
        util.httpsGetWithId(url, function (data) {
          var data = data.data;
          var config = data.config.image_resource;
          
          let item = {
            img: config + data.registrations[0].image,
            actName: data.registrations[0].name,
            state: data.registrations[0].awardsStatus,
            id: data.registrations[0].id,
            createTime: data.registrations[0].createTime,
            price: common.toDecimal(data.registrations[0].productPrice),
            number:data.registrations[0].number,
            cutPrice: common.toDecimal(common.Subtr(data.registrations[0].productPrice, data.registrations[0].productNewPrice)),
            specInfo: (data.registrations[0].normName ? data.registrations[0].normName : '默认规格'),
            orderId: data.registrations[0].orderId,
            actId: data.registrations[0].actId
          }
          this.data.list.forEach((barItem, i) => {
            if (barItem.id == refreshId) {
              this.data.list[i] = item;
            }
          })
          this.setData({
            list: this.data.list
          })
          refreshId = -1;
        }.bind(this), function () {
          refreshId = -1;
        }.bind(this), "刷新对应订单信息")
      }.bind(this), 100)
    }

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
    // this.reqService();


  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.list.length > 9) {
      wx.showLoading({
        title: '加载中',
        mask: true,
      })
      var url = host.host + '/member/bargain/list?page=' + (this.data.pageIndex + 1);
      util.httpsGetWithId(url, function (data) {
        wx.hideLoading();
        var config = data.data.config.image_resource;
      
        data.data.registrations.forEach((barItem) => {
          let item = {
            img: config + barItem.image,
            actName: barItem.name,
            state: barItem.awardsStatus,
            id: barItem.id,
            createTime: barItem.createTime,
            price: barItem.productPrice,
            number: barItem.number,
            cutPrice: common.toDecimal(common.Subtr(barItem.productPrice, barItem.productNewPrice)),
            specInfo: (barItem.normName ? barItem.normName : '默认规格'),
            orderId: barItem.orderId,
            actId: barItem.actId
          }
          this.data.list.push(item)
        })
        this.setData({
          list: this.data.list,
          pageIndex: (data.data.registrations.length > 0 ? this.data.pageIndex + 1 : this.data.pageIndex),
          total: data.total,
          control: true
        })
      }.bind(this), function () {
        wx.hideLoading();
        this.setData({
          control: true
        })
      }.bind(this), "请求订单列表")
    }
  },

})