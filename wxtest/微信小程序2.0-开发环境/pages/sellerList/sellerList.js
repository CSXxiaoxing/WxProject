import {host, util, common} from '../../utils/server';
var CHECK = common.check;

Page({

  /**
   * 页面的初始数据
   */
    data: {
        tColor: host.tColor,
        tColorHelp: host.tColorHelp,
        com_data: [],
        pageIndex: 1
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.reqSellerList();
  },
  reqService:function(){
    var url = host.host + "/partner/join";
    util.showLoading('加载中..');
    util.httpsGet(url,function(data){
        wx.hideLoading();
        this.setData({
          data:data.data
        })
    }.bind(this),function(){wx.hideLoading()},'请求招商加盟数据')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  reqSellerList: function (reqType) {

    var url = host.host + '/sellerShow' + (reqType ? '?page=' + (this.data.pageIndex + 1) : '');

    util.showLoading('加载中')

    util.httpsGet(url, function (data) {

      wx.hideLoading();

      var data = data.data;

      var config = data.config.image_resource

      if (data.sellerApplys.length > 0) {

        var child;

        for (var i = 0; i < data.sellerApplys.length; i++) {

          child = data.sellerApplys[i];

          var item = {

            id: child.id,

            name: child.company,

            add: child.companyAdd,

            img: config + child.sellerImage,

            logo: config + child.sellerLogo
          }
          this.data.com_data.push(item);
        }
        this.setData({
          com_data: this.data.com_data,
          pageIndex: (reqType ? (this.data.pageIndex + 1) : this.data.pageIndex)
        })
      }
    }.bind(this), function () {
      wx.hideLoading();
    }, '请求' + (reqType ? '更多' : '') + '热门商店数据')

  },
  jumpToShop: function (e) {
    var shopId = e.currentTarget.dataset.shopid;

    var url = '/pages/shop_detail/shop_detail?shopId=' + shopId

    wx.navigateTo({
      url: url,
    })
  },

  //跳转到新闻详情
  jumpToNewDetail: function (e) {
    util.navigateTo('/pages/newDetail/newDetail?newId=' + e.currentTarget.dataset.newid)
  },
  submitMsg: function (e) {
    var address = e.detail.value.address;
    var cpName = e.detail.value.cpName;
    var email = e.detail.value.email;
    var name = e.detail.value.name;
    var phone = e.detail.value.phone;
    if (cpName == '') {
      util.showMsg('请输入公司名称')
      return;
    }
    if (!common.checkSpace(cpName)){
      util.showMsg('公司名称不支持特殊符号(空格或表情)')
      return;
    }
    if (cpName.length<5) {
      util.showMsg('公司名称长度过短')
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
    if (name.length < 2) {
      util.showMsg('联系人姓名名称长度过短')
      return;
    }
    if (!common.checkSpace(name)) {
      util.showMsg('联系人姓名不支持特殊符号(空格)')
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
    if (!CHECK.phone(phone)){
      util.showMsg('电话号码格式有误')
      return;
    }

    if ((!CHECK.email(email)) && email!=''){
      util.showMsg('邮箱的格式有误')
      return;
    }
   
    if (address == '') {
      util.showMsg('请输入地址')
      return;
    }

    if (!common.checkStr(address)) {
      util.showMsg('地址不支持特殊符号(空格或表情)')
      return;
    }
    var url = host.host + '/partner/apply'
    var data = {
      company: cpName,
      name: name,
      phone: phone,
      email: email,
      address: address
    }
    util.showLoading('加载中..')
    util.httpsPostWithId(url, data, function (data) {
      wx.hideLoading();
      if(data.success){
        util.showMsg('提交申请成功!!!');
        this.setData({
          cpName: '',
          name: '',
          phone: '',
          email: '',
          address: '',
        })
      }else{
        util.showMsg(data.message)
      }
    }.bind(this),function(){
      wx.hideLoading();
    },'提交资料')
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.reqSellerList('more');
  },
  onReachBottom: function () {
    this.reqSellerList('more');
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: host.companyName,
      path: '/pages/joinUs/joinUs'
    }
  },

})