
import {host, util} from '../../../utils/server';

Page({

  data: {
    tColor: host.tColor,
    pageIndex: 1,
    commentInfos:[],
    control:false,
    bottom_desc: '上拉加载更多数据'
  },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },

  onLoad: function (options) {

    var orderId = options.id;
    this.setData({
      orderId: orderId
    })
    var url = host.host + '/member/question.html';
    util.showLoading('加载中');
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var imgUrl = data.data.config.image_resource
      var commentInfos = data.data.askList;
      this.setData({
        url: url,
        imgUrl: imgUrl,
        commentInfos: commentInfos,
        control:true
      })
    }.bind(this))
  },
  reqMore: function () {
    var url = host.host + '/member/morequestion.html?pageIndex=' + (this.data.pageIndex + 1);
    util.showLoading('加载中');
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading()
      if (data.data.askList != 0) {
        var imgUrl = data.data.config.image_resource
        var commentInfos = data.data.askList;
        this.setData({
          pageIndex: pageIndex + 1,
          commentInfos: this.data.commentInfos.concat(commentInfos),
          has_more: false,
        })
      } else {
     
        util.showToast('已无更多数据');
      }
    }.bind(this),function(){},'请求更多咨询')
  },
  toComment: function (e) {//我的咨询
    var commentIndex = e.currentTarget.dataset.index
    this.setData({
      cFlag: commentIndex
    })
  }, onReachBottom: function () {



    this.setData({

      has_more: true

    })
    this.reqMore()


  },

})