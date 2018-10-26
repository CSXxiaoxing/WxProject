import {cl, dict, host, util, common} from '../../../utils/server';
Component({
    properties: {
        sonData:{
            type: Array,
            value: '',
            observer: function(newVal, oldVal, changedPath){
                if ( oldVal == "" || JSON.stringify(newVal) != JSON.stringify(oldVal) ) {
                    this.upData()
                }
            }
        },
    },
    data: {
        allObj: [],
        scrollX: true,
        bdr: 0,
        allsty: {
            bdr: 0, // 圆角
            b: 0,   // 边框
            bg: "rgba(255, 255, 255, 1)",
        },
        hostSrc: dict.imageSrc,    // 图片默认前缀
        size: common.iosOrAndroid,   // 0是否安卓 1倍数
    },
    methods: {
        news(e){
            cl.webview(e)
            
            var ele = e.currentTarget.dataset;
            if(ele.phone && typeof ele.phone == "number"){
                wx.makePhoneCall({phoneNumber: `${ele.phone}`})
            } else {
                if(ele.url==""){
                    cl.Tip(1, {
                        title: '该新闻不存在',
                        type: 'Toast',
                        icon: 'none',
                    })
                    return false;
                }
                cl.jumpRouter(e, {url: cl.pages.newDetail + ele.url})
            }
        },
        upData(){
            var [data, self] = [this.data.sonData, this];
            var bdr = data[0].bdr*2;
            // this.data.size = common.iosOrAndroid
            cl.fStyle(data).then( _data => {
                cl.log([46,'articleList'], '新闻组件', _data)
                this.setData({ 
                    allObj:_data,
                    bdr: bdr,
                })
            })
        },
    },
    created: ()=>{},
    attached: function(){
        var that = this;
        var url = host.host+'/config';
        wx.getStorage({//获取本地缓存      
            key:"config",
            success:function(res){
                that.setData({
                    imageSrc: res.data
                })
            },
            fail: function(){
                util.httpsGet(url, data => {
                    cl.Load(null)
                    that.setData({
                        hostSrc: data.data.image_resource
                    })
                })
            }
        })
    },
    ready: ()=>{},
    moved: ()=>{},
    detached: ()=>{},
});