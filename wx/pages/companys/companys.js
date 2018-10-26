
import {host, util} from '../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    com_data:[]
  },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
  onLoad(){
  },

  /**
   * 生命周期函数--监听页面加载
   */
  reqSellerList:function(){



    var url = host.host + '/sellerShow';

    util.showLoading('加载中')

    util.httpsGet(url,function(data){

      wx.hideLoading();

      var data = data.data;

      var config = data.config.image_resource

      if (data.sellerApplys.length!=0){


        data.sellerApplys.forEach((child)=>{

          var item = {

            id: child.id,

            name: child.company,

            add: child.companyAdd,

            img: config + child.sellerImage
          }
          this.data.com_data.push(item) ;
        })
       
        this.setData({
          com_data: this.data.com_data
        })
      }
    
    }.bind(this),function(){
      
    },'请求服务商数据')
    
  },
  jumpToShop:function(e){
    var shopId = e.currentTarget.dataset.shopid;
    var url = '/pages/shop_detail/shop_detail?shopId=' + shopId
    wx.navigateTo({
      url: url,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.reqSellerList()
  },
  onShareAppMessage: function () {
    // 用户点击右上角分享
    return {
      title: host.companyName, // 分享标题
      path: '/pages/companys/companys' // 分享路径
    }
  }

})