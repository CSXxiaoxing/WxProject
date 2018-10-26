
import {host, util, onfire, dict} from '../../../utils/server';

Page({
    data: {
        tColor: host.tColor,
        address_data: [],
        SelAddId:-1
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    var pagetype = options.type;
    var oldAddressId = options.address
    
    this.setData({
      pagetype: pagetype,
      oldAddressId: oldAddressId //已选中的地址id
    })

  },
  // 请求地址列表
  reqService: function () {
    var url = host.host + '/member/address.html'
    util.showLoading('加载中')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      if (data.data != null && data.data != undefined) {
        var data = data.data;
        var address_data = [];
        // 拼装数据
        data.addressList.forEach((address)=>{
          var item = {
            id: address.id,
            name: address.memberName,
            phone: address.mobile,
            addAll: address.addAll,
            addressInfo: address.addressInfo,
            isSel: ((this.data.oldAddressId != -1 && this.data.oldAddressId == address.id)?true:false),
          }
          address_data.push(item);
        })

      }
      this.setData({
        address_data: address_data
      })
    }.bind(this),function(){},'请求地址列表')

  },
  //跳转到编辑页面
  //选择地址
  check_address:function(e){
    var addid = e.currentTarget.dataset.addid;
    this.data.address_data.forEach((address,i)=>{
      if (address.id == addid) {
        if (!address.isSel) {
          this.data.address_data[i].isSel = true;
          this.data.SelAddId = address.id;
        }
      } else {
        this.data.address_data[i].isSel = false;
      }
    })

    this.setData({
      address_data: this.data.address_data,
      SelAddId:this.data.SelAddId
    })
    onfire.fire('seladd', this.data.SelAddId);
    wx.navigateBack({
      delta: 1,
    })
  },
  jumpToEdit: function (event) {

    util.navigateTo(dict.pages.add_address+'?id=' + event.currentTarget.dataset.id)
  },

  // 跳转到新增地址页面
  jumpToAdd: function () {
    util.navigateTo(dict.pages.add_address)
  },

  onShow: function () {
    // 生命周期函数--监听页面显示
    util.checkSsId(function () {

      this.reqService();
    }.bind(this))
 
  },

})