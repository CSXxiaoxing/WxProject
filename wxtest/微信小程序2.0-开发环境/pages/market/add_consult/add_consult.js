import {host, util, common, dict} from '../../../utils/server';

Page({
  data: {
    tColor: host.tColor,
    pageIndex: 1,
    askList: [],
    control: false,
    reqMoreControl: true,
    askContent:''
  },
    // 全局注入
    onToolFun:function(e){
        this.setData({
            tool: e.detail
        })
    },
    onLoad: function (options) {
        this.setData({
        productId: options.productId
        })
        console.log(options)
        this.reqService();
    },


  reqService: function () {
    var that = this;
    var url = host.host + '/product/ask/' + this.data.productId + '.html?type=0&pageIndex=1';
    util.httpsGetWithId(url, function (data) {
      var config = data.data.config.image_resource;
      var askList = [];
      data.data.askList.forEach((item)=>{
        var askItem = {
          askUserImg: item.profilePhoto,
          name: item.nickname,   //咨询用户姓名
          content: item.askContent,//咨询内容
          time: item.createTime, //咨询时间
          replyName: item.sellerName,//回复名称
          replyTime: item.replyTime,//回复时间
          replyContent: item.replyContent,//回复内容
          sellerLogo: config + item.sellerLogo,
          state: item.state
        }
        askList.push(askItem)
      })

      that.setData({
        askList: askList,
        control: true
      })
    }, function () {
      that.setData({
        control: true
      })
    }, '加載商品咨詢')
  },
  // 提交咨询内容
  Askquest: function (e) {

    var content = this.data.askContent;
    if (common.checkStr(content)) {
      if (content == '') {
        util.showMsg('咨询内容不能为空!')
        return;
      } else if (content.length < 3) {
        util.showMsg('咨询内容长度过短!')
        return;
      }
      var url = host.host + '/member/savequestion.html';
      var data = {
        productId: this.data.productId,
        askContent: content
      }
      util.showLoading('加载中')
      util.httpsPostWithId(url, data, function (data) {
        wx.hideLoading();
        this.setData({
          askContent: '',
        })
        if (data.success) {
          util.showMsg('咨询成功!')
        } else {
          util.showMsg(data.message)
        }
      }.bind(this),function(){},'提交咨询内容')
    } else {
      util.showMsg('提问内容存在特殊符号(不支持表情)')
    }

  },
  inputEvent: function (e) {
    console.log(e)
    this.setData({
      askContent:e.detail.value
    })
  },
  reqMore: function () {
    this.setData({
      reqMoreControl: false
    })
    var that = this;
    var url = host.host + '/product/ask/' + this.data.productId + '.html?type=0&pageIndex=' + (this.data.pageIndex + 1);
    util.httpsGetWithId(url, function (data) {
      var config = data.data.config.image_resource;
      var askList = [];
      for (var i = 0; i < data.data.askList.length; i++) {
        var askItem = {
          askUserImg: data.data.askList[i].profilePhoto,
          name: data.data.askList[i].nickname,   //咨询用户姓名
          content: data.data.askList[i].askContent,//咨询内容
          time: data.data.askList[i].createTime, //咨询时间
          replyName: data.data.askList[i].sellerName,//回复名称
          replyTime: data.data.askList[i].replyTime,//回复时间
          replyContent: data.data.askList[i].replyContent,//回复内容
          sellerLogo: config + data.data.askList[i].sellerLogo,
          state: data.data.askList[i].state,
        }
        askList.push(askItem)
      }
      that.data.askList.concat(askList)
      that.setData({
        askList: askList,
        pageIndex: that.data.pageIndex + 1,
        reqMoreControl: true
      })
    }, function () {
      this.setData({
        reqMoreControl: true
      })
    }, '请求咨询更多数据')
  },

  onReachBottom: function () {
    if (this.data.reqMoreControl) {

      if (this.data.askList.length >= 10) {

        this.reqMore();
      }
    }


  }

})