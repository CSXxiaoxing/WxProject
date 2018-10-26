var app = getApp();
import {host, util, cl, dict, common} from '../../utils/server';

Page({
    data: {
        key: host.agentId + dict.IDXKEY[4],
        getData: '', // 拖拽的文件
        container: [],  // 外盒style
        itSupport:'', // 技术支持
        tab: 0,
        showDialog: false,
        openType:'share', 
        theVersions: '',
    },
    onToolFun:function(e){  // tool全局注入
        this.setData({ tool: e.detail })
    },
    onLoad: function(options={}) {
        if (options.QRcode) {
            wx.setStorage({
                key: 'cl-QRcode',
                data: options.QRcode,
            })
        }
        var $this = this;
        var tab = 0;
        this.setData({
            tab: tab,
        })
        //获取技术支持
        util.httpsGet(host.host + `/page/tabbar?1`, res => {
            var _data = res.data ? res.data.MiniappTabBar : false;
            cl.fStyle([JSON.parse(_data.supportText)]).then(response=>{
                $this.setData({
                    itSupport: response[0]
                })
            })
        })
        this.checkNeedBind()
        this.getUserAllData()
    },
    onShow: function(e) {
        var that = this;
        wx.getStorage({
            key: that.data.key,
            success(res) {
                // 处理层
                that.setList(res.data)
                // that.getUserAllData()
            },
            fail() {
                // 请求层
                that.getUserAllData()
            }
        })
    },
    onReady: function(){    // 页面渲染完成后调用
    },
    onPullDownRefresh(){    // 下拉刷新-更新数据
        cl.PullDownRefresh(2000,'dark',this.getUserAllData)
    },
    onShareAppMessage: function (res) { // 分享
        return {
          title: host.companyName,
          path: dict.pages.index
        }
    },
    //请求客户拖拽的数据：
    getUserAllData: function() {
        var that = this;
        var url = host.getHost + getCurrentPages()[0].route;
        util.httpsGet( url, res=>{
            let data = res.data.pageInfo;
            let list = JSON.parse(data.pageDetails)
            if ( data && !data['pageDetails'] ) return false;
            cl.log(70, 'list', list)
            wx.setStorage({
                key: that.data.key,
                data: list,
            })
            that.setList(list)
            // 改变微信标题
            wx.setNavigationBarTitle({
                title: data.pageName
            })
            // 停止页面下拉刷新
            wx.stopPullDownRefresh()
        })
    },
    setList(list){
        var that = this;
        var container = this.data.container;
        var count = 0;
        list.pages1.map( (item,idx) => {
            for(let an in item) {
                if(Array.isArray(item[an]) && item[an].length==0) delete item[an];
                if(`${an}` == 'container') {
                    cl.fStyle(item[an]).then( _data => {
                        if(_data[0].insty[0].bgimg){
                            _data[0].insty[0].bgimg += `?x-oss-process=image/resize,m_mfit,w_${common.iosOrAndroid[2]}${common.iosOrAndroid[0]}`
                        }

                        if ( !container[idx] ) {
                            container[idx]=_data[0];
                            count++;
                            if(count>=list.pages1.length){
                                setContainer(container)
                            }
                        } else if ( JSON.stringify(container[idx]) != JSON.stringify(_data[0]) ){
                            container[idx]=_data[0];
                            setContainer(container)
                        }
                    })
                }
            }
            function setContainer(container){
                // console.log(container)
                that.setData({ container })
            }
        })
        this.setData({
            getData: list,
        })
    },
    formSubmit:function(e){
        var that= this;
        console.log(e.detail.value)
        app.fromPost(e.detail.value,that)
    },
    onShareAppMessage: function(options) {},
    checkNeedBind:function(){
        var url = host.host + '/isNeedPhone';
        util.httpsGetWithId(url,function(data){
            var data = data.data;
            console.log(data)
            if (data.isNeedPhone == 1 && data.isVerifyPhone == 0) {
                cl.Router( 0, {url:'/pages/market/bindPhone/bindPhone'} )
            }
        })
    },
    theVersions01(){
        this.setData({
            theVersions: dict.theVersions,
        })
    },
    theVersions02(){
        this.setData({
            theVersions: '',
        })
    },
})