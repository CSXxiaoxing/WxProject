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
    },
    methods: {
        textTap(e){
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
                cl.log([38,'textList'],'文字组件','table', _data)
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