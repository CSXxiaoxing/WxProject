
import {host, util, common, onfire, dict} from '../../../utils/server';


var refreshId = -1;
var refreshEvent = onfire.on('rfMyPintuan', function (data) {

  refreshId = data;

})
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

    util.navigateTo('/pages/indent_details/indent_details?indentId=' + e.currentTarget.dataset.orderid)
  },
  reqService: function () {
    util.showLoading('加载中');
    var url = host.host + '/pintuanlist.html';
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var config = data.data.config.image_resource;
      var list = [];
      data.data.actPintuan.forEach((tuan) => {
        let item = {
          img: config + tuan.actPintuanImage,
          actName: tuan.actPintuanName,
          state: tuan.actPintuanActivityState,
          id: tuan.id,
          orderId: tuan.orderId,
          actId: tuan.actPintuanActivityId,
          createTime: tuan.createTime,
          price: common.toDecimal(tuan.pintuanPrice),
          number: tuan.number,
          allowSize: tuan.allowSize,
          specInfo: (tuan.specInfo ? tuan.specInfo : '默认规格'),
          time_inter:null,
          countTime: tuan.limitTime,
          time: {
            timepos1: 0,
            timepos2: 0,
            timepos3: 0,
            timepos4: 0,
            timepos5: 0,
            timepos6: 0,
          }
        }
        list.push(item)
      })
      this.setData({
        list: list,
        total: data.total,
        control: true
      })
      this.data.list.forEach((item,i)=>{
        if (item.state == 1) {
        this.parseTime(item.countTime,i);
        }
      })
    }.bind(this), function () {
      wx.hideLoading();
      this.setData({
        control: true
      })
      }.bind(this), "请求订单列表", dict.pages.myPintuan)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('refreshId=' + refreshId)

    if(refreshId!=-1){
      this.refreshIndent(refreshId, true)
    }
    
  },

  parseTime: function (countTime,index) {
    if (countTime<=0){
      return;
    }
    if (this.data.list[index].time_inter != null || this.data.list[index].time_inter != undefined) {
      clearInterval(this.data.list[index].time_inter)
    }
    this.data.list[index].time_inter = setInterval(function () {
      var day = 0,
        hour = 0,
        minute = 0,
        second = 0;//时间默认值 
      if (countTime > 0) {
        day = Math.floor(countTime / (60 * 60 * 24));
        hour = Math.floor(countTime / (60 * 60)) - (day * 24);
        minute = Math.floor(countTime / 60) - (day * 24 * 60) - (hour * 60);
        second = Math.floor(countTime) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
      }
      if (day <= 9) day = '0' + day;
      if (hour <= 9) hour = '0' + hour;
      if (minute <= 9) minute = '0' + minute;
      if (second <= 9) second = '0' + second;
      // -------------切割数组
      var timepos1 = (hour + '').split("")[0];
      var timepos2 = (hour + '').split("")[1];
      var timepos3 = (minute + '').split("")[0];
      var timepos4 = (minute + '').split("")[1];;
      var timepos5 = (second + '').split("")[0];
      var timepos6 = (second + '').split("")[1];
      this.data.list[index].time = {
        timepos1: timepos1,
        timepos2: timepos2,
        timepos3: timepos3,
        timepos4: timepos4,
        timepos5: timepos5,
        timepos6: timepos6
      }
      this.setData({
        list: this.data.list
      })
      countTime--;
      if (countTime < 0) {
        this.refreshIndent(this.data.list[index].id)
      }
    }.bind(this), 1000);
  },

  refreshIndent: function (rId,fromType){
    if (rId != -1) {
      wx.showLoading({
        title: '加载中..',
        mask: true,
      })
      setTimeout(function () {
     
        var url = host.host + '/pintuanlist.html?id=' + rId;
        util.httpsGetWithId(url, function (data) {
          wx.hideLoading();
          var data = data.data;
          var config = data.config.image_resource;
          var item = {
            img: config + data.actPintuan[0].actPintuanImage,
            actName: data.actPintuan[0].actPintuanName,
            state: data.actPintuan[0].actPintuanActivityState,
            id: data.actPintuan[0].id,
            actId: data.actPintuan[0].actPintuanActivityId,
            createTime: data.actPintuan[0].createTime,
            price: common.toDecimal(data.actPintuan[0].pintuanPrice),

            number: data.actPintuan[0].number,
            specInfo: (data.actPintuan[0].specInfo ? data.actPintuan[0].specInfo : '默认规格'),
            allowSize: data.actPintuan[0].allowSize,
            orderId: data.actPintuan[0].orderId,
            time_inter: null,
            countTime: data.actPintuan[0].limitTime,
            time: {
              timepos1: 0,
              timepos2: 0,
              timepos3: 0,
              timepos4: 0,
              timepos5: 0,
              timepos6: 0,
            }
          }
          this.data.list.forEach((tuan, i) => {
            if (tuan.id == rId) {
              clearInterval(this.data.list[i].time_inter);
              this.data.list[i] = item;
              if (item.state == 1){
                this.parseTime(item.countTime, i)
              }
            }

          })
          this.setData({
            list: this.data.list
          })
          if (fromType){
            refreshId = -1;
          }
         
        }.bind(this), function () {
            wx.hideLoading();
            if (fromType) {
              refreshId = -1;
            }
        }.bind(this), "刷新对应订单信息",dict.pages.myPintuan)
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
    onfire.un('rfMyPintuan');
    refreshId = -1;//还原变量，避免缓存
    if (this.data.list){
      this.data.list.forEach((item, i) => {
        if (this.data.list[i].time_inter != null) {
          clearInterval(this.data.list[i].time_inter)
        }
      })
    }
    
    
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
      var url = host.host + '/pintuanlist.html?page=' + (this.data.pageIndex + 1);
      util.httpsGetWithId(url, function (data) {
        wx.hideLoading();
        var config = data.data.config.image_resource;

        data.data.actPintuan.forEach((tuan) => {
          let item = {
            img: config + tuan.actPintuanImage,
            actName: tuan.actPintuanName,
            state: tuan.actPintuanActivityState,
            id: tuan.id,
            actId: tuan.actPintuanActivityId,
            createTime: tuan.createTime,
            price: common.toDecimal(tuan.pintuanPrice),
            number: tuan.number,
            specInfo: (tuan.specInfo ? tuan.specInfo : '默认规格'),
            allowSize: tuan.allowSize,
            time_inter: null,
            orderId: tuan.orderId,
            countTime: tuan.limitTime,
            time: {
              timepos1: 0,
              timepos2: 0,
              timepos3: 0,
              timepos4: 0,
              timepos5: 0,
              timepos6: 0,
            }
          }
          this.data.list.push(item)
        })
        this.setData({
          list: this.data.list,
          pageIndex: (data.data.actPintuan.length > 0 ? this.data.pageIndex + 1 : this.data.pageIndex),
          total: data.total,
          control: true
        })
        this.data.list.forEach((item,i)=>{
          if (item.state == 1 && item.time == null) {
            this.parseTime(item.countTime, i)
          }
        })
      }.bind(this), function () {
        wx.hideLoading();
        this.setData({
          control: true
        })
      }.bind(this), "请求订单列表")
    }
  },
  jumpToSharePintuan:function(e){
    refreshId = e.currentTarget.dataset.id;
    util.navigateTo( dict.pages.sharePintuan+'?actId='+e.currentTarget.dataset.actid)
  }

})