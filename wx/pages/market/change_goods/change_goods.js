
import {host, util, dict} from '../../../utils/server';

Page({
  data: {
    tColor: host.tColor,
    goods_msg_item: [],
    control:false,
    pageIndex:1,
    bottom_desc:'上拉加载更多数据'
  },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    this.reqService()
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

    util.showLoading('加载中..')
    var url = host.host + '/member/back.html';
    util.httpsGetWithId(url,function(data){
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource;
      var indent_items = [];
      // 拼装要的数据
      data.backList.forEach((item)=>{
        var indent_item = {
          detail_hidden : true,
          indent_id: item.ordersProduct.ordersSn,
          app_time: item.createTime,
          ques_desc: item.question,
          bg_count: item.number,
          bg_price: item.backMoney,
          bg_integral: item.backIntegral,
          bg_state: item.stateReturn,
          bg_money_state: item.stateMoney,
          bg_money_time: item.updateTime,
          bg_option: item.remark,
        }
        var bg_goods = [];
        // 退货商品
        var goods_item = {
          id: item.ordersProduct.productId,
          img: config + item.product.masterImg,
          name: item.ordersProduct.productName,
          count: item.number
        }
       
        bg_goods[0] = goods_item;
        indent_item.bg_goods = bg_goods;
        indent_items.push(indent_item);
      })

      this.setData({
        goods_msg_item: indent_items,
        control:true
      })
   
    }.bind(this),function(){},'请求换货数据')
    
  },
  // 跳转到对应商品的详情页
  jumpToDetail: function (event) {
    var id = event.currentTarget.id;
    util.navigateTo('/pages/goods_detail/goods_detail?id=' + id)
  }, 
  reqMore: function () {
    var url = host.host + '/member/moreback.html?pageIndex=' + (this.data.pageIndex+1)
    util.showLoading('加载中');
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      if (data.data.backList.length != 0) {

        var config = data.data.config.image_resource;
        var indent_items = [];
        data.data.backList.forEach((item) => {
          var indent_item = {
            detail_hidden: true,
            indent_id: item.ordersProduct.ordersSn,
            app_time: item.createTime,
            ques_desc: item.question,
            bg_count: item.number,
            bg_price: item.backMoney,
            bg_integral: item.backIntegral,
            bg_state: item.stateReturn,
            bg_money_state: item.stateMoney,
            bg_money_time: item.updateTime,
            bg_option: item.remark,
          }
          var bg_goods = [];
          // 退货商品
          var goods_item = {
            id: item.ordersProduct.productId,
            img: config + item.product.masterImg,
            name: item.ordersProduct.productName,
            count: item.number
          }

          bg_goods[0] = goods_item;
          indent_item.bg_goods = bg_goods;
          indent_items.push(indent_item);
        })
       
        this.setData({
          pageIndex: this.data.pageIndex + 1,
          goods_msg_item: this.data.goods_msg_item.concat(indent_items),
          has_more: false
        })
      } else {
        this.setData({
          has_more: false,
          bottom_desc: '已加载全部数据'
        })
      }
    }.bind(this),function(){},'请求更多换货数据')
  },
  onReachBottom: function () {

    this.setData({ has_more: true })
    this.reqMore()


  },

})