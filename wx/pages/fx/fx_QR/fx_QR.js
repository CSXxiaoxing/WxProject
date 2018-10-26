import {host,util,common,pageStaticData,cl} from "../../../utils/server";

Page({
    data: {
        tColor: host.tColor,
        img_url:'https://canglu-test.oss-cn-shenzhen.aliyuncs.com/images/571/miniappId/b57dc9aa-95df-45f7-bc21-ac06faec0885.png',
        QRcode: '', // 个人邀请码
        QRinit: {}, // 初始化数据
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
    onLoad: function (options) {
        var that = this;
        wx.getStorage({//获取本地缓存      
            key:"cl-user-data",
            success:function(res){
                that.setData({
                    QRinit: res.data
                })
            },
            fail(){}
        })
    },
    onShow: function(){
        util.httpsGetWithId(host.host+'/distribution/share', data=>{
            console.log(data)
            this.data.QRcode = data.data;
        })
    },
    onReady(){
        wx.setNavigationBarColor({  // 如需固定颜色启用
            frontColor: '#000000',
            backgroundColor: '',
            animation: {
                duration: 0,
                timingFunc: 'easeIn'
            }
        })
    },
    preDetailImage: function (e) {

    },
    reqService: function () {},
    onShareAppMessage: function(){
        var that = this;
        return {
          title: '分享本店', // 分享标题
          path: '/pages/index0/index0?QRcode='+this.data.QRcode, // 分享路径
        }
    },
    bao:function(){
        var IMG_URL = this.data.img_url;
        wx.downloadFile({
            url: IMG_URL,
            success:function(res){
              console.log(res)
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: function (res) {
                  console.log(res)
                },
                fail: function (res) {
                  console.log(res)
                  console.log('fail')
                }
              })
            },
            fail:function(){
              console.log('fail')
            }
          })
      
    },

})
