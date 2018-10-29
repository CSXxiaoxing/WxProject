import { host, util, common, dict, cl, window, storage } from "../../../utils/server";

const TAG = storage.tabBar;

Component({
    properties: {
        tabData:{
            type: null,
            value: '',
            observer: function(newVal, oldVal, changedPath){
                if(!newVal) return;-
                function(_data){
                    console.count('次数')
                    _data['bgImg'] += `?x-oss-process=image/resize,m_mfit,w_${common.iosOrAndroid[2]}${common.iosOrAndroid[0]}`
                    this.setData({
                        bg: {
                            imgUrl: _data['bgImg'],
                            Color: _data['bgColor'],
                        },
                        shareType: _data.openPost,
                        IMG_URL: _data.postUrl,
                    })
                }.bind(this)(TAG())
            }
        },
    },
    data: {

        companyName: host.companyName,
        webViewSrc: false,  // web-view
        Authorize: false, // 弹框授权
        bgShow: false,   // 背景是否渲染
        bg: {
            imgUrl: '',
            Color: '',
        },
        // 分享
        shareArr: [
            {
                name: '立即分享',
                type: 'share',
                id: 0,
            },
            {
                name: '生成海报 保存分享',
                type: '',
                id: 1,
            },
            {
                name: '取消',
                type: '',
                id: 2,
            },
        ],
        shareType: false, // 分享是否显示
        shareArrType: false,    
        shareChildType: true,   // 按钮

        IMG_URL : "",

        // 1
        ballBottom: 0,
        ballRight: 0,
        screenHeight: 0,
        screenWidth: 0,

        // 2
        isPopping: true,//是否已经弹出
        animPlus: {},//旋转动画
        animCollect: {},//item位移,透明度
        animTranspond: {},//item位移,透明度
        animInput: {},//item位移,透明度

        // 倍数
        double: 2,
        pageXY: [], // 当前位置

        test: '',
    },
    methods: {
        btn(e){
            var ele = e.currentTarget.dataset;
            if(ele.phone && typeof ele.phone == "number"){
                wx.makePhoneCall({phoneNumber: `${ele.phone}`})
            } else {
                cl.jumpRouter(e)
            }
        },
        marknone: function(){   // 拒绝授权
            window.MoniOBJ.Authorize = true;
            this.setData({
                Authorize: false,
            })
        },
        getUserInfo:function(e){
            if(e.detail.userInfo){
                this.setData({
                    Authorize: false,
                })
                window.MoniOBJ.Authorize = false;

                cl.userInfo = e.detail.userInfo;
                wx.setStorageSync('userInfo', e.detail.userInfo)
                cl.WxLogin()
            } else {
                console.log('拒绝授权')
            } 
        },
        // 点击分享
        _openShare(){   // 打开
            wx.hideTabBar()
            this.setData({
                shareArrType: true,
            })
            
        },
        _closeShare(e){  // 关闭
            var id =cl.target( e, 'id' );
            var that = this;
            console.log(id)
            
            switch ( id*1 ) {
                case 1 : 
                    // 打开模板展示
                    that.setData({
                        shareChildType: false,
                    })
                    break;
                case 99 : 
                    // 保存海报
                    wx.getSetting({ // 检查保存权限
                        success(_res) {
                            if (!_res.authSetting['scope.writePhotosAlbum']) {
                                wx.authorize({  // 获取授权
                                    scope: 'scope.writePhotosAlbum',
                                    success () {
                                        if(that.data.postUrl){
                                            save(that.data.postUrl, true)
                                        } else {
                                            downPic()
                                        }
                                        cl.Load({title: ''})
                                    }
                                })
                            } else {
                                if(that.data.postUrl){
                                    save(that.data.postUrl, true)
                                } else {
                                    downPic()
                                }
                                cl.Load({title: ''})
                            }
                        },
                    })
                    function save(urlFile, type){
                        cl.Load()
                        wx.saveImageToPhotosAlbum({ // 保存
                            filePath: urlFile,
                            success: function (res) {   // 成功
                                cl.Tip(1, { type: 'Toast', title: '保存成功' ,icon: 'none'})
                            },
                            fail() { // 保存失败
                                if(type){   // 地址失效-再次请求
                                    downPic()
                                }
                            }
                        })
                    }
                    function downPic(){
                        window('downloadFile')({
                            url: that.data.IMG_URL,
                            success:function(res){  // 下载
                                that.setData({
                                    postUrl: res.tempFilePath
                                })
                                save(res.tempFilePath)
                            },
                            fail:function(){
                                cl.Load()
                                cl.Tip(1, { type: 'Toast', title: '图片获取失败' ,icon: 'none'})
                            }
                        })
                    }
                    
                    that.setData({
                        shareChildType: true,
                        shareArrType: false,
                    })
                    break;
                default: 
                that.setData({
                    shareChildType: true,
                    shareArrType: false,
                })
            }
            wx.showTabBar()
        },
        // 关闭webview
        _clearWebView(){
            window.MoniOBJ.webViewSrc = false;
        },
        // 注册观察者
        _observer(){ 
            var that = this;
            cl.Listener( ['webViewSrc', 'Authorize'], ( obj )=>{
                that.setData({
                    [obj.name] : obj.key,
                })
            })
        },

        
        // 点击图片产生move动效
        _startShare: function(e){

            this.setData({
                test: `--rx:0deg; --ry:0deg; --ty:0; --tz:-25rpx`
            })
        },
        _moveShare: function(e){
            var touchs = e.touches[0];
            var offset = e.currentTarget;

            // const x = touchs.clientX - offset.offsetLeft;
            // const y = touchs.clientY - offset.offsetTop;
            const x = touchs.clientX;
            const y = touchs.clientY;
            const xc = common.iosOrAndroid[6]/2
            const yc = offset.offsetTop+common.iosOrAndroid[7]*0.3
            
            var dx = x - xc
            var dy = y - yc
            
            // aElem.onmousemove = function(e) {

            //     const x = e.clientX - boundingClientRect.left
            //     const y = e.clientY - boundingClientRect.top
                
            //     const xc = boundingClientRect.width/2
            //     const yc = boundingClientRect.height/2
                
            //     const dx = x - xc
            //     const dy = y - yc
                
            //     docStyle.setProperty('--rx', `${ dy/-1 }deg`)
            //     docStyle.setProperty('--ry', `${ dx/10 }deg`)
                
            // }
            
            // aElem.onmouseleave = function(e) {
                
            //     docStyle.setProperty('--ty', '0')
            //     docStyle.setProperty('--rx', '0')
            //     docStyle.setProperty('--ry', '0')
                
            // }
            
            // aElem.onmousedown = function(e) {
                
            //     docStyle.setProperty('--tz', '-25px')
                
            // }
            
            // document.body.onmouseup = function(e) {
                
            //     docStyle.setProperty('--tz', '-12px')
                
            // }

            const dd = y - yc > 0 ? -1 : 1;

            console.log((dy/-10).toFixed(2),(dx/10*dd).toFixed(2))
            // console.log(dy/-10*dd,dx/10*dd)

            this.setData({
                test: `--rx:${ (dy/-10).toFixed(2) }deg; --ry:${ (dx/10*dd).toFixed(2) }deg; --ty:0; --tz:-25rpx`
                // test: `--rx:${ dy/10 }deg; --ry:${ dx/10 }deg; --ty:0; --tz:-25rpx`
                // test: `--rx:${ dy/-10 }deg; --ry:${ dx/10 }deg; --ty:0; --tz:-25rpx`
                // test: `--rx:${ dy/-10 }deg; --ry:${ dx/10 }deg; --ty:0; --tz:-25rpx`
                // test: `--rx:${ 15 }deg; --ry:${ -14 }deg; --ty:0; --tz:-25rpx`
            })
        },
        _endShare: function(){
            this.setData({
                test: `--rx:0deg; --ry:0deg; --ty:0; --tz:-12rpx`
            })
        },


        // 拖动
        ballMoveEvent: function (e) {
            console.log('动了',e)
            var touchs = e.touches[0];
            var pageX = touchs.clientX;
            var pageY = touchs.clientY;
            var double = common.thePx(45)/2;
            console.log('当前位置X:'+pageX+' ;; Y:' + pageY)
        
            //防止坐标越界,view宽高的一般 
            if (pageX < double) return; 
            if (pageX > this.data.screenWidth - double) return; 
            if (this.data.screenHeight - pageY <= double) return; 
            if (pageY <= double) return; 
        
            //这里用right和bottom.所以需要将pageX pageY转换 
            var x = this.data.screenWidth - pageX - double;
            var y = this.data.screenHeight - pageY - double;
            // console.log('x: ' + x)
            // console.log('y: ' + y)
            this.setData({
              ballBottom: y|0,
              ballRight: x|0,
              pageXY: [pageX,pageY,this.data.screenWidth,this.data.screenHeight],
            });
        },
        
        //点击弹出
        plus: function () {
            console.log('点击了....')
            
            console.log(this.data.isPopping)
            if (this.data.isPopping) {
              //弹出动画
              this.popp();
              this.setData({
                isPopping: false
              })
            } else if (!this.data.isPopping) {
              //缩回动画
              this.takeback();
              this.setData({
                isPopping: true
              })
            }
        },
        input: function () {
            console.log("input")
        },
        transpond: function () {
        console.log("transpond")
        },
        collect: function () {
        console.log("collect")
        },
        //弹出动画
        popp: function () {
            // 数值运算与判断
            var pageXY = this.data.pageXY;
            // var x = [-60, 76.5, -60];
            // var y = [-60, 0, 60];
            // // x
            // if( pageXY[0] < 85 ) { x[0] = x[2] = 60 ; x[1] = 100; }
            // else if( pageXY[0] > pageXY[2]-105 ) x[1] = -100;
            // // y
            // if( pageXY[1] < 85 ) {
            //     x[0] = x[1] = x[2];
            //     y = [0, 90, 180];
            // } else if( pageXY[1] > pageXY[3]-85 ){
            //     x[0] = x[1] = x[2];
            //     y = [-0, -90, -180];
            // }
            // 待封装
            var x = [-common.thePx(60), common.thePx(76.5), -common.thePx(60)];
            var y = [-common.thePx(60), 0, common.thePx(60)];
            // x
            if( pageXY[0] < common.thePx(85) ) { x[0] = x[2] = common.thePx(60) ; x[1] = common.thePx(100); }
            else if( pageXY[0] > pageXY[2]-common.thePx(105) ) x[1] = -common.thePx(100);
            // y
            if( pageXY[1] < common.thePx(85) ) {
                x[0] = x[1] = x[2];
                y = [0, common.thePx(90), common.thePx(180)];
            } else if( pageXY[1] > pageXY[3]-common.thePx(85) ){
                x[0] = x[1] = x[2];
                y = [-0, -common.thePx(90), -common.thePx(180)];
            }
            //plus顺时针旋转
            var animationPlus = wx.createAnimation({
              duration: 500,
              timingFunction: 'ease-out'
            })
            var animationcollect = wx.createAnimation({
              duration: 500,
              timingFunction: 'ease-out'
            })
            var animationTranspond = wx.createAnimation({
              duration: 500,
              timingFunction: 'ease-out'
            })
            var animationInput = wx.createAnimation({
              duration: 500,
              timingFunction: 'ease-out'
            })
            
            animationPlus.rotateZ(180).step();
            // var x0
            animationcollect.translate(x[0], y[0]).rotateZ(180).opacity(1).step();
            animationTranspond.translate(x[1], y[1]).rotateZ(180).opacity(1).step();
            animationInput.translate(x[2], y[2]).rotateZ(180).opacity(1).step();
            this.setData({
              animPlus: animationPlus.export(),
              animCollect: animationcollect.export(),
              animTranspond: animationTranspond.export(),
              animInput: animationInput.export(),
            })
        },
        //收回动画
        takeback: function () {
            //plus逆时针旋转
            var animationPlus = wx.createAnimation({
              duration: 500,
              timingFunction: 'ease-out'
            })
            var animationcollect = wx.createAnimation({
              duration: 500,
              timingFunction: 'ease-out'
            })
            var animationTranspond = wx.createAnimation({
              duration: 500,
              timingFunction: 'ease-out'
            })
            var animationInput = wx.createAnimation({
              duration: 500,
              timingFunction: 'ease-out'
            })
            animationPlus.rotateZ(0).step();
            animationcollect.translate(0, 0).rotateZ(0).opacity(0).step();
            animationTranspond.translate(0, 0).rotateZ(0).opacity(0).step();
            animationInput.translate(0, 0).rotateZ(0).opacity(0).step();
            this.setData({
              animPlus: animationPlus.export(),
              animCollect: animationcollect.export(),
              animTranspond: animationTranspond.export(),
              animInput: animationInput.export(),
            })
        },
    },
    created: function(e){
        // 监听者事件 - 监听webview
        this._observer()
    },
    attached: function(){
        // 设置基础
        this.setData({
            tColor: TAG('T_Color'),
            tColorHelp: TAG('T_CHelp'),
            webV: `background:-webkit-linear-gradient(-60deg, ${TAG('T_Color')}, ${TAG('T_CHelp')});`,

            screenWidth: common.iosOrAndroid[6],
            screenHeight: common.iosOrAndroid[7],
            double: common.iosOrAndroid[1],
            ballBottom: common.thePx(50),
            ballRight: common.thePx(20),
            pageXY: [common.iosOrAndroid[6]-common.thePx(20),common.iosOrAndroid[7]-common.thePx(50),common.iosOrAndroid[6],common.iosOrAndroid[7]],
        })
        // 全局默认，基础
        var that = this;
        var pName = common.getPageName();
        
        cl.InitPage();
        -function(_data){
            _data.bgImg += `?x-oss-process=image/resize,m_mfit,w_${common.iosOrAndroid[2]}${common.iosOrAndroid[0]}`
            that.setData({
                bgShow: !dict.notbg.includes(pName),
                bg: {
                    imgUrl: _data.bgImg || '',
                    Color: _data.bgColor|| '',
                },
                shareType: _data.openPost,
                IMG_URL: _data.postUrl,
            })
            if(_data.postUrl){
                window('downloadFile')({
                    url: _data.postUrl,
                    success:function(res){  // 下载
                        that.setData({
                            postUrl: res.tempFilePath
                        })
                    },
                })
            }

            var fatherData = {
                tColor: TAG('T_Color'),
                tColorHelp: TAG('T_CHelp'),
            }
            that.triggerEvent( 'toolFun', fatherData )   // 触发父元素方法
        }(TAG())
        
    },
    ready: function(){},
    moved: ()=>{},
    detached: ()=>{},
});