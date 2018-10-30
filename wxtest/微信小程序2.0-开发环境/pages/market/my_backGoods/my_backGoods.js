
import {host, util} from '../../../utils/server';

Page({
  data: {
    tColor: host.tColor,
    goods_msg_item: [],
    pageIndex: 1,
    bottom_desc: '上拉加载更多数据',
    control:false
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    util.checkSsId(function () {
      this.reqService()
    }.bind(this))
  
  },
  // 隐藏和显示
  hide_orShow:function(event){

    var pos = event.currentTarget.dataset.pos;

    var flag = true;
    if (this.data.goods_msg_item[pos].detail_hidden){
      flag = false;
    }else{
      flag = true;
    }
    this.data.goods_msg_item[pos].detail_hidden=flag;
    this.setData({
      goods_msg_item: this.data.goods_msg_item,
    })
  },
  // 请求服务器
  reqService:function(){
    var that = this;
    
    var url = host.host + '/member/exchange.html';
    util.showLoading('加载中..');
    util.httpsGetWithId(url,function(data){
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource;
      var indent_items = [];
      // 拼装要的数据
      for (var i = 0; i < data.exchangeList.length; i++) {
        var indent_item = new Object;
        var order_data = data.exchangeList[i];
        indent_item.detail_hidden = true;
        indent_item.indent_id = order_data.ordersProduct.ordersSn;
        indent_item.app_time = order_data.createTime;
        indent_item.ques_desc = order_data.question;
        indent_item.bg_count = order_data.number;
        indent_item.bg_price = order_data.backMoney;
        indent_item.bg_integral = order_data.backIntegral;
        indent_item.bg_state = order_data.state;
        indent_item.bg_money_state = order_data.stateMoney;
        indent_item.bg_money_time = order_data.updateTime
        indent_item.bg_option = order_data.remark;
        var bg_goods = [];
        // 退货商品
        var goods_item = new Object;
        goods_item.id = order_data.ordersProduct.productId;
        goods_item.img = config + order_data.product.masterImg;
        goods_item.name = order_data.ordersProduct.productName;

        goods_item.count = order_data.number
        bg_goods[0] = goods_item;
        indent_item.bg_goods = bg_goods;
        indent_items[i] = indent_item;
      }
      that.setData({
        goods_msg_item: indent_items,
        control:true
      })
    })
    
  },
  // 跳转到对应商品的详情页
  jumpToDetail: function (event) {
    var id = event.currentTarget.id;
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?id=' + id,
    })
  }, 
  reqMore: function () {
    var that = this;
    var url = host.host + '/member/moreexchange.html?pageIndex=' + (this.data.pageIndex+1)
    util.showLoading('加载中..');
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      if (data.data.exchangeList.length != 0) {

        var config = data.data.config.image_resource;
        var indent_items = [];
        // 拼装要的数据
        for (var i = 0; i < data.data.exchangeList.length; i++) {
          var indent_item = new Object;
          var order_data = data.data.exchangeList[i];
          indent_item.detail_hidden = true;
          indent_item.indent_id = order_data.ordersProduct.ordersSn;
          indent_item.app_time = order_data.createTime;
          indent_item.ques_desc = order_data.question;
          indent_item.bg_count = order_data.ordersProduct.exchangeNumber;
          indent_item.bg_price = order_data.backMoney;
          indent_item.bg_integral = order_data.backIntegral;
          indent_item.bg_state = order_data.state;
          indent_item.bg_money_state = order_data.stateMoney;
          indent_item.bg_money_time = order_data.updateTime
          indent_item.bg_option = order_data.ordersProduct.specInfo;

          var bg_goods = [];
          // 退货商品
          var goods_item = new Object;
          goods_item.id = order_data.ordersProduct.productId;
          goods_item.img = config + order_data.product.masterImg;
          goods_item.name = order_data.ordersProduct.productName;

          goods_item.count = order_data.ordersProduct.exchangeNumber
          bg_goods[0] = goods_item;
          indent_item.bg_goods = bg_goods;
          indent_items[i] = indent_item;
        }
        that.setData({
          pageIndex: that.data.pageIndex + 1,
          goods_msg_item: that.data.goods_msg_item.concat(indent_items),
          has_more: false
        })
      } else {
        that.setData({
          has_more: false,
          bottom_desc: '已加载全部数据'
        })
      }
    })
  },
  onReachBottom: function () {

    var that = this;

    this.setData({

      has_more: true

    })
    this.reqMore()


  },

})