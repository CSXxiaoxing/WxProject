
import {host,util,common,pageStaticData,cl} from "../../../utils/server";

Page({
    data: {
        tColor: host.tColor,
        text: [
            '1. 单次提现额度不得低于 100 元',
            '2. 提现后 3 ~ 7 天内到账',
            '3. 每个用户同时只能发起 1 笔提现订单',
            '4. 必须先设置提现银行卡'
        ]
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
    onLoad: function (options) {
        
    },
    onShow: function(){},
    onReady(){
        wx.setNavigationBarColor({  // 如需固定颜色启用
            frontColor: '#ffffff',
            backgroundColor: '#228af2',
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