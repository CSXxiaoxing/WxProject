import {cl, common} from '../../../utils/server';
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
        jump(e){
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
            cl.fStyle(data).then( _data => {
                cl.log([37,'titleList'], '标题组件', _data)
                var imgTail = common.iosOrAndroid;
                if(_data[0].imgurl){
                    _data[0].imgurl+=`?x-oss-process=image/resize,m_mfit,w_${~~(imgTail[2]*imgTail[5])}${imgTail[0]}`
                }
                if(_data[0].text[0].iconbg){
                    _data[0].text[0].iconbg+=`?x-oss-process=image/resize,m_mfit,h_${~~(20/imgTail[1]*imgTail[4])},w_${~~(20/imgTail[1]*imgTail[4])}${imgTail[0]}`;
                }
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