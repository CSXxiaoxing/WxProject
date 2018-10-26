
import {host, cl, util, common} from "../../../utils/server";
var CHECK = common.check;

Page({
    data: {
        tColor: host.tColor,
        fx_cuo: true,
        iptValue: '',
        iptType: 1,// 0小了,1,2大了
        money: 298.98,
        QRcode: '',

        mark: false,
        markType: 3,    // 1提示 2指定商品 3协议
        isAgree: false,
        tip: ["请输入身家", "请输入年龄"],    // tip
        fromData: [],   // 表单的值

        routerTitle: '分销协议',
        router: `                    一. 特别提示
        1.1 UI中国同意按照本协议的规定及其不时发布的操作规则提供基于互联网以及移动网相关服务（以下称"网络服务"），为获得网络服务，服务使用人（以下称"用户"）应当同意本协议的全部条款并按照页面上的提示完成全部的注册程序。用户在进行注册程序过程中点击"同意"按钮即表示用户完全接受本协议项下的全部条款。
        
        1.2 用户注册成功后，UI中国将给予每个用户一个用户帐号及相应的密码，该用户帐号和密码由用户负责保管；用户应当对以其用户帐号进行的所有活动和事件负法律责任
        
        二. 服务内容
        2.1 UI中国网络服务的具体内容由UI中国根据实际情况提供，例如搜索、资讯、分享、原创、竞赛和活动等。
        
        2.2 UI中国提供的部分网络服务为收费的网络服务，用户使用收费网络服务需要向UI中国支付一定的费用。对于收费的网络服务，UI中国会在用户使用之前给予用户明确的提示，只有用户根据提示确认其愿意支付相关费用，用户才能使用该等收费网络服务。如用户拒绝支付相关费用，则UI中国有权不向用户提供该等收费网络服务。
        
        2.3 用户理解，UI中国仅提供相关的网络服务，除此之外与相关网络服务有关的设备（如个人电脑、其他与接入互联网或移动网有关的装置）及所需的费用（如为接入互联网而支付的电话费及上网费）均应由用户自行负担。`,

        fromRequired: [],   // 辅助判断其他信息是否需要必填
        
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
    onLoad: function (options) {
        var url = host.host+'/distribution/applyform'
        util.httpsGetWithId( url, res=>{
            cl.log(37, '需要输入参数', res)
            var required = [];
            var res = res.data;
            res.form.map(item=>{
                if(item.type == 'select'){
                    var t = item.placeholder.split(';')[item.value*1];
                    item.placeholder=t?t:'';
                }
                if(item.isShow==1) required.push(item.isRequired);
                else required.push(2) ;
                return item;
            })
            this.setData({
                data: res.form,
                fromRequired : required,
                routerTitle: res.title,
                router: res.protocol,
            })
        })
    },
    onShow: function(){
        var that = this;
        wx.getStorage({
            key: 'cl-QRcode',
            success(res) {
                // 处理层
                that.setData({
                    QRcode: res.data,
                })
            },
            fail() {
            }
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
    bindAgreeChange: function (e) {
        this.setData({
            isAgree: !!e.detail.value.length
        });
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
        if (val+'' == 'NaN' || val == 0) val = '';
        else if (val>this.data.money) type = 2;
        else if (val < 100) type = 0;
        this.setData({
            iptValue: val,
            iptType: type,
        })
        return val;
    },
    submit: function(){
        if(this.data.iptValue>=100){
            // 成功-请求
            cl.Router(0,{url:'/pages/fx/fx_tiXianYes/fx_tiXianYes'})
            // 失败-请求
            cl.Router(0,{url:'/pages/fx/fx_tiXianNo/fx_tiXianNo'})
        } else {
            // 成功-请求
            cl.Router(0,{url:'/pages/fx/fx_tiXianNo/fx_tiXianNo'})
            // cl.Router(0,{url:'/pages/fx/fx_tiXianYes/fx_tiXianYes'})
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
    onipt: function(e){
        var idx = e.currentTarget.dataset.ele;
        var fromData = this.data.fromData;
        fromData[idx-1] = e.detail.value;
        this.setData({
            fromData: fromData,
        })
    },
    save: function(){
        var [ fromData, agreement ] = [ this.data.fromData, this.data.isAgree ];
        var [ formJson, fromRequired, txt ] = [ [], this.data.fromRequired, [ '姓名', '手机', '邮箱' ] ];

        for (var an in txt) {
            if(!fromData[an]){
                this.tip('请输入'+txt[an])
                return false;
            }
            if( txt[an] == '手机' && !CHECK.phone(fromData[an]) ){
                var errMsg = '您输入的手机号有误';
                if(fromData[an].length<11){
                    errMsg = '您输入的手机号小于11位，请检查输入是否有误'
                } else if(fromData[an].length>11){
                    errMsg = '您输入的手机号大于11位，请检查输入是否有误';
                }
                this.tip(errMsg)
                return false;
            }
            else if( txt[an] == '邮箱' && !CHECK.email(fromData[an]) ){
                this.tip('请检查输入的邮箱是否正确')
                return false;
            }
            
        }

        if(this.data.QRcode){
            fromData[3] = this.data.QRcode
        }
        if(this.data['data']){
            var data = this.data['data'];
            for(var i = 0; i<data.length; i++){
                if(fromRequired[i]==1 && !fromData[4+i]){
                    this.tip(data[i].placeholder)
                    return false;
                } else {
                    formJson.push({
                        txt: this.data.data[i].text,
                        value: fromData[4+i],
                    })
                }
            }
        }
        if(!agreement){
            cl.Tip(1,{title:'请先阅读并同意分销协议',type:'Toast',icon:'none',mask:true})
            return false
        }
        util.httpsPostWithId( `${host.host}/distribution/apply`, 
            { 
                name: fromData[0],
                phone: fromData[1],
                email: fromData[2],
                pcode: fromData[3] ? fromData[3] : '',
                // formJson: JSON.stringify(formJson),
                formJson: JSON.stringify(formJson),
            }, res=>{
                if(res.success && !res.data.msg){
                    cl.Router(1,{url:'/pages/fx/fx_my/fx_my'})
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.message ? res.message : res.data.msg,
                        showCancel: true,
                        success: function(res){
                            if(res.confirm) {
                                cl.Router(1,{url:'/pages/my/my'})
                            }
                        },
                        fail: function(res){
                            cl.Router(1,{url:'/pages/my/my'})
                        }
                    })
                }
            })
    },
    tip(txt){
        cl.Tip(1,{title:txt,type:'Toast', icon:'none' ,mask: true})
    }

})