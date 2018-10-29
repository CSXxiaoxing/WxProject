// pages/eval_detail/eval_detail.js
import {host,util,common,pageStaticData,cl} from "../../../utils/server";

Page({
    data: {
        tColor: host.tColor,
        card_number: ['2233', '4466', '7788', '9900'],
        data: [],
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
    onLoad: function (options) {
        
    },
    onShow: function(){
        var url = host.host+'/distribution/bank'
        util.httpsGetWithId( url, res=>{
            console.log(res)
            var data = res.data;
            var jsonCard = res.data.openCard.replace(/(.{4})/g,'$1 ');
            var card = jsonCard.split(' ');
            this.setData({
                card_number: card,
                data: data,
            })
        })
    },
    onReady(){
        wx.setNavigationBarColor({  // 如需固定颜色启用
            frontColor: '#000000',
            backgroundColor: '#ffffff',
            animation: {
                duration: 0,
                timingFunc: 'easeIn'
            }
        })
    },
    preDetailImage: function (e) {

    },
    reqService: function () {},
    nav: function(e){
        var data = e.currentTarget.dataset;
        var type = data.type || '';
        if ( type == 'add' ) {
            cl.Router(0,{url:'/pages/fx/fx_newCard/fx_newCard'})
        } else if ( type == 'set' ) {
            cl.Router(0,{url:`/pages/fx/fx_setCard/fx_setCard?name=${data.user}&cardName=${data.cardName}&num=${data.num}`})
        }
    },

})