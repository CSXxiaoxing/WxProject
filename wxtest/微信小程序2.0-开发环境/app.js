//app.js
import {host,util,common,pageStaticData,cl,dict,window} from "utils/server";

App({
    data:{
        host: host,
        util: util,
        common: common,
        pageStaticData: pageStaticData,
        cl: cl,
    },
    onLaunch: function (e) {
        console.log('app', e)


        cl.Init();
        this._http()
        cl.UPDATA()  // 查询有无可更新
    },
    onHide:function(){ 
        this._http()
    },
    onError:function(err){ 
        // console.log('%c'+err, "color: #58bc58;")
    },
    onShow:function(){
        this._storage() 
        
        // 图片前缀
        util.httpsGet(host.host+'/config', data => {
            wx.setStorage({
                key: 'config',
                data: data.data.image_resource,
            })
            cl.Load(null)
            dict.imageSrc = data.data.image_resource;
        })
        // 首页是否显示优惠券
        wx.setStorageSync('showDialog', 1)
    },
    onShareAppMessage: function (options) {},
    _http: function(){
        // util.httpsGet(host.host + `/page/tabbar`, res => {
        //     var _data = res.data ? res.data.MiniappTabBar : false;
        //     if ( !_data ) return false;
        //     wx.setStorage({
        //         key: "clTabbar",
        //         data: _data,
        //     })
        // })
    },
    _storage: function(){   // 打开小程序需要刷新的缓存 
        util.httpsGet(host.tabHost, res => {
            let _data = res.data ? res.data.MiniappTabBar : false;
            _data && wx.setStorage({ key: host.agentId + "tabBar", data: _data, });
        })
    },
})

