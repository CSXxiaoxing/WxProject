
import {host, util, common, dict} from '../../../utils/server';
var CHECK = common.check;
var timeInter;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    tColorHelp: host.tColorHelp,
    phone:'',
    qrCode:'',
    time:60,
    countTime:false,
  },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
  onLoad(){
    // this.setData({
    //     image: this.test(),
    // })
    // console.log(this.test())
  },
  getPhoneNum:function(e){
      console.log(e.detail)
    if (e.detail.encryptedData){
      //同意了
    var url = host.host + '/wechat/memberWxsign/getWxPhoneNumber.html';
     var login = util.wxLogin();
     login().then(res =>{
      var data = {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        code: res.code
      }
      util.httpsPostWithId(url,data,function(data){
        if(data.success){
          util.showMsg('绑定成功!',function(){
            wx.switchTab({
              url: dict.pages.index,
            })
          })
        }else{
          util.showMsg(data.message)
        }
      }.bind(this))
     },function(){},'请求绑定电话号码')
      
    }
  },
  onShow: function () {
    util.getUserInfo(function (res) {
      console.log(res)
      this.setData({
        userInfo: res,
      })
    }.bind(this))

  },
  /**
   * 用户自输入手机号绑定
   */
  bindPhone:function(e){
        util.markFormId(e.detail.formId);
    var phone = e.detail.value.phone;
    var qrCode = e.detail.value.qrCode;
    if (phone == '') {
      util.showMsg('请输入手机号码')
      return;
    }
    if (phone.length < 11) {
      util.showMsg('手机号码长度有误')
      return;
    }
    if (!CHECK.phone(phone)) {
      util.showMsg('手机号码格式有误')
       return;
     }
    if (!this.data.countTime){
      util.showMsg('请先获取验证码')
      return;
     }
    if (qrCode == '') {
      util.showMsg('请输入验证码')
      return;
    }
    if (!common.checkSpace(qrCode)){
      util.showMsg('请输入正确验证码')
      return;
    }
    if (!common.checkStr(qrCode)) {
      util.showMsg('验证码不支持特殊符号(空格或表情)')
      return;
    }
    var url = host.host + '/member/smsverif.html';
    var data = {
      phone : phone,
      verif: qrCode
    }
    util.showLoading('加载中')
    util.httpsPostWithId(url, data, function (data){
      wx.hideLoading();
      if(data.success){
        util.showMsg('绑定成功',function(){
          wx.switchTab({
            url: dict.pages.index,
          })
        })
      }else{
        util.showMsg(data.message)
      }
    },function(){
      wx.hideLoading();
    })
  },
  inputEvent:function(e){
    // 判断输入内容并赋值
    var key = (e.currentTarget.dataset.type == 'phoneNum' ? 'phone' : 'qrCode')
      this.setData({
        [key]:e.detail.value
      })
  },
  getQrCode:function(){
    if (this.data.phone == '') {
      util.showMsg('请输入手机号码')
      return;
    }
    if (this.data.phone.length < 11) {
      util.showMsg('手机号码长度有误')
      return;
    }
    if (!CHECK.phone(this.data.phone)) {
      util.showMsg('手机号码格式有误')
      return;
    }
    var url = host.host + '/member/sendsmsverif.html';
    var data = {
      mobile: this.data.phone
    }
    util.showLoading('加载中')
    util.httpsPostWithId(url,data,function(data){
      wx.hideLoading();
      if(data.success){
        if (timeInter) {
          clearInterval(timeInter)
        }
        this.setData({
          countTime: true
        })
      
        timeInter = setInterval(function () {
          if (this.data.time != 0) {
            this.setData({
              time: (this.data.time - 1)
            })
          } else {
            clearInterval(timeInter)
            this.setData({
              time: 60,
              countTime: false
            })
          }

        }.bind(this), 1000)
      }else{
        util.showMsg(data.message)
      }
    }.bind(this),function(){
      wx.hideLoading();
    },'获取手机验证码')
   
      

      
    
    
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (timeInter) {
      clearInterval(timeInter)
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },


})