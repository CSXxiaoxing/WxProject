
import {host, util, common, dict} from '../../utils/server';

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
  jumpToRSDetail: function (e) {
    refreshId = e.currentTarget.dataset.id;
    util.navigateTo(dict.pages.reserveIndentDetail+'?id=' + e.currentTarget.dataset.id)
  },
  reqService: function () {
    util.showLoading('加载中');
    var url = host.host + '/appointmentlist.html';
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var config = data.data.config.image_resource;
      var list = [];
      data.data.actAppointment.forEach((appItem) => {
        let item = {
          img: config + appItem.image,
          actName: appItem.actName,
          state: appItem.state,
          id: appItem.id,
          createTime: appItem.createTime,
          price: common.toDecimal(appItem.price),
          number: appItem.number,
          specInfo: (appItem.specInfo ? appItem.specInfo : '默认规格')
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
        var url = host.host + '/appointmentdetail/' + refreshId + '.html';
        util.httpsGetWithId(url, function (data) {
          var data = data.data;
          var config = data.config.image_resource;
          var item = {
            img: config + data.actAppointment.image,
            actName: data.actAppointmentDetail.actName,
            state: data.actAppointmentDetail.state,
            id: data.actAppointmentDetail.id,
            createTime: data.actAppointmentDetail.createTime,
            price: common.toDecimal(data.actAppointmentDetail.price),
            number: data.actAppointmentDetail.number,
            specInfo: (data.actAppointmentDetail.specInfo ? data.actAppointmentDetail.specInfo : '默认规格')
          }
          this.data.list.forEach((appItem, i) => {
            if (appItem.id == refreshId) {
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
      var url = host.host + '/appointmentlist.html?page=' + (this.data.pageIndex + 1);
      util.httpsGetWithId(url, function (data) {
        wx.hideLoading();
        var config = data.data.config.image_resource;

        data.data.actAppointment.forEach((appItem) => {
          let item = {
            img: config + appItem.image,
            actName: appItem.actName,
            state: appItem.state,
            id: appItem.id,
            createTime: appItem.createTime,
            price: common.toDecimal(appItem.price),
            number: appItem.number,
            specInfo: (appItem.specInfo ? appItem.specInfo : '默认规格')
          }
          this.data.list.push(item)
        })
        this.setData({
          list: this.data.list,
          pageIndex: (data.data.actAppointment.length > 0 ? this.data.pageIndex + 1 : this.data.pageIndex),
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