
import {host, util} from '../../utils/server';

Page({
  data: {
    tColor: host.tColor,
    all_datas: [],
    // 分页页数
    allDataLength: 0,
    // 当前展示的数据长度
    currentPageLength: 0,
    // 当前页数
    currentPageNum: 0,
    control:false,
    goods_datas: [],
    goods_type: '',
    has_more_goods_detail: '查看更多数据',
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    this.reqGoodsInfo();
    // this.reqservice();
  },
  onShareAppMessage: function () {
    // 用户点击右上角分享
    var that = this;
    return {
      title: host.companyName, // 分享标题
      path: '/pages/hotGoods/hotGoods'// 分享路径
    }
  },
  // 
  reqGoodsInfo: function () {
    var that = this;
    var url = host.host + '/recommend.html?page=' + (that.data.currentPageNum + 1);
    util.showLoading('加载中...')
    util.httpsGet(url, function (data) {
      wx.hideLoading();

      var data = data.data;
      var config = data.config.image_resource;
      var goods_childs;

      if (data.recommendList.length != 0) {
        that.data.currentPageNum = data.pageIndex;

        for (var i = 0; i < data.recommendList.length; i++) {
          goods_childs = data.recommendList[i];
          var item = {
            id: goods_childs.product.id,
            goods_name: goods_childs.product.name1,
            goods_price: goods_childs.product.malMobilePrice,
            goods_img: config + goods_childs.product.masterImg,
          }
          that.data.all_datas[that.data.allDataLength + i] = item;
        }

        that.data.allDataLength = that.data.all_datas.length;
        // 分页显示了
        if (that.data.all_datas.length > 6) {
          for (var i = 0; i < 6; i++) {
            that.data.goods_datas[that.data.currentPageLength + i] = that.data.all_datas[i];
          }
          that.data.currentPageLength = that.data.goods_datas.length;
          that.setData({
            goods_datas: that.data.goods_datas,
            currentPageNum: that.data.currentPageNum,
            has_more_goods_detail: '查看更多数据',
          })
        }else{
         
          that.data.goods_datas = that.data.all_datas;
          
          that.data.currentPageLength = that.data.goods_datas.length;

          that.setData({

            goods_datas: that.data.goods_datas,

            currentPageNum: that.data.currentPageNum,

            has_more_goods_detail: '已无更多商品',

          })
        }
      } else {

        that.setData({
          has_more: false,
          has_more_goods_detail: '已无更多商品'
        })
      }
      that.setData({
        control:true,
      })
    },function(){
  
    },'请求热门商品数据')
  },
  // 跳转到对应商品的详情页
  jumpToDetail: function (event) {
    var id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?productId=' + id,
    })
  },

  onReachBottom: function () {
    // 页面上拉触底事件的处理函数

    var that = this;
    this.setData({
      has_more: true
    })
    if (that.data.allDataLength > that.data.currentPageLength) {

      if (that.data.allDataLength - that.data.currentPageLength <= 6) {

        for (var i = 0; i < (that.data.allDataLength - that.data.currentPageLength); i++) {

          that.data.goods_datas[that.data.currentPageLength + i] = that.data.all_datas[that.data.currentPageLength + i];
        }

        that.data.currentPageLength = that.data.allDataLength
        setTimeout(function () {
          that.setData({
            has_more: false,
            goods_datas: that.data.goods_datas
          })
        }, 1300)

      } else {

        for (var i = 0; i < 6; i++) {

          that.data.goods_datas[that.data.currentPageLength + i] = that.data.all_datas[that.data.currentPageLength + i];
        }

        that.data.currentPageLength = that.data.goods_datas.length;
        setTimeout(function () {
          that.setData({
            has_more: false,
            goods_datas: that.data.goods_datas
          })
        }, 1300)
      }
    } else {
      // 数据用完了
      that.reqGoodsInfo();
    }



  }

})