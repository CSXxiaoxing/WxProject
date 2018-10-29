// pages/eval_detail/eval_detail.js
import {host, util, cl} from "../../../utils/server";

Page({
    data: {
        tColor: host.tColor,
        fx_cuo: true,
        iptValue: '',
        iptType: 1,// 0小了,1,2大了
        money: 0.00,
        pla: false,
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
    onLoad: function (options) {
        
    },
    onShow: function(){
        var that = this;
        wx.getStorage({
            key: 'allow',
            success(res) {
                that.setData({
                    money: res.data,
                })
            },
            fail() {}
        })
    },
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
    openSuccess: function () {
        wx.navigateTo({
            url: 'msg_success'
        })
    },
    openFail: function () {
        wx.navigateTo({
            url: 'msg_fail'
        })
    },
    reqService: function () {},
    iptMsg: function(e){
        var val = e.detail.value*1,type=1;
        if(e.currentTarget.dataset.ele == 'money'){
            val = this.data.money;
            this.setData({
                pla: val,
            })
        }
        if (val+'' == 'NaN' || val == 0) val = '';
        else if (val>this.data.money) type = 2;
        else if (val < 100) type = 0;
        this.setData({
            iptValue: val,
            iptType: type,
        })
        return val;
    },
    iptFocus(){
        this.setData({
            pla: false,
            iptValue: '',
        })
    },
    submit: function(){
        var url = `${host.host}/distribution/withdraw/apply`;
        util.httpsPostWithId( url, 
            {
                price: this.data.iptValue*1
            }, res=>{
                console.log(res)
            if(res.success){ // 成功-请求
                wx.setStorage({
                    key: 'allow',
                    data: this.data.money*1-this.data.iptValue*1,
                })
                cl.Router(0,{url:'/pages/fx/fx_tiXianYes/fx_tiXianYes'})
            } else { // 失败-请求
                cl.Router(0,{url:'/pages/fx/fx_tiXianNo/fx_tiXianNo?message='+res.message})
            }
        })
    },

})