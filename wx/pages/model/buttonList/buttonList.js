import {cl} from '../../../utils/server';
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
        height: [],  // fine-height
        fiexd: [],
        cover: [],  // 外层
    },
    methods: {
        btn(e){
            cl.webview(e)
            
            var ele = e.currentTarget.dataset;
            if(ele.phone && typeof ele.phone == "number"){
                wx.makePhoneCall({phoneNumber: `${ele.phone}`})
            } else {
                if(ele.url=="") return false;
                cl.jumpRouter(e)
            }
        },
        upData(){
            var [data, self] = [this.data.sonData, this];
            var [height,fiexd,cover] = [[],[],[]];
            data.forEach( h => {
                cover.push(`height:${h.h*2}rpx;width:${h.w*2}rpx;`)
                if (h.h) h.h = h.h;
                if (h.w) h.w = h.w;
                height.push(h.h-1)
                fiexd.push(h.isf)
            });
            cl.fStyle(data).then( _data => {
                cl.log([48,'buttonList'], '按钮组件', _data)
                // console.log()
                self.setData({ 
                    allObj:_data,
                    height: height,
                    fiexd: fiexd,
                    cover: cover
                })
            })
        }
    },
    created: function(){
    },
    attached: function(){
    },
    ready: function(){
    },
    moved: ()=>{
    },
    detached: ()=>{
    },
});