
import {host,util,common,pageStaticData,cl} from "../../../utils/server";
Page({

    data: {
        color: 'all',
        iconShow: false,
        dateStart: '',
        dateEnd: '',
        pages: 1,
        btnTx: {},   // 提现点击反馈
        proName: ['申请', '审核', '到账'],
        total: 0,   // 总提现
        userData: [],
        users: [
            { 
                time: '2018年09月',
                money: '940.00',
                data: [{
                    time: '04-03 17:10',
                    type: '提现失败',
                    money: '40.00',
                    getWay: '中国银行（2222）',
                    code: '265464984949849461116',
                    progress: [{
                        time: '04-04 11:28',
                        type: 'true',
                    },{
                        time: '04-05 15:33',
                        type: 'true',
                    }],
                },{
                    time: '04-02 17:10',
                    type: '已到账',
                    money: '900.00',
                    getWay: '中国银行（2222）',
                    code: '265464984949849461116',

                }],
            },
            {
                time: '2018年08月',
                money: '100.00',
                data: [{
                    time: '04-03 17:10',
                    type: '已申请',
                    money: '40.00',
                    getWay: '中国银行（2222）',
                    code: '265464984949849461116',
                }],
            },
        ],
        
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
    onLoad: function (options) {
        this.withdraw() // 提现记录    
    },
    withdraw( obj={}, page=1){ // 时间or分页
        var element = '?';
        obj.rows = 6;
        obj.page = page;
        for(var o in obj){
            element.length == 1 ? 
            element+=`${o}=${obj[o]}`: 
            element+=`&${o}=${obj[o]}`;
        }
        
        util.httpsGetWithId( host.host+'/distribution/withdraw/total'+element, res=>{
            // console.log(res)
            this.setData({
                total: res.data,
            })
        })
        util.httpsGetWithId( host.host+'/distribution/withdraw/list'+element, res=>{
            // console.log(res.rows)
            var data = res.rows;
            data.map(item=>{
                if(item.time){
                    item.time = item.time.replace( '-', '年' ) + '月';
                    item.data.map(son=>{
                        var timestamp = new Date(son.createTime);
                        var date = timestamp.toLocaleDateString().replace(/\//g, "-").match(/-(\S*)/)[1] + " " + timestamp.toTimeString().substr(0, 5);
                        son.createTime = date;
                        if(son.status == 3){
                            son.progress = [{type: 'true'},{type: 'true'},{type: 'false'}]
                        } else if(son.status == 2){
                            son.progress = [{type: 'true'},{type: 'true'},{type: 'true'}]
                        } else if(son.status == 1){
                            son.progress = [{type: 'true'},{type: 'true'}]
                        } else {
                            son.progress = [{type: 'true'}]
                        }
                        return son;
                    })
                }
                return item;
            })
            this.setData({
                users: data,
            })
        })
    },
    btnTy: function(e){
        var ele = e.currentTarget.dataset.ele || false;
        if (ele) {
            if(ele == 'fx-date') {
                this.setData({
                    iconShow: !this.data.iconShow,
                })
            } else {
                this.setData({
                    color: ele,
                })
            }
        }
    },
    btnT: function(e){  // btnTx点击反馈
        var ele = e.currentTarget.dataset.ele || false;
        if (ele) {
            var arr = this.data.btnTx;
            if(!arr[ele]){
                arr[ele]= true;
            } else {
                arr[ele]= false;
            }
            this.setData({
                btnTx: arr,
            })
        }
    },
    preDetailImage: function (e) {
        var that = this;
        var imgUrl = e.currentTarget.dataset.imgurl;
        wx.previewImage({
        current: imgUrl,
        urls: this.data.comment.images,
        })
    },
    bindDateChange: function(e) {
        var ele = e.currentTarget.dataset.ele || false;
        if (ele) {
            this.setData({
                ['date'+ele]: e.detail.value
            })
        } else {
            this.setData({
                dateStart: '',
                dateEnd: '',
            })
            this.withdraw();
        }
        var [s,e] = [this.data.dateStart, this.data.dateEnd];
        if(s && e) {
            this.withdraw({q_startTime:s, q_endTime:e})
        }
    },
    onReachBottom: function(){  // 上拉刷新
        // var page = this.data[this.data.color+'Ele'].page;
        var [s,e] = [this.data.dateStart, this.data.dateEnd];
        // if(s && e) {
        //     page = this.data[this.data.color+'Ele'].timePage;
        // }
        // console.log(page++)
        // this.commision({}, page++)

    },

})