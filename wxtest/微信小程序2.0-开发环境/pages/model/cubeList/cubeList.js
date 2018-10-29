import {cl,common} from '../../../utils/server';
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
        cubFn: function(e) {
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
            var size = common.iosOrAndroid;
            cl.fStyle(data).then( _data => {
                console.log(_data)
                cl.log([37,'cubeList'], '魔方组件', _data)
                _data[0].cubeLists.map(item=>{
                    if(item.imgurl.includes('https')||item.imgurl.includes('http')){
                        item.imgurl+=`?x-oss-process=image/resize,m_mfit,h_${~~(48/size[1]*size[4])},w_${~~(48/size[1]*size[4])}${size[0]}`
                        return item;
                    }
                })
                self.setData({ allObj:_data })
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