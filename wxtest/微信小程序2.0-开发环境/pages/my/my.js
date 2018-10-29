import {host,util,pageStaticData,cl, dict, storage} from "../../utils/server";
const TAG = storage.tabBar;

Page({
    data: {
        template: 0,

        mark: false,
        markType: 1,    // 1提示 2指定商品 3协议

        spreads_items_datas: pageStaticData.spreads_items_datas,
        integral: 0,
        wait_pay: 0,    // 待付款
        wait_get: 0,    // 待收货
        reqCtr: true,
        urls:[],
        routs: {
            '1' : '/pages/my_coupon/my_coupon',
            '2' : dict.pages.my_collection,
            '3' : dict.pages.my_history,
            '4' : dict.pages.my_address,
            '5' : dict.pages.consult,          // 咨询记录
            '6' : dict.pages.evaluate,
            '7' : dict.pages.my_backGoods,
            '8' : dict.pages.change_goods,
            '9' : '/pages/my_indent/my_indent?typeId=1',    // 待付款
            '10': '/pages/my_indent/my_indent?typeId=3',    // 待发货
            '11': '/pages/my_indent/my_indent?typeId=4',    // 待收货
            '12': '/pages/my_indent/my_indent?typeId=0',
            '13': dict.pages.myPintuan,
            '14': '/pages/myBargain/myBargain?',
            '15': '/pages/myReserve/myReserve',
            '16': '/pages/fx/fx_my/fx_my',                  // 微分销
            '17': '/pages/fx/fx_apply/fx_apply',            // 微分销-申请
        },
    },
    onToolFun:function(e){
        console.log(e)
        this.setData({ 
            tool: e.detail,
        })
    },
    onLoad: function () {
        var pages = getCurrentPages();
        this.setData({
            pageUrl: '/' + pages[pages.length - 1].route,
        })
        this.init();
        util.httpsGetWithId(host.host+'/distribution', data=>{
            this.setData({
                fx: data.data
            }) 
        })
    },
    init(){
        var that = this;
        util.checkSsId(function () {
            this.reqService();
            util.getUserInfo(function (res) {
                console.log(res)
                this.setData({
                    userInfo: res,
                    urls: that.data.urls
                })
                wx.setStorage({
                    key: "cl-user-data",
                    data: res
                })
            }.bind(this))
        }.bind(this))
    },
    onShow(){
        this.setData({
            template: TAG('T_My'),
            tColor: TAG('T_Color'),
            tColorHelp: TAG('T_CHelp'),
        })
        
        util.httpsGetWithId(host.host+'/distribution', data=>{
            this.setData({
                fx: data.data
            })
        })
        
        var that = this;
        util.getUserInfo(function (res) {
            this.setData({
                userInfo: res,
                urls: that.data.urls
            })
            wx.setStorage({
                key: "cl-user-data",
                data: res
            })
        }.bind(this))
        wx.getStorage({//获取本地缓存      
            key:"wait_get",
            success:function(res){
                that.setData({
                    wait_get: res.data
                })
            },
            fail:function(){
            }
        })
        wx.getStorage({//获取本地缓存      
            key:"wait_integral",
            success:function(res){
                that.setData({
                    integral: res.data
                })
            },
            fail:function(){
                that.init()
            }
        })
        wx.getStorage({//获取本地缓存      
            key:"wait_pay",
            success:function(res){
                that.setData({
                    wait_pay: res.data
                })
            },
            fail:function(){
            }
        })
    },
    // 分享
    onShareAppMessage: function () {
        return {
            title: host.companyName,     // 分享标题
            path: dict.pages.index,    // 分享路径
        }
    },
    // 下拉刷新
    onPullDownRefresh: function(){
        util.httpsGetWithId(host.host+'/distribution', data=>{
            this.setData({
                fx: data.data
            })
        })
        var pages = getCurrentPages();
        this.setData({
            pageUrl: '/' + pages[pages.length - 1].route,
        })
        // 待整合
        var that = this;
        util.checkSsId(function () {
            this.reqService();
            util.getUserInfo(function (res) {
                console.log(res)
                this.setData({
                userInfo: res,
                urls: that.data.urls
                })
            }.bind(this))
        }.bind(this))
        cl.PullDownRefresh(2000, 'dark')
    },
    // 服务/会员中心的显示隐藏
    showORhide: function(e){
        var idx = e.currentTarget.dataset['id'];
        var show = this.data.spreads_items_datas;
        show[idx].hideOrShow_Control = !show[idx].hideOrShow_Control;
        this.setData({
            spreads_items_datas: show,
        })
    },
    // 展示大图
    preImage: function(e){
        let imgurl = e.currentTarget.dataset.imgurl;
        cl.preview(imgurl)
    },
    // 跳转
    jumpToOtherPage:function(e){
        var routId = e.currentTarget.dataset.routid;
        var routs = this.data.routs;
        var fx = this.data.fx;
        if(routId==16 && !fx.isDistr){  // 点击分销中心
            if(fx.applymsg){
                wx.showModal({
                    title: '提示',
                    content: fx.applymsg,
                    showCancel: true,
                    success: function(res){},
                    fail: function(res){}
                })
            }
            else if(fx.isOk){
                util.navigateTo(routs[17])
            }
            else { this.setData({mark: true}) }
        } else {
            util.navigateTo(routs[routId])
        }
    },

  // 数据请求
  reqService: function () {
    var that = this;
    if (that.data.reqCtr) {
    // if (true) {
        // 请求待付款
        var url1 = host.host + '/member/order.html?orderState=1';

        // 请求待收货
        var url2 = host.host + '/member/order.html?orderState=4';

        // 请求头像，积分
        var url3 = host.host + '/member/index.html';
        that.data.reqCtr = false;
        // util.showLoading('加载中...')
        util.httpsGetWithId(url3, function (data) {
          var data = data.data;
            wx.setStorage({
                key: "wait_integral",
                data: data.member.integral
            })
            that.setData({
                integral: data.member.integral
            })

          // 请求代付款数据
          util.httpsGetWithId(url1, function (data) {

            if (data.data != null) {
                wx.setStorage({
                    key: "wait_pay",
                    data: data.data.ordersCount
                })
              that.setData({

                wait_pay: data.data.ordersCount

              })
            }

            util.httpsGetWithId(url2, function (data) {

              wx.hideLoading();

              if (data.data != null) {
                wx.setStorage({
                    key: "wait_get",
                    data: data.data.ordersCount
                })
                that.setData({
                  wait_get: data.data.ordersCount
                })
              }
              that.data.reqCtr = true
            }, function () { }, '', that.data.pageUrl)
          }, function () {
            that.data.reqCtr = true
            }, '', that.data.pageUrl)
        }, function () {
          that.data.reqCtr = true
          }, '', that.data.pageUrl)
    }
  },
    motype: function(e){ // mark
        if(e && e.currentTarget.dataset.name=='Y') {
            // 发起请求
        }
        this.setData({
            mark: false,
        })
    },
    mark: function(e){ // mark
        var markType = 1;
        if(e && e.currentTarget.dataset.name=='xy') {
            markType = 3
        }
        this.setData({
            mark: true,
            markType: markType,
        })
    },
    
})