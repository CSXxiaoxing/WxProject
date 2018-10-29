import {cl, dict} from '../../../utils/server';
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
    },
    methods: {
        sear(e){
            cl.webview(e)
            var ele = cl.target(e);
            if(ele.phone && typeof ele.phone == "number"){
                wx.makePhoneCall({phoneNumber: `${ele.phone}`})
            } else {
                cl.jumpRouter(e,{url: dict.pages.goods_search})
            }
        },
        upData(){
            var [data, self] = [this.data.sonData, this];
            cl.fStyle(data).then( _data => {
                cl.log([30,'searchList'], '搜索组件', _data)
                self.setData({ allObj:_data })
            })
        }
    },
    created: ()=>{},
    attached: ()=>{},
    ready: ()=>{},
    moved: ()=>{},
    detached: ()=>{},
});