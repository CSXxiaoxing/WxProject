
import {host,util,common,cl,dict} from "../../../utils/server";
Page({
    data: {
        tColor: host.tColor,
        avg_grade:1,
        hashType: [false, false], // 有无银行卡  // 有（true）无(false)执行中的订单

        mark: false,
        tipText: '',    // 文字
        QRcode: false,  // 二维码
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
    onLoad: function (options) {},
    onShow: function(){
        this.reqService()
    },
    preDetailImage: function (e) { 
        var that = this;
        var imgUrl = cl.Target(e, 'imgurl');
        
        wx.previewImage({
        current: imgUrl,
        urls: this.data.comment.images,
        })
    },
    reqService: function () {
        var url = host.host+'/distribution/index'
        util.httpsGetWithId( url, res=>{
            var data = res.data;
            for(var an in data){
                if(typeof data[an] == 'number'){
                    data[an] = data[an].toFixed(2);
                }
            }
            console.log(data)
            // 可提现参存
            wx.setStorage({
                key: 'allow',
                data: data.allow,
            })
            this.data.hashType = [data.hashBankCard, data.hashUnDealt];
            this.setData({
                data: data
            })
        })

        
        // 获取分销推广码
        util.httpsGetWithId(host.host+'/distribution/share', data=>{
            // this.data.QRcode = data.data;
            this.setData({
                QRcode: data.data,
            })
        })
    },
    tiXian: function () {
        var hash = this.data.hashType;
        if (!hash[0] || hash[1]) {    // 无银行卡 or 未处理完的提现订单
            this.setData({
                mark: true,
                tipText: hash[0] ? '您还有未处理完的提现订单' : '请先绑定银行卡',
            })
        }
        else if(this.data.data.allow<100) {  // 金额不达标
            this.setData({
                mark: true,
                tipText: '当前金额不符合最低提现要求',
            })
        }
        else {   // 完美通过
            cl.Router(0,{url:'/pages/fx/fx_tiXian/fx_tiXian'})
        }
    },
    motype: function(){ // mark
        this.setData({
            mark: false,
        })
    },
    navigate(e){
        var sid = cl.target(e,'sid'),url;
        switch (sid) {
            case 'rule' : url = '/pages/fx/fx_rule/fx_rule';
            break;
            case 'user' : url = '/pages/fx/fx_myUser/fx_myUser?type=1';// 我的用户
            break;
            case 'dl' : url = '/pages/fx/fx_myUser/fx_myUser?type=2';// 我的代理
            break;
            case 'detail' : url = '/pages/fx/fx_detail/fx_detail'; // 收益明细
            break;
            case 'tx' : url = '/pages/fx/fx_record/fx_record'; // 提现记录
            break;
            case 'card' : 
                var hash = this.data.hashType;   
                if(hash[0]){
                    url = '/pages/fx/fx_myCard/fx_myCard'; // 我的银行卡
                } else {
                    url = '/pages/fx/fx_newCard/fx_newCard'; // 新建银行卡
                }
            break;
            case 'qr' : 
                if(!this.data.QRcode){
                    wx.showModal({
                        title: '提示',
                        content: '网络异常,请重新点击分享',
                        showCancel: false,
                        success: function(res){
                            if(res.confirm || res.cancel) {
                                wx.startPullDownRefresh()
                            }
                        }
                    })
                }
                // url = '/pages/fx/fx_QR/fx_QR'; // 二维码
            break;
        }
        if(url){
            cl.Router(0,{url:url})
        }
    },
    onShareAppMessage: function (res) { // 分享首页
        return {
          title: host.companyName,
          path: dict.pages.index + '?QRcode=' + this.data.QRcode,
        }
    },
    onPullDownRefresh(){    // 下拉刷新-更新数据
        this.reqService()
    },
})