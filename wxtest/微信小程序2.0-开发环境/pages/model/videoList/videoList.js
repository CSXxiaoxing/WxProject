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
        upData(){
            var [data, self] = [this.data.sonData, this];

            cl.fStyle(data).then( _data => {
                cl.log([29,'videoList'], '视频组件', _data)
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