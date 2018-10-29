
import {host, util, dict} from '../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex:1,
    tColor: host.tColor,
    indent_data:[],
    control:false,
    reqControl:true,
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  onLoad:function(option){
    var typeId = option.typeId;
    console.log(typeId)
    if (typeId==undefined){
      typeId = '0';
    } 
    this.setData({
      selected:typeId
    })
  
  
  },
  jumpToDetails:function(e){
    var productId = e.currentTarget.dataset.productid;
       wx.navigateTo({
         url: '/pages/goods_detail/goods_detail?productId=' + productId,
    })
  },
  type_select:function(e){
    var typeId = e.currentTarget.dataset.typeid;
    this.setData({
      selected:typeId
    })
    this.reqService();
  },
  // 请求订单数据
  reqService:function(){
    var that = this;
    var url = host.host + '/member/order.html';
    if (this.data.selected!='0'){
      url = host.host + '/member/order.html?orderState=' + this.data.selected;
    }
    util.showLoading('加载中');
    util.httpsGetWithId(url,function(data){
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource;
      //控制无数据时文字开关
      that.setData({
        control: true   
      })
      if (data.ordersList!=null){
        var indent_data = [];
        for (var i = 0; i <data.ordersList.length;i++){
          var orderItem = {
            id: data.ordersList[i].id,
            orderState: data.ordersList[i].orderState,
            act_total: data.ordersList[i].moneyOrder,
            payType: data.ordersList[i].paymentCode,
            integral: data.ordersList[i].integral,
            backOrExchangeNum: data.ordersList[i].backOrExchangeNum,
            orderType: data.ordersList[i].orderType,
            orderGoods: []
          }
          for (var x = 0; x < data.ordersList[i].orderProductList.length;x++){
            var goodItem = {
              //商品id
              id: data.ordersList[i].orderProductList[x].productId,
              //商品图片
              img: config+data.ordersList[i].orderProductList[x].productLeadLittle,
              //商品名字
              name: data.ordersList[i].orderProductList[x].productName,
              //商品数量
              count: data.ordersList[i].orderProductList[x].number,
              
            }
            orderItem.orderGoods[x] = goodItem;
         }
          indent_data[i] = orderItem;
        }
        that.setData({
          indent_data: indent_data,
          pageIndex: 1
        })
      }
    })
  },
  // 请求更多数据
  reqMore:function(){

    var that = this;
    var url = host.host + '/member/moreorder.html?orderState=&pageIndex=' + (this.data.pageIndex + 1);
    if (this.data.selected != '0') {
      url = host.host + '/member/moreorder.html?orderState=' + this.data.selected + '&pageIndex=' + (this.data.pageIndex + 1);
    }
    util.showLoading('加载中')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource
      if (data.ordersList.length != 0) {
       
        var indent_data = [];
        for (var i = 0; i < data.ordersList.length; i++) {
          var orderItem = {
            id: data.ordersList[i].id,
            orderState: data.ordersList[i].orderState,
            act_total: data.ordersList[i].moneyOrder,
            orderGoods: [],
            orderType: data.ordersList[i].orderType,
            payType: data.ordersList[i].paymentCode,
            integral: data.ordersList[i].integral,
            backOrExchangeNum: data.ordersList[i].backOrExchangeNum,


          }
          for (var x = 0; x < data.ordersList[i].orderProductList.length; x++) {
            var goodItem = {
              //商品id
              id: data.ordersList[i].orderProductList[x].productId,
              //商品图片
              img: config + data.ordersList[i].orderProductList[x].productLeadLittle,
              //商品名字
              name: data.ordersList[i].orderProductList[x].productName,
              //商品数量
              count: data.ordersList[i].orderProductList[x].number,
            }
            orderItem.orderGoods[x] = goodItem;
          }
          indent_data[i] = orderItem;
        }
        that.setData({
          pageIndex: that.data.pageIndex + 1,
          indent_data: that.data.indent_data.concat(indent_data),
        })
      } else {
        util.showToast('已加载全部数据')
      }
    
    }, function () {

    },'请求更多订单数据')
    
  },
  jumpToIndentDetail:function(e){
    var indentId = e.currentTarget.dataset.indentid;
    var isback = e.currentTarget.dataset.isback;
    var ordertype = e.currentTarget.dataset.ordertype;
    if (ordertype==8){
      util.navigateTo(dict.pages.reserveIndentDetail+'?id=' + indentId + '&fromType=1')
    }else{
      util.navigateTo('/pages/indent_details/indent_details?indentId=' + indentId + '&isback=' + isback)
    }
 
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    util.checkSsId(function () {

      this.reqService();
    }.bind(this))
  
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.reqMore();
  },

})