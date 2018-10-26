import {host,util,common,pageStaticData,cl} from "../../../utils/server";

Page({
    data: {
        tColor: host.tColor,
        message: '服务异常，请联系系统管理员。',
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
    onLoad: function (options) {
        this.setData({
            message: options.message
        })
    },
    onShow: function(){
        
    },
    onReady(){
        wx.setNavigationBarColor({  // 如需固定颜色启用
            frontColor: '#000000',
            backgroundColor: '',
            animation: {
                duration: 0,
                timingFunc: 'easeIn'
            }
        })
    },
    preDetailImage: function (e) {

    },
    reqService: function () {},

})