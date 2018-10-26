// pages/eval_detail/eval_detail.js
import {host,util,common,pageStaticData,cl} from "../../../utils/server";

Page({
    data: {
        tColor: host.tColor,
        num: '',
        name: '',
        cardName: '',
        // new页面移植，待合并优化
        card: {
            num: '',      numType: 1,
            name: '',     nameType: 1,
            cardName: '', cardNameType: 1,   // 开户行名字
        },
        mark: false,
        btnType: false,
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
    onLoad: function (options) {
        console.log(options)
        this.setData({
            num: options.num.replace(/,/g,' '),
            name: options.name,
            cardName: options.cardName,
        })
        this.save()
    },
    onShow: function(){

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
    iptNum: function(e){
        var val = e.detail.value;
        var str = this.data.card;
        var strK = str.num.replace(/(.{4})/g,'$1 ');
        if(this.data.num=='' && val.length>0){
            val = val.slice(-1);
        }
        var valEnd = val.replace(/\s*/g, '');   // 去空格
        if(val.length<strK.length && strK.slice(-1)==' '){  // 删除
            valEnd = valEnd.slice(0,-1);
        }
        if (valEnd != '' && /^[0-9]*$/.test(valEnd)) {
            str.num = valEnd;
            str.numType = 1;
            this.setData({ card: str })
        }
        this.setData({ num: str.num.replace(/(.{4})/g,'$1 ') })
        return str.num.replace(/(.{4})/g,'$1 ')
    },
    iptNumEnd: function(){
        var str = this.data.card;
        if(!/^([1-9]{1})(\d{14,18})$/.test(str.num) && str.num.length>0){
            str.numType = 0;
            this.setData({ card: str })
            this.save()
        }
    },
    iptName: function(val){
        var val = val.detail.value;
        var str = this.data.card;
        if(this.data.name=='' && val.length>0){
            val = val.slice(-1);
        }
        str.name = val;
        str.nameType = 1;
        this.setData({ name: val, card: str })
        this.save()
        return str.name;
    },
    iptCardName: function(val){
        var val = val.detail.value;
        var str = this.data.card;
        if(this.data.cardName=='' && val.length>0){
            val = val.slice(-1);
        }
        str.cardName = val;
        str.cardNameType = 1;
        this.setData({ cardName: val, card: str })
        this.save()
        return str.cardName;
    },
    clear: function(e){
        var val = this.data.card;
        var ele = e.currentTarget.dataset.name;
        val[ele] = '';
        val[ele+'Type'] = 1;
        this.setData({
            card: val,
            [ele+'T']: '',
        })
        this.save()
    }, 
    motype: function(e){ // mark
        var that = this;
        if(e && e.currentTarget.dataset.name=='Y') {
            // 发起请求
            var url = `${host.host}/distribution/bank`;
            util.httpsPostWithId( url, 
                {
                    openName: that.data.name,
                    openBank: that.data.cardName,
                    openCard: that.data.num.replace(/\s+/g, ""),
                }, res=>{
                    if (res.success) {
                        cl.Tip(1,{ type: 'Toast', title: '修改成功' ,icon: 'none'})
                    }
                }
            )
        }
        this.setData({
            mark: false,
        })
    },
    save: function(e){
        var ka = this.data.card;
        this.data.btnType = false;
        switch (true) {
            case ka.numType==0||this.data.num=='' : 
            break;
            case ka.nameType==0||this.data.name=='' :
            break;
            case ka.cardNameType==0||this.data.cardName=='' :
            break;
            default:
                this.setData({
                    btnType : true,
                })
        }
        if(e){
            this.setData({ // 拉起确认
                mark: true,
            })
        }
    },


})