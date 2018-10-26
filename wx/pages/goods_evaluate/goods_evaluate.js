
import {host, util} from '../../utils/server';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    control:false,
    reqMoreControl:true,
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      productId: options.productId
    })
    this.reqService();
  },
  reqService:function(){
    var url = host.host + '/product/comment/' + this.data.productId+'.html?pageIndex=1';
    util.httpsGet(url,function(data){
      if (data.data.allCommentList instanceof Array){
        data.data.allCommentList.forEach((comment, i) => {
          data.data.allCommentList[i].createTime = comment.createTime.split(' ')[0];
          if (data.data.allCommentList[i].images != null) {
            data.data.allCommentList[i].images = comment.images.split(',');
            console.log(data.data.allCommentList[i].images)
          }
        })
      }else{
        data.data.allCommentList = [];
      }
    
        this.setData({
          allCommentList: data.data.allCommentList,
          control:true
        })
    }.bind(this),function(){
        this.setData({
          control: true
        })
    }.bind(this),'请求评论数据')
  },
  preDetailImage:function(e){
    let imgUrl = e.currentTarget.dataset.imgurl
    let imgs = e.currentTarget.dataset.imgs
    wx.previewImage({
      current: imgUrl,
      urls: imgs,
    })
  },
  reqMore:function(){
    var url = host.host + '/product/comment/' + this.data.productId + '.html?pageIndex=' + (this.data.pageIndex+1);
    this.setData({
      reqMoreControl: false
    })
    util.httpsGet(url, function (data) {
      if (data.data.allCommentList instanceof Array) {
        data.data.allCommentList.forEach((comment, i) => {
          data.data.allCommentList[i].createTime = comment.createTime.split(' ')[0];
          if (data.data.allCommentList[i].images!=null) {
            data.data.allCommentList[i].images = comment.images.split(',');
          }
        })
      } else {
        data.data.allCommentList = [];
      }
      if (data.data.allCommentList.length>0){
        this.setData({
          allCommentList: this.data.allCommentList.concat(data.data.allCommentList),
        })
      }else{
        util.showToast('已加载全部数据')
      }
      this.setData({
        reqMoreControl: true,
        pageIndex: this.data.pageIndex+1
      })
    }.bind(this), function () {
      this.setData({
        reqMoreControl: true
      })
    }.bind(this), '请求评论数据')
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.reqMoreControl){
      if (this.data.allCommentList.length>=10){
        this.reqMore();
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})