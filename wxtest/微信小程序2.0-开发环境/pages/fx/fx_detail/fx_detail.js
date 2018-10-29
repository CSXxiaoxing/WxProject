
import {host,util,common,pageStaticData,cl} from "../../../utils/server";
Page({

    data: {
        color: 'all',   // al user all
        allMoney: [],   // 全部收益
        allEarnings: [],  // 所有提成
        num: 0,

        iconShow: false,
        dateStart: '',
        dateEnd: '',
        dateType: '',
        allEle : {  // 收益明细的参数留存
            source: 0,
            rows: 20,
            page: 0,
            data: [],   // 数据
            interval: [],   // 时间区间
            timeData: [],   // 时间区间数据
            timePage: 0,    // 时间区间页
        },
        dlEle : {  // 代理-收益明细的参数留存
            source: 2,
            rows: 20,
            page: 0,
            data: [],
            interval: [],
            timeData: [],
            timePage: 0,
        },
        userEle : {  // 用户-收益明细的参数留存
            source: 1,
            rows: 20,
            page: 0,
            data: [],
            interval: [],
            timeData: [],
            timePage: 0,
        },
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
    onLoad: function (options) {
        this.commisionbar();
        this.commision();
    },
    commisionbar(){     // 收益总结
        var url = host.host + '/distribution/commisionbar'
        util.httpsGetWithId( url, res=>{
            var m0 = res.data.monthCommision0.toFixed(2);
            var t0 = res.data.todayCommision0.toFixed(2);
            var m1 = res.data.monthCommision1.toFixed(2);
            var t1 = res.data.todayCommision1.toFixed(2);
            var m2 = res.data.monthCommision2.toFixed(2);
            var t2 = res.data.todayCommision2.toFixed(2);
            this.setData({
                allMoney: [m0, t0, m1, t1, m2, t2,],
            })
        })
    },
    commision(obj={}, reachBottom=1){   // 收益明细
        var color = { all: 0, dl: 2, user: 1 };
        var identity = this.data.color;
        var Ele = this.data[identity+'Ele'];
        obj.rows = 20;
        obj.source = color[identity];
        obj.page = Ele.page;
        // 时间区间
        var [s,e] = [this.data.dateStart, this.data.dateEnd];
        var data = Ele.data;
        if (s && e) {
            if (Ele.interval[0] != s || Ele.interval[1] != e){
                Ele.timeData = [];
                obj.page = 0;
            }
            data=Ele.timeData;
            this.setData({
                allEarnings: data,
            })
            obj.page = Ele.timePage;
            obj.q_startTime = s;
            obj.q_endTime = e;
        }
        // 值判断
        if(reachBottom <= obj.page){
            this.setData({
                allEarnings: data,
            })
            return false;
        }
        obj.page = reachBottom;
        var allEarnings = data;
        
        var element = '?';
        for(var w in obj) {
            if (element == '?') {
                element+=`${w}=${obj[w]}`;
            } else {
                element+=`&${w}=${obj[w]}`;
            }
        }
        var url = host.host + '/distribution/commision'+element;
        util.httpsGetWithId( url, res=>{
            if(res.rows[0]){
                var users = res.rows;
                users.map(item=>{
                    item.createTime = new Date(item.createTime).toLocaleDateString().replace(/\/(\d)(?!\d)/g, '/0$1');
                    item.commision = item.commision.toFixed(2);
                    item.source = item.source==1 ? '用户提成' : '代理提成';
                    return item;
                })
                // 参数取代
                allEarnings = allEarnings.concat(res.rows);
                if (s && e) {   // 时间段
                    this.data[identity+'Ele'].timeData = allEarnings;
                    this.data[identity+'Ele'].interval = [s,e];
                    this.data[identity+'Ele'].timePage = reachBottom;
                } else {    // 无时间段
                    this.data[identity+'Ele'].data = allEarnings;
                    this.data[identity+'Ele'].page = reachBottom;
                }
                this.setData({
                    allEarnings: allEarnings,
                })
            } else {
                cl.Tip(1,{ type: 'Toast', title: '暂无更多数据' ,image: '/images/cry.png'})
            }
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
                var num = ele == 'user' ? 4 : ele == 'dl'? 2 : 0;
                this.setData({
                    num: num,
                    color: ele,
                })
                this.commision()
            }
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
            this.commision();
        }
        var [s,e] = [this.data.dateStart, this.data.dateEnd];
        if(s && e) {
            this.commision({start:s,end:e});
        }
    },
    onReachBottom: function(){  // 上拉刷新
        var page = this.data[this.data.color+'Ele'].page;
        var [s,e] = [this.data.dateStart, this.data.dateEnd];
        if(s && e) {
            page = this.data[this.data.color+'Ele'].timePage;
        }
        console.log(page++)
        this.commision({}, page++)
    },
    onPullDownRefresh(){    // 下拉刷新

    },
})