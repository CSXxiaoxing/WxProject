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
        markers: [{ // 地图标记点
            iconPath: "../../../images/map_markers.png",
            // id: 0,
            latitude: 22.987472,
            longitude: 113.268586,
            width: 16,
            height: 24
        }],
    },
    methods: {
        upData(){
            var [data, self] = [this.data.sonData, this];
            cl.fStyle(data).then( _data => {
                cl.log([36,'mapList'], '地图组件', _data)
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