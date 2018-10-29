
import {host, util, common} from '../../utils/server';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    actId: 1,
    hideOrShow: true,
    titleId:'',
    pageIndex:1,

  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  // 跳转到阶梯详情
  jumpToJietiDetail:function(e){
    util.navigateTo('/pages/jieti_detail/jieti_detail?goodId=' + e.currentTarget.dataset.goodid + '&productId=' + e.currentTarget.dataset.productid + '&goodState=' + this.data.actId)
  },
  // 选择分类
  sel_actType: function (e) {
    var actId = e.currentTarget.dataset.actid;
    this.setData({
      actId: actId
    })
    this.reqService();
  },
  // 显示或隐藏标题栏
  hideOrShowType: function () {
    if (this.data.hideOrShow) {
      this.data.hideOrShow = false;
    } else {
      this.data.hideOrShow = true;
    }
    this.setData({
      hideOrShow: this.data.hideOrShow
    })
  },
  reqService: function () {
      var that = this;
    var url = '';
    if (this.data.actId == 0) {
      url = host.host + '/bidding-end.html';
    } else if(this.data.actId == 1) {
      url = host.host + '/bidding-sale.html';
    } else if (this.data.actId == 2){
      url = host.host + '/bidding-start.html';
    }
    util.showLoading('加载中...')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource;
        that.data._config = config

      var jieti_data = {
        goods: [],
        titles: [],
        hideTitles: [],
      }
      // 标题栏
      if (data.actBiddingTypes.length < 5) {
        data.actBiddingTypes.forEach((typ)=>{
          var title = {
            id: typ.id,
            name: typ.name,
            selected: false
          }
          jieti_data.titles.push(title)
        })
        
      } else {
        data.actBiddingTypes.forEach((typ)=>{
          var title = {
            id: typ.id,
            name: typ.name,
            selected: false
          }
          if (i < 5) {
            jieti_data.titles.push(title);//当标题栏数组大于5时，加入到隐藏数组
          } else {
            jieti_data.hideTitles.push(title)
          }
        })
        
      }
      // 商品列表
      data.actBiddings.forEach((item)=>{
        var good = {
          id: item.id,//商品货品id
          productId: item.productId,//商品id
          name: item.productName,//商品名字
          img: config + item.image,//商品图片
          saleCount: item.saleNum,//商品出售数量
          firstPrice: common.toDecimal(item.firstPrice),//商品首付款
          lowestPrice: common.toDecimal(item.lowestPrice),//商品最低款
        }
        jieti_data.goods.push(good)
      })
     
      this.setData({
        jieti_data: jieti_data,
        titleId:'',
        pageIndex: 1
      })

    }.bind(this),function(){
      wx.hideLoading();
      }, '階梯競價數據', this.data.currentPageUrl)
  },
  // 标题栏选择
  sel_title: function (e) {
    var titleId = e.currentTarget.dataset.titleid;
    this.data.jieti_data.titles.forEach((title,i)=>{
      if (titleId == title.id) {
        this.data.jieti_data.titles[i].selected = true;
      } else {
        this.data.jieti_data.titles[i].selected = false;
      }
    })
    this.data.jieti_data.hideTitles.forEach((title,i)=>{
      if (titleId == title.id) {
        this.data.jieti_data.hideTitles[i].selected = true;
      } else {
        this.data.jieti_data.hideTitles[i].selected = false;
      }
    })
    this.setData({
      jieti_data: this.data.jieti_data,
      titleId: titleId
    })
    this.reqClass()
  },
  // 筛选分类请求
  reqClass: function (){

    var url = "";
    if (this.data.actId == 0) {
      url = host.host + '/bidding-end.html?type=' + this.data.titleId;
    } else if (this.data.actId == 1) {
      url = host.host + '/bidding-sale.html?type=' + this.data.titleId;
    } else if (this.data.actId == 2) {
      url = host.host + '/bidding-start.html?type=' + this.data.titleId;
    }
    util.showLoading('加载中...')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource;
      var goods = [];
      // 商品列表
      data.actBiddings.forEach((item)=>{
        var good = {
          id: item.id,//商品货品id
          productId: item.productId,//商品id
          name: item.productName,//商品名字
          img: config + item.image,//商品图片
          saleCount: item.saleNum,//商品出售数量
          firstPrice: common.toDecimal(item.firstPrice),//商品首付款
          lowestPrice: common.toDecimal(item.lowestPrice),//商品最低款
        }
        goods.push(good)
      })
      
      this.data.jieti_data.goods = goods;
      this.setData({
        jieti_data: this.data.jieti_data,
        pageIndex: 1,
      })
    }.bind(this), function () { }, '请求阶梯分类商品列表', this.data.currentPageUrl)
  },
  // 分页请求数据
  reqMore:function(){
    var that = this;
    var reqType;
    if (this.data.actId == 0) {
      reqType= 2
    } else if (this.data.actId == 1) {
      reqType = 1
    } else if (this.data.actId == 2) {
      reqType = 3
    }
    var url = host.host + '/biddingJson.html?page=' + (this.data.pageIndex) + '&type=' + this.data.titleId + '&biddingfront=' + reqType;
    util.showLoading('加载中..');
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var data = data.data;
      if (data[0]){
        var config = data.config ? data.config['image_resource'] : that.data._config;
        var goods = [];
        // 商品列表
        data = data.actBiddings || data;
        data.forEach((item) => {
          var good = {
            id: item.id,//商品货品id
            productId: item.productId,//商品id
            name: item.productName,//商品名字
            img: config + item.image,//商品图片
            saleCount: item.saleNum,//商品出售数量
            firstPrice: common.toDecimal(item.firstPrice),//商品首付款
            lowestPrice: common.toDecimal(item.lowestPrice),//商品最低款
          }
          goods.push(good)
        })

        this.setData({
          jieti_data: this.data.jieti_data.goods.concat(goods),
        })
      }else{
        util.showToast('已加载全部数据')
        that.data.pageIndex--
      }
      
    }.bind(this),function(){},"请求更多数据")
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      currentPageUrl: common.getPageRouteUrl(options),
    })
    this.reqService();
  },



  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.data.pageIndex++
      this.reqMore();
  },

  onShareAppMessage: function () {
    // 用户点击右上角分享

    return {
      title: host.companyName, // 分享标题
      path: this.data.currentPageUrl // 分享路径
    }
  },
})