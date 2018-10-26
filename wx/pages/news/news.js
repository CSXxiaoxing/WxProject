
import {host, util, onfire, common} from '../../utils/server';

var refreshControl = false;
var that = this;
var refreshId = -1;
var refreshEvent = onfire.on('refreshNew', function (data) {
  refreshControl = true;
  refreshId = data;
})


Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    selId: -1,
    newTitleList: [],
    control: false,

  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},

  /**
   * 生命周期函数--监听页面加载 
   */
  onLoad: function (options) {
    this.setData({
      currentPageUrl: common.getPageRouteUrl(options)
    })
    this.reqService();
    
    console.log(getCurrentPages())
  },
  //标题栏切换
  changeTab: function (e) {
    var selId = e.currentTarget.dataset.id;
    this.setData({
      control:false,
      selId: selId,
    })
    this.reqNewData();
  },
  reqService: function () {
    // /news/type.html
    var url = host.host + '/news/type.html';
    var that = this;
    util.showLoading('加载中...')
    util.httpsGet(url, function (data) {
      wx.hideLoading();
      data = data.data;
      var newTitleList = [];
      for (var i = 0; i < data.newsType.length; i++) {
        if (i == 0) {
          that.setData({
            selId: data.newsType[i].id,
          })
        }
        var newtitle = {
          title: data.newsType[i].name,
          id: data.newsType[i].id,
          pageIndex: 1,
          newList: []
        }
        newTitleList.push(newtitle)
      }
      that.setData({
        newTitleList: newTitleList
      })
      that.reqNewData();
    })


  },
  reqNewData: function () {
    if (this.data.selId == -1) {
      return;
    }
    //检索是否第一次
    var flag = true;
    var index = -1;
  
    for (var i = 0; i < this.data.newTitleList.length; i++) {
      if (this.data.newTitleList[i].id == this.data.selId) {
        if (this.data.newTitleList[i].newList.length != 0) {

          flag = false;
        } else {
          index = i;
        }
      }
    }
    if (flag) {
      var url = host.host + '/news/list.html?typeId=' + this.data.selId;
      var that = this;
      util.showLoading('加载中')
      util.httpsGet(url, function (data) {
        wx.hideLoading();
        that.data.newTitleList[index].newList = data.data.news;        
        that.setData({
          newTitleList: that.data.newTitleList,
          config: data.data.config.image_resource,
        })
        that.checkLengenth();
      },function(){},'请求新闻数据')
    } 
  },
  //检测当前新闻类目是否有新闻
  checkLengenth:function(){
    var flag = true;
    for (var i = 0; i < this.data.newTitleList.length;i++){
      if (this.data.newTitleList[i].id == this.data.selId){
        if (this.data.newTitleList[i].newList.length>0){
          flag = false;
            }
        }
    }
    this.setData({
      control:flag
    })
    
  },
  //刷新新闻数据
  reFreshData: function () {
    if (refreshId == -1) {
      return;
    }
    var url = host.host + '/news/details/' + refreshId + '.html?isAdd=' + false;
    var that = this;
    util.showLoading('加载中..')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      for (var x = 0; x < that.data.newTitleList.length; x++) {
        for (var y = 0; y < that.data.newTitleList[x].newList.length; y++) {
          if (that.data.newTitleList[x].newList[y].id == refreshId) {
            that.data.newTitleList[x].newList[y] = data.data.news;
            that.setData({
              newTitleList: that.data.newTitleList
            })
            refreshId = -1;
          }
        }
      } 
    }, function () { }, '刷新對應新聞', this.data.currentPageUrl)
  },
  //请求分页数据
  reqMore: function () {
    if (this.data.newTitleList.length == 0) {
      return;
    }
    var pageIndex = -1;
    var index = -1;
    var that = this;
    for (var i = 0; i < this.data.newTitleList.length; i++) {
      if (this.data.newTitleList[i].id == this.data.selId) {
        pageIndex = this.data.newTitleList[i].pageIndex,
          index = i;
      }
    }
    //检索当前的下标
    var url = host.host + '/news/list.html?typeId=' + this.data.selId + '&pageIndex=' + (++pageIndex);
    util.showLoading('加载中..')
    util.httpsGet(url, function (data) {
      wx.hideLoading();
      if (data.data.news.length != 0) {
        that.data.newTitleList[index].newList = that.data.newTitleList[index].newList.concat(data.data.news);
        that.data.newTitleList[index].pageIndex = pageIndex
        that.setData({
          newTitleList: that.data.newTitleList,
        })
      }
    })
  },

  jumpToNewDetail: function (e) {
    var newId = e.currentTarget.dataset.newid;
    var url = '/pages/newDetail/newDetail?newId=' + newId + '&fromIndex=' + 2;
    util.navigateTo(url)
  },
  onShow: function () {
    this.reFreshData();
  },
  onUnload: function () {
    onfire.un('refreshNew');
    refreshId = -1;//还原变量，避免缓存
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
      path: '/pages/news/news'
    }
  },
})