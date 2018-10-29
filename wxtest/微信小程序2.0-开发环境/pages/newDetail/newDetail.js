
import {host, util, common, onfire, cl} from '../../utils/server';

Page({
    /**
    * 页面的初始数据
    */
    data: {
        newsId: -1,
        lock: true,
        tool: void 0,
        tColor: host.tColor,
        tColorHelp: host.tColorHelp, 
    },
    // 全局注入
    onToolFun:function(e){
        this.setData({
            tool: e.detail
        })
    },
    
    /** 
    * 生命周期函数--监听页面加载
    */
    onLoad: function (options) {
        cl.Rpage = options;
        console.log(options)

        this.setData({
            newId: options.newId || void 0,
            fromIndex: options.fromIndex || void 0,
            currentPageUrl: common.getPageRouteUrl(options),
        })
        this.reqService();
    },
    onShow: function(){},
    // ====================
    reqService: function () {
        var url = host.host + '/news/details/' + this.data.newId + '.html';
        var that = this;
        
        console.log(url)
        cl.Load('加载中')
        util.httpsGetWithId(url, function (data) {
            cl.Load(null)
            console.log(data)
            that.setData({
                lock:true,
                data: pic_path(data.data),
                passage: common.parsePassage(data.data.news.content, data.data.config.image_resource),
                newsId: data.data.news.id
            })
            if (that.data.fromIndex == 1) {
                onfire.fire('refresh', that.data.newId)
            }
            if (that.data.fromIndex == 2) {
                onfire.fire('refreshNew', that.data.newId);
            }
        }, function () { }, "新闻详情", this.data.currentPageUrl)

        // 防止出现x//x导致路径错误
        function pic_path(data){
            var httpImg = data.config.image_resource;
            var urlImg = data.news.image;
            if(urlImg.charAt(0)=='/' && httpImg.lastIndexOf('/') == httpImg.length-1){
                data.news.image = data.news.image.substr(1)
            }
            return data
        }

    },
    // 请求收藏
    reqCol: function () {
        if (this.data.lock && this.data.data.collected == 'false'){

            this.setData({
                lock:false
            })
            if (this.data.newsId == -1) {
                return;
            }
            var url = host.host + '/member/docollectnews.html?newsId=' + this.data.newsId;
            var that = this;
            // cl.Load('加载中..')
            util.httpsGetWithId(url, function (data) {
                cl.Load(null)
                if (data.success) { 
                    that.refreshData()
                }
            },function(){
        
            },'请求收藏')
        }
    },
    //预览图片
    previewImage: function (e) {
        util.previewImage(e);
    },
  //请求取消收藏
  reqCancel: function () {

    if (this.data.lock && this.data.data.collected == 'true'){
 
      this.setData({
        lock: false
      })
    if (this.data.newsId == -1) {
      return;

    }
    var url = host.host + '/member/cancelcollectnews.html?newsId=' + this.data.newsId;
    var that = this;
    // cl.Load('加载中..')
    util.httpsGetWithId(url, function (data) {
        cl.Load(null)
      
      if (data.success) {
       
        that.refreshData()
        
      }
    },function(){

      },'请求取消收藏')
    }
  },
refreshData:function(){
  var url = host.host + '/news/details/' + this.data.newId + '.html?isAdd=' + false;
  var that = this;
//   cl.Load('加载中..')
  util.httpsGetWithId(url,function(data){
    cl.Load(null)
      that.setData({
        data:data.data,
        lock:true
      })
  },function(){},'刷新当前新闻')
},
  /**
* 用户点击右上角分享
*/
  onShareAppMessage: function () {
    var that = this;
    return {
      title: host.companyName,
      path: this.data.currentPageUrl,
    }
  },
})