import {cl, dict, host, util, common} from '../../../utils/server';
console.log(common.iosOrAndroid)
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
        imageSrc: dict.imageSrc, // 图片路径前缀 
        imgsize: 0, // 1 2 3
        icon: [ 'icon-gouwuche-copy', 'icon-hot', 'icon-xinpin1', 'icon-remai', 'icon-iconfontzhizuobiaozhun023113'], // 字体图标
    },
    methods: {
        btn(e){
            cl.webview(e)
            var ele = cl.target(e);
            if(ele.phone && typeof ele.phone == "number"){
                wx.makePhoneCall({phoneNumber: `${ele.phone}`})
            } else {
                if(ele.url==""){
                    cl.Tip(1, {
                        title: '该商品不存在',
                        type: 'Toast',
                        icon: 'none',
                    })
                    return false;
                }
                cl.jumpRouter(e, {url: dict.pages.goods_detail + ele.url})
            }
        },
        upData(){
            var [data, imgTail] = [this.data.sonData, common.iosOrAndroid];
            cl.fStyle(data).then( _data => {
                cl.log([46,'goodsList'], '商品组件', _data)
                var num = _data[0].classnm.slice(-1),size;
                if(num == 1) size = 1;
                else if(num == 3 || num == 4) size = 3;
                else size = 2;
                _data[0].shopLists.map(item=>{
                    if(item.masterImg){
                        item.masterImg = `${item.masterImg}?x-oss-process=image/resize,m_mfit,h_${size==1?~~(250/imgTail[1]*imgTail[5]):size==2?~~(152/imgTail[1]*imgTail[5]):~~(110/imgTail[1]*imgTail[4])}${imgTail[0]}`;
                        return item
                    }
                })
                this.setData({ 
                    allObj:_data,
                    imgsize: size,
                })
            })
        }
    },
    created: function(){},
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
                        imageSrc: data.data.image_resource
                    })
                })
            }
        })
    },
    ready: function(){},
    moved: ()=>{},
    detached: ()=>{},
});