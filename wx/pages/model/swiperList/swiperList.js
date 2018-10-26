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
        class: {
            text: '',
        },
        indicatorDots: false, // 显示面板指示点
        indicatorColor: 'rgba(255, 255, 255, .3)', // 指示点颜色
        indicatorActiveColor: '#000000',   // 当前选中指示点颜色
        current: 0, // 当前滑块的下标
        autoplay: false,   // 是否自动轮播
        interval: 3000,   // 轮播执行时间
        duration: 1000,    // 轮播切换速度
        circular: false,    // 是否启用无缝滚动
        vertical: false,    // 滚动方向是否为纵向
        previousMargin: "0px",  // 前边距
        nextMargin: "0px", // 后边距
        displayMultipleItems: 1, // 同时显示的滑块数量
        skipHiddenItemLayout: false, // 是否跳过未显示的滑块布局
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
        swiFillter(_data){
            _data.forEach(item=>{
                item['txtClass'] = 'bt'+item.classnm.slice(-1);
                item['itemClass'] = 'box'+item.classnm.slice(-1);

                if(item.classnm == 'swiper1'){
                    item.style+='height:400rpx;'
                    this.setData({ 
                        displayMultipleItems: 1,
                        circular: true,
                        indicatorDots: true,
                        autoplay: true,
                    })
                } else if(item.classnm == 'swiper2'){
                    item.style+='height:368rpx;'

                    this.setData({ 
                        nextMargin: '170rpx',
                        displayMultipleItems: 2.5,
                    })
                } else {
                    item.style+='padding: 0 0 20rpx 20rpx;';
                    this.setData({ 
                        displayMultipleItems: 2,
                    })
                }

            })
            // console.log("swiper",_data)
            this.setData({ allObj:_data })
        },
        upData(){
            var [data] = [this.data.sonData];
            var size = common.iosOrAndroid;
            cl.fStyle(data).then( _data => {
                cl.log([84,'swiperList'],'轮播组件', _data)

                var tail = '';
                if(_data[0].classnm == 'swiper2'){
                    tail += `?x-oss-process=image/resize,m_mfit,h_${~~(110/size[1]*size[4])}${size[0]}`;
                } else if(_data[0].classnm == 'swiper3'){
                    tail += `?x-oss-process=image/resize,m_mfit,h_${~~(155/size[1]*size[4])}${size[0]}`;
                } else {
                    tail += `?x-oss-process=image/resize,m_mfit,w_${~~(size[2]/size[1]*size[5])}${size[0]}`;
                }
                _data[0].swiperLists.map(item=>{
                    item.imgurl+=tail
                    return item
                })
                
                this.swiFillter(_data)
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