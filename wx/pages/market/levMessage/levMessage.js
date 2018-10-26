
import {host, util, common, dict} from '../../../utils/server';
var CHECK = common.check;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  onLoad(){},
  submitMsg: function (e) {
    var address = e.detail.value.address;
    var content = e.detail.value.content;
    var cpName = e.detail.value.cpName;
    var email = e.detail.value.email;
    var name = e.detail.value.name;
    var phone = e.detail.value.phone;
    if (cpName == '') {
      util.showMsg('请输入公司名称')
      return;
    }
    if (!common.checkStr(cpName)) {
      util.showMsg('公司名称不支持特殊符号(空格或表情)')
      return;
    }
    if (name == '') {
      util.showMsg('请输入联系人姓名')
      return;
    }
    if (!common.checkStr(name)) {
      util.showMsg('联系人姓名不支持特殊符号(空格或表情)')
      return;
    }
    if (phone == '') {
      util.showMsg('请输入电话号码')
      return;
    }
    if (phone.length < 11) {
      util.showMsg('电话号码长度有误')
      return;
    }
    if (!CHECK.phone(phone)) {
      util.showMsg('电话号码格式有误')
      return;
    }
    if (content == '') {
      util.showMsg('请输入留言内容')
      return;
    }
    if (!common.checkStr(content)) {
      util.showMsg('留言内容不支持特殊符号(空格或表情)')
      return;
    }
    if ((!CHECK.email(email)) && email != '') {
      util.showMsg('邮箱格式有误')
      return;
    }
    if (!common.checkStr(email)) {
      util.showMsg('邮箱不支持特殊符号(表情)')
      return;
    }
    if (!common.checkStr(address) && address != '') {
      util.showMsg('地址不支持特殊符号(空格或表情)')
      return;
    }
    var url = host.host + '/message/add'

    var data = {
      company: cpName,
      contract: name,
      telephone: phone,
      email: email,
      address: address,
      content:content
    }
    util.showLoading('加载中..')
    util.httpsPostWithId(url, data, function (data) {
      wx.hideLoading();
      if (data.success) {
        util.showMsg('提交留言成功!!!',function(){
          wx.navigateBack({
            delta: 1,
          })
        })
      } else {
        util.showMsg(data.message)
      }
    }, function () {
      wx.hideLoading();
    },"提交留言信息")
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: host.companyName,
      path: dict.pages.levMessage
    }
  },

})