
import {host, util} from '../../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    avg_grade:1,
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // https://test.wechat.cangluxmt.com/wechat/member/addcommentdetail.html?orderSn=18013115463392876428&productId=124582&productGoodsId=133839&ordersProductId=1967&sessionId=08338E037E08DCBD1A501DCEC111B0F2&agentId=279 http://test.image.cangluxmt.com/jcshopimage//279/images/seller/70/little/784f3b0a-9474-4328-9834-b352e098efe2.jpg LV INITIALES 双面腰带
    this.setData({
      goodsImg: options.goodsImg,
      goodsName: options.goodsName,
      orderSn: options.orderSn,
      productId: options.productId,
      productGoodsId: options.productGoodsId,
      ordersProductId: options.ordersProductId
    })
    this.reqService();

  },
  preDetailImage: function (e) {
    var that = this;
    var imgUrl = e.currentTarget.dataset.imgurl;
    wx.previewImage({
      current: imgUrl,
      urls: this.data.comment.images,
    })
  },
  reqService: function () {
    var url = host.host + '/member/addcommentdetail.html?orderSn=' + this.data.orderSn + '&productId=' + this.data.productId + '&productGoodsId=' + this.data.productGoodsId + '&ordersProductId=' + this.data.ordersProductId;
    util.httpsGetWithId(url, function (data) {
      let comment = data.data.comment;
      if (comment.images != null){
        comment.images = comment.images.split(',');
      }else{
        comment.images = []
      }
      let avg_grade = parseInt((comment.grade + comment.description + comment.serviceAttitude + comment.productSpeed)/4*10)/10 ;
        this.setData({
          comment: comment,
          avg_grade: avg_grade,
          config: data.data.config
        })
    }.bind(this), function () { }, '请求评价商品数据')
  },

})