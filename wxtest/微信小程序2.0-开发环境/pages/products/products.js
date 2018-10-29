
import {host, util} from '../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
  data: {
      pageIndex:1,
      lock:true,
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.reqService();
  },
  reqService:function(){
    var that = this;
    var url = host.host + '/showProduct/list';
    util.showLoading('加载中..'); 
    util.httpsGet(url,function(data){
        wx.hideLoading();
        var config = data.data.config.image_resource;
        var allData={
          banner:[],
          products:[],
          recommonds:[]
        }
        for (var i = 0;i<data.data.banner.length;i++){
          allData.banner.push(config + data.data.banner[i].image)
        }
        for (i = 0; i < data.data.recommendProduct.length;i++){
          var product ={
            id: data.data.recommendProduct[i].id,
            name: data.data.recommendProduct[i].name,
            image: config + data.data.recommendProduct[i].smallImage,
          }
          allData.recommonds.push(product);
        }
        for (i = 0; i < data.data.showProduct.length;i++){
          var product = {
            id: data.data.showProduct[i].id,
            name: data.data.showProduct[i].name,
            image: config + data.data.showProduct[i].smallImage,
          }
          allData.products.push(product);
        }
        that.setData({
          data: allData
        })
    },function(){},'请求产品数据')
  },  
  jumpToProductDetail:function(e){
      var productId = e.currentTarget.dataset.productid;
      var url = "/pages/productDetail/productDetail?productId="+productId;
      util.navigateTo(url)
      
  },
  reqMore: function () {
    if (this.data.lock){
      this.setData({
        lock:false
      })
    var url = host.host + '/showProduct/list?pageIndex=' + (this.data.pageIndex+1);
    var that = this;
    util.showLoading('加载中..');
    util.httpsGet(url, function (data) {
      wx.hideLoading();
      var config = data.data.config.image_resource;
      if (data.data.showProduct.length!=0){
        for (var i = 0; i < data.data.showProduct.length; i++) {
          var product = {
            id: data.data.showProduct[i].id,
            name: data.data.showProduct[i].name,
            image: config + data.data.showProduct[i].smallImage,
          }
          that.data.data.products.push(product);
        }
       
        that.setData({
          data: that.data.data,
          pageIndex: that.data.pageIndex + 1,
          lock: true
        })
      
        
      }
      
    },function(){

      this.setData({
        lock: true
      })
    },'请求更多产品')
    }
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.reqMore();
  },

  /**
* 用户点击右上角分享
*/
  onShareAppMessage: function () {
    var that = this;
    return {
      title: host.companyName,
      path: '/pages/products/products'
    }
  },
})