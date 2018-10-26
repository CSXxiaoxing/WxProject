
import {host, util} from '../../utils/server';

var time_inter;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    timepos1: 0,
    timepos2: 0,
    timepos3: 0,
    timepos4: 0,
    timepos5: 0,
    timepos6: 0,
    control:false,
    naviTitles:[]
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.reqService();
    this.reqMiaosha();
  },
  changeTab:function(e){
    var tabId = e.currentTarget.dataset.tabid;
    if (this.data.naviTitles){
      
      this.setData({
        productList:this.data.naviTitles[tabId].productList
      })

    }
  },
  onShareAppMessage: function () {
    // 用户点击右上角分享
    var that = this;
    return {
      title: host.companyName, // 分享标题
      path: '/pages/inTime/inTime'// 分享路径
    }
  },
  // 跳转到订单详情
  jumpToDetail:function(e){
    var goodId = e.currentTarget.dataset.goodid;
    var productId = e.currentTarget.dataset.productid;
    wx.navigateTo({
      url: '/pages/inTime_detail/inTime_detail?productId=' + productId + '&goodId=' + goodId,
    })
  },


  reqService: function () {
    var that = this;
    var url = host.host + '/act-flash-sale.html'
    util.showLoading('加载中');
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      if (data.data) {//有秒杀活动
        var data = data.data;
        var config = data.config.image_resource;
        var naviTitles = [] //全部标题
        var productList = [];
        // 全部标题
        for (var i = 0; i < data.allstage.length; i++) {
            var title = {
              time: data.allstage[i].startTime,
              id: data.allstage[i].id,
              productList: [],
              navType : 2,//0 ： 结束  1：正在  2即将 
            }
            // 循环判断状态
            for (var x = 0; x < data.stageListOver.length;x++){
              if (data.allstage[i].id == data.stageListOver[x].id){
                title.navType = 0
              }
            }
            if (data.actFlashSaleStageNow != null && data.allstage[i].id == data.actFlashSaleStageNow.id){
              title.navType = 1
            }
            // if (){
            //   title.navType = 1
            // }
            //循环增加商品信息
            for (var x = 0; x < data.allstage[i].productList.length; x++) {
              var good = {
                navType:title.navType,
                name: data.allstage[i].productList[x].product.name1,
                productId: data.allstage[i].productList[x].product.id,
                goodId: data.allstage[i].productList[x].actFlashSaleId,
                productId: data.allstage[i].productList[x].product.id,
                img: config + data.allstage[i].productList[x].product.masterImg,
                price: data.allstage[i].productList[x].price,
                marketPrice: data.allstage[i].productList[x].product.marketPrice,
              }
              title.productList.push(good)
            }
            naviTitles.push(title)
        }
        if (naviTitles.length!=0){
          productList = naviTitles[0].productList;
        }
        for (var i = 0; i < naviTitles.length;i++){
          if (naviTitles[i].navType==1){
            productList = naviTitles[i].productList
          }
        }
        that.setData({
          naviTitles: naviTitles,
          productList: productList
        })
        if (naviTitles.length==0){
          that.setData({
            control:true
          })
        }

      }else{
        that.setData({
          control: true
        })
      }
    })
  },
  reqMiaosha: function () {
    var that = this;
    var url = host.host + '/indexqianggou.html';
    util.showLoading('加载中...')
    util.httpsGet(url, function (data) {
      wx.hideLoading();
      var miaoSha = data.data;
      var countTime = miaoSha.countTime;
      if (time_inter == null || time_inter == undefined) {
        clearInterval(time_inter)
      }
      time_inter = setInterval(function () {
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

        var timepos1 = (hour + '').split("")[0];
        var timepos2 = (hour + '').split("")[1];
        var timepos3 = (minute + '').split("")[0];
        var timepos4 = (minute + '').split("")[1];;
        var timepos5 = (second + '').split("")[0];
        var timepos6 = (second + '').split("")[1];

        that.setData({
          timepos1: timepos1,
          timepos2: timepos2,
          timepos3: timepos3,
          timepos4: timepos4,
          timepos5: timepos5,
          timepos6: timepos6,
        })
        countTime--;
        if (countTime < 0) {
          clearInterval(time_inter)
          that.reqMiaosha();
        }
      }, 1000);
      that.setData({
        miaoSha: miaoSha
      })
    },function(){},'请求限时抢购数据')
  },

})