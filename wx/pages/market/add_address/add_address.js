
import {host, util} from '../../../utils/server';
var ids;
var ids_city;
var ids_str;
// 当前地址id
var id = -1;
// 当前地址位置
var pro_id = -1;
var city_id = -1;
var region_id = -1;

// 省市区名称数组
var names;
var city_Names;
var street_Names;

Page({
  data: {
    // 当前地址位置
    currentId:-1,
    pro_id:-1,
    city_id:-1,
    region_id:-1,
    // 是否第一次进来
    first:true,
    province_Names: [],
    city_Names: [],
    street_Names: [],
    index_city: 0,
    index_str: 0,
    index: 0,
    tColor: host.tColor,
 
  },
    // 全局注入
    onToolFun:function(e){
        this.setData({
            tool: e.detail
        })
    },
    onLoad: function (options) {
        // 生命周期函数--监听页面加载
        id = options.id;
        if (id != undefined) {
            this.setData({
                adId:id
            })
            this.reqEdit(id)
        } else {
            this.reqProvinceMsg();
        }
    },
  // 编辑地址页面地址
  reqEdit(id) {
    var that = this;
    var url = host.host + '/member/editaddress.html?id=' + id;
    util.httpsGetWithId(url,function(data){
      var data = data.data;
      var name = data.address.memberName;
      var phone = data.address.phone;
      // 区域所在对应id
      pro_id = data.address.provinceId;
      city_id = data.address.cityId;
      region_id = data.address.areaId;
      var zipCode = data.address.zipCode;
      var addressInfo = data.address.addressInfo;
      that.setData({
        val_name: name,
        val_num: phone,
        val_address: addressInfo,
        val_stamp: zipCode,
      })
      that.reqProvinceMsg();
    },function(){},'请求编辑页面地址')
  },
  ProvinceChange: function (e) {
    util.log('省选择改变，携带值为'+e.detail.value)
    if (e.detail.value != 0) {
      this.reqCity(ids[e.detail.value])
    }
    this.setData({
      index: e.detail.value,
      index_city: 1
    })
  }, CityChange: function (e) {
    util.log('市选择改变，携带值为'+e.detail.value)
    if (e.detail.value != 0) {
      this.reqStreet(ids_city[e.detail.value])
    }
    this.setData({
      index_city: e.detail.value,
      index_str: 1
    })
  }, regionChange: function (e) {
    util.log('区域选择改变，携带值为'+e.detail.value)
    this.setData({
      index_str: e.detail.value
    })
  },
  // 请求省
  reqProvinceMsg: function () {
    var that = this;
    util.showLoading('加载中...');
    var url = host.host + '/member/newaddress.html?isFromOrder=0&orderType=&actInfo=';
    util.httpsGetWithId(url, function (data) {
      var data = data.data;
      var province = [];
      names = [];
      ids = [];
      names[0] = '-请选择-'
      for (var i = 0; i < data.provinceList.length; i++) {
        var JsonData = data.provinceList[i];
        names[i + 1] = JsonData.regionName;
        ids[i + 1] = JsonData.id;
      }
      if (that.data.first) {
        if (pro_id != -1) {

          for (var i = 0; i < ids.length; i++) {
            if (pro_id == ids[i]) {

              that.reqCity(ids[i]);
              that.setData({
                index: i,
              })
            }
          }
        }
      } else {
        that.reqCity(ids[1]);
      }

      that.setData({
        province_Names: names,
        index_city: 0,
        index_str: 0,
      })
      wx.hideLoading()
    }, function () {},'请求省份')
  },
  // 请求城市
  reqCity: function (pro_id) {
    var that = this;
    util.showLoading('加载中...')
    var url = host.host + '/getRegionByParentId?parentId=' + pro_id;
    util.httpsGetWithId(url, function (data) {
      var data = data.data;
      city_Names = [];
      ids_city = [];
      city_Names[0] = '-请选择-'
      if (data != null) {
        for (var i = 0; i < data.length; i++) {
          var JsonData = data[i];
          city_Names[i + 1] = JsonData.regionName;
          ids_city[i + 1] = JsonData.id;
        }
        if (that.data.first) {
          if (city_id != -1) {
            for (var i = 0; i < ids_city.length; i++) {
              if (city_id == ids_city[i]) {
                that.reqStreet(ids_city[i])
                that.setData({
                  index_city: i,
                })
              }
            }
          }
          that.reqStreet(ids_city[1])
        } else {
          that.reqStreet(ids_city[1])
        }
        wx.hideLoading()
      } else {
        wx.hideLoading()
      }
      that.setData({
        city_Names: city_Names,
        index_str: 0,
      })
    },function(){},'请求城市')
  },
  // 请求地区
  reqStreet: function (pro_id) {
    var that = this;
    util.showLoading('加载中...')
    var url = host.host + '/getRegionByParentId?parentId=' + pro_id;
    util.httpsGetWithId(url,function(data){
      var data = data.data;
      street_Names = [];
      street_Names[0] = '-请选择-'
      ids_str = [];
      if (data != null) {
        for (var i = 0; i < data.length; i++) {
          var JsonData = data[i];
          street_Names[i + 1] = JsonData.regionName;
          ids_str[i + 1] = JsonData.id;
        }
        if (that.data.first) {
          if (region_id != -1) {
            for (var i = 0; i < ids_str.length; i++) {
              if (region_id == ids_str[i]) {
                that.setData({
                  index_str: i,
                })
              }
            }
          }
          that.data.first = false;
        }
      }
      wx.hideLoading()
      that.setData({
        first: that.data.first,
        street_Names: street_Names
      })
    },function(){},'请求地区')
    
  },
  // 提交事件
  submitEvent: function (event) {
    if (event.detail.value.name.length == 0) {
      util.showMsg('姓名不能为空')
      return;
    } else if (event.detail.value.phone.length < 11) {
      util.showMsg('电话号码长度有误')
      return;
    } else if (event.detail.value.address_detail.length == 0) {
      util.showMsg('请填写正确的详细地址')
      return;
    } else if (event.detail.value.province == 0) {
      util.showMsg('请选择省份')
      return;
    } else if (event.detail.value.city == 0) {
      util.showMsg('请选择城市')
      return;
    } else if (event.detail.value.street == 0) {
      util.showMsg('请选择区县')
      return;
    }
    var url = host.host + '/member/saveaddress.html'
    var data = {
      memberName: event.detail.value.name,
      mobile: event.detail.value.phone,
      phone: event.detail.value.phone,
      provinceId: ids[event.detail.value.province],
      cityId: ids_city[event.detail.value.city],
      areaId: ids_str[event.detail.value.street],
      addressInfo: event.detail.value.address_detail,
      //全部地址
      addAll: names[event.detail.value.province] + city_Names[event.detail.value.city] + street_Names[event.detail.value.street],
      zipCode: '',
    }
    if (id != -1 && id != undefined) {
      data.id = id;
    }
    util.showLoading('加载中')
    util.httpsPostWithId(url,data,function(){
      wx.hideLoading();
      var title = "";
      if (id != -1) {
        title = '修改成功'
      } else {
        title = '添加成功'
      }
      util.showMsg(title,function(){
        wx.navigateBack({
          delta: 1,
        })
      })
    })
  },
  // 删除对应地址
  del_address: function () {
    var that = this;
    util.showModal('删除地址', '是否删除地址', '取消', '确定删除', function () {
      var url = host.host + '/member/deleteaddress.html';
      var data = {
        id: id,
      }
      util.httpsPostWithId(url, data, function (data) {
        var title = '';
        if (data.success) {
          title = '删除成功';
        } else {
          title = '删除失败，请检查网络'
        }
        util.showMsg(title,function(){
          wx.navigateBack({
            delta: 1,
          })
        })
      })
    })
  },
  onUnload: function () {
    // 生命周期函数--监听页面卸载
    ids = [];
    ids_city = [];
    ids_str = [];
    // // 当前地址id
    id = -1;
    // // 当前地址位置
    pro_id = -1;
    city_id = -1;
    region_id = -1;
    // 省市区名称数组
    names = [];
    city_Names = [];
    street_Names = [];
  },

})