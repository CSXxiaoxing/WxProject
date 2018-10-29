// pages/eval_detail/eval_detail.js
import {host,util,common,pageStaticData,cl} from "../../../utils/server";

Page({
    data: {
        tColor: host.tColor,
        newShow: false, // 萌新进来的时候显示
        card: {
            num: '',      numType: 1,
            name: '',     nameType: 1,
            cardName: '', cardNameType: 1,   // 开户行名字
        },
        numT: '',
        nameT: '',
        cardNameT: '',
        mark: false,
        btnType: false,
        clear: '',
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
    onLoad: function (options) {
        if(options.new){
            this.setData({newShow:true})
        }
    },
    onShow: function(){},
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
    preDetailImage: function (e) {},
    valValue(val,ele){
        val = val.replace(/\s*/g, '');
        if(this.data.clear==ele){
            val = val.slice(-1);
            this.data.clear = '';
        }
        return val
    },
    iptNum: function(e){

        var val = e.detail.value;
        var ele = e.currentTarget.dataset.ele;

        val = this.valValue(val,ele);
        console.log(val)
        
        var typeVal = val*1;
        if (typeof typeVal == 'number' && typeVal+'' != 'NaN') {
            
            var str = this.data.card;
            
            if(ele){
                str[ele] = val;
                this.setData({ card: str })
            }
            console.log(val, str)

            var strK = str.num.replace(/(.{4})/g,'$1 ');
            // if(this.data.numT=='' && val.length>0){
            //     val = val.slice(-1);
            // }
            var valEnd = val.replace(/\s*/g, '');   // 去空格
            if(val.length<strK.length && strK.slice(-1)==' '){  // 删除
                valEnd = valEnd.slice(0,-1);
            }
            this.setData({ numT: str.num.replace(/(.{4})/g,'$1 ') })
            this.save()

            return str.num.replace(/(.{4})/g,'$1 ').replace(/(^\s*)|(\s*$)/g, "")
        } else {
            var str = this.data.card;
            return str.num.replace(/(.{4})/g,'$1 ').replace(/(^\s*)|(\s*$)/g, "")
        }
    },
    iptNumEnd: function(){
        var str = this.data.card;
        if(/^([1-9]{1})(\d{14,18})$/.test(str.num)){
            str.numType = 1;
        } else {
            str.numType = 0;
        }
        this.setData({ card: str })
    },
    iptName: function(val){
        var ele = val.currentTarget.dataset.ele;
        var val = val.detail.value;
        val = this.valValue(val,ele);

        var str = this.data.card;
        if(ele){
            str[ele] = val;
            this.setData({ card: str })
        }

        // console.log(str.name)
        // if(this.data.nameT=='' && val.length>0){
        //     val = val.slice(-1);
        // }
        // str.name = val;
        // str.nameType = 1;
        this.setData({ nameT: val, card: str })
        this.save()
        return val;
    },
    iptCardName: function(val){
        var ele = val.currentTarget.dataset.ele;
        var val = val.detail.value;
        var str = this.data.card;
        if(ele){
            str[ele] = val;
            this.setData({ card: str })
        }

        this.setData({ cardNameT: val, card: str })
        this.save()
        return val;
    },
    clear: function(e){ // 清除功能
        var val = this.data.card;
        var ele = e.currentTarget.dataset.name;
        this.data.clear = ele;
        val[ele] = '';
        val[ele+'Type'] = 1;
        console.log(val)
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
                    openName: that.data.nameT,
                    openBank: that.data.cardNameT,
                    openCard: that.data.numT.replace(/\s+/g, ""),
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
        var btnType = false;
        switch (true) {
            case ka.numType==0||this.data.numT=='' : 
            break;
            case ka.nameType==0||this.data.nameT=='' :
            break;
            case ka.cardNameType==0||this.data.cardNameT=='' :
            break;
            default:
                btnType = true;
        }
        this.setData({
            btnType : btnType,
        })
        if(e && btnType){
            this.setData({ // 拉起确认
                mark: true,
            })
        }
        
    },

})