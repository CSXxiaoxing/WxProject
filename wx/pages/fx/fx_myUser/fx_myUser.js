
import {host,util,common,pageStaticData,cl} from "../../../utils/server";
Page({

    data: {
        type: '1',  // 1 用户 2 代理
        total: 0,
        users: [],
        agents: [],  // 最高两级
        id_open: -1, // 以id为控制是否展开开关
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
    onLoad: function (options) {
        // 我的用户or我的代理
        this.setData({
            type: options.type,
        })
        this.init();
    },
    onShow(){
        this.init();
    },
    init(){
        var that = this;
        if( this.data.type==2 ){ // 查代理
            wx.setNavigationBarTitle({
                title: '我的代理'
            })
            var url = host.host+'/distribution/agent';
            util.httpsGetWithId( url, res=>{
                var users = res.rows
                users.map(item=>{
                    item.profilePhoto = item.photo;
                    item.nickname = item.nickName;
                    return item;
                 })
                this.setData({ 
                    users: users,
                    total: res.total,
                    grade: res.data
                 })
            })
        } else {    // 查用户
            var url = host.host+'/distribution/member';
            util.httpsGetWithId( url, res=>{
                var users = res.rows
                users.map(item=>{
                    // var time = new Date(item.registerTime).toLocaleDateString().replace(/\/(\d)(?!\d)/g, '/0$1')
                    item.registerTime = that.formatDateTime(item.registerTime);
                    return item;
                })
                this.setData({ 
                    users: users,
                    total: res.total
                 })
            })
        }
    },
    unfold(e){
        var id = e.currentTarget.dataset.id;
        var id_open = this.data.id_open;
        id_open = id == id_open ? 0 : id;
        this.setData({
            id_open: id_open,
        })

        var agents = this.data.agents;
        if(!agents[id]){
            var url = host.host+'/distribution/agent?id='+id;
            util.httpsGetWithId( url, res=>{

                var agent = res.rows
                agent.map(item=>{
                    item.profilePhoto = item.photo;
                    item.nickname = item.nickName;
                    return item;
                })
                agents[id] = agent;
                this.setData({ 
                    agents: agents,
                })

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
    formatDateTime: function (inputTime) {  
            var date = new Date(inputTime);
            var y = date.getFullYear();  
            var m = date.getMonth() + 1;  
            m = m < 10 ? ('0' + m) : m;  
            var d = date.getDate();  
            d = d < 10 ? ('0' + d) : d;  
            var h = date.getHours();
            h = h < 10 ? ('0' + h) : h;
            var minute = date.getMinutes();
            var second = date.getSeconds();
            minute = minute < 10 ? ('0' + minute) : minute;  
            second = second < 10 ? ('0' + second) : second; 
            // return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;  
            return y + '/' + m + '/' + d
    }

})