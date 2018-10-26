
import {host, util, common, onfire, cl} from '../../utils/server';
Page({
  data: {
    tColor: host.tColor,
    tColorHelp: host.tColorHelp,
    sortType: 0,
    hideOrShowGoods: true,
    first_enter: true,
    hideOrShowsGo: true,
    goods_type: '',
    // 是否展示地址选择
    showDialog: false,
    dialog_height: common.getPageHeight(),
    //标题栏显示的地址

    headAdd: '全国',
    isAll: true, //是否选择全部
    isSelLoc: false,//是否选择定位地址
    //定位的地址和城市
    locProId: -1,
    locProName: '',
    locCityId: -1,
    locCityName: '',
    address: '',
    // 选择全部的时候进来
    control: false,
    scrollPosition: 0,//地址选择滑动的位置
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  // 获取定位
  // 当值为0时，刷新并获取到对应城市列表，（定位地址，以及选中地址）
  // 当值为1时，刷新并获取到对应城市列表 (定位地址)
  // 当值为2时，回弹对应定位地址中的 的 以及选中地址
  // 当值为3时，
  reqLoc: function (reqNewOrRefresh) {
    var that = this;
    util.getLocation(function (data) {
      if (reqNewOrRefresh == 1) {
        that.setData({
          locProName: common.removeStr(data.data.result.ad_info.province),
          locCityName: common.removeStr(data.data.result.ad_info.city),
        })
      } else {
        that.setData({
          locProName: common.removeStr(data.data.result.ad_info.province),
          locCityName: common.removeStr(data.data.result.ad_info.city),
          selProName: common.removeStr(data.data.result.ad_info.province),
          selCityName: common.removeStr(data.data.result.ad_info.city)
        })
      }

      that.reqProvince(reqNewOrRefresh);
    })
  },
  refreshLoc: function () {
    this.reqLoc(1);
  },
  resetAddress: function () {
    this.setData({
      selProId: -1,
      selCityId: -1,
      selProName: '',
      selCityName: '',
    })

  },
  selAll: function (e) {
    var types = e.currentTarget.dataset.types;
    this.setData({
      isAll: true,
      isSelLoc: false,
      selCityId: -1,
      selProId: -1,
      scrollPosition: 0,
    })
    if (types == 1) {
      this.sureAddress();
    }
  },
  // 获取定位
  // 当值为0时，刷新并获取到对应城市列表，（定位地址，以及选中地址）
  // 当值为1时，刷新并获取到对应城市列表 (定位地址)
  // 当值为2时，回弹对应定位地址中的 的 以及选中地址
  // 当值为4时，获取到当前地址定位，并选中
  //       locProId:-1,
  // locProName: '',
  // locCityId: -1,
  // locCityName: '',
  reqProvince: function (reqNewOrRefresh) {
    var that = this;
    var url = host.host + '/member/newaddress.html?isFromOrder=0&orderType=&actInfo=';
    util.showLoading('加载中..')
    util.httpsGetWithId(url, function (data) {

      var selProId = -1;
      for (var i = 0; i < data.data.provinceList.length; i++) {
        if (data.data.provinceList[i].regionName == that.data.locProName) {
          selProId = data.data.provinceList[i].id
        }
      }
      if (reqNewOrRefresh == 0) {
        that.setData({
          provinceList: data.data.provinceList,
          locProId: selProId
        })
      } else if (reqNewOrRefresh == 1) {
        console.log('仅更新了定位省份id')
        that.setData({
          locProId: selProId
        })
      } else if (reqNewOrRefresh == 2) {
        console.log('回弹省份地址，城市地址并选中')
        that.setData({

          selProId: that.data.locProId,
          selProName: that.data.locProName,
          selCityId: that.data.locCityId,
          selCityName: that.data.locCityId
        })
      } else if (reqNewOrRefresh == 3) {
      } else if (reqNewOrRefresh == 4) {
        that.setData({
          provinceList: data.data.provinceList,
          // selProId: selProId,
          locProId: selProId,
          selProId: selProId,
          selProName: that.data.locProName,

        })
      }

      that.reqCity(reqNewOrRefresh)
    })
  },
  //  请求地址
  reqCity: function (reqNewOrRefresh) {
    var reqCityId = -1;

    switch (reqNewOrRefresh) {
      case 0:
        reqCityId = this.data.locProId
        break;
      case 1:
        reqCityId = this.data.locProId
        break;
      case 2:
        reqCityId = this.data.selProId
        break;
      case 3:
        reqCityId = this.data.selProId
        break;
      case 4:
        reqCityId = this.data.locProId
        break;
    }
    var url = host.host + '/getRegionByParentId?parentId=' + reqCityId;
    var that = this;
    util.showLoading('加载中..')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      var selCityId = -1;

      for (var i = 0; i < data.data.length; i++) {

        if (reqNewOrRefresh != 1) {
          if (data.data[i].regionName == that.data.selCityName) {
            selCityId = data.data[i].id
          }
        } else {
          if (data.data[i].regionName == that.data.locCityName) {
            selCityId = data.data[i].id
          }
        }
      }
      if (reqNewOrRefresh == 0) {
        that.setData({
          cityList: data.data,
          locCityId: selCityId,
          scrollPosition: 0,
        })
      } else if (reqNewOrRefresh == 1) {
        console.log('仅更新了定位城市id')
        if (that.data.locCityId != -1) {
          that.setData({
            locCityId: selCityId,
          })
          if (that.data.locCityId != that.data.selCityId) {
            that.setData({
              isSelLoc: false,
            })
          } else {
            that.setData({
              isSelLoc: true,
            })
          }
        }

      } else if (reqNewOrRefresh == 2) {
        console.log('回弹地址')
        that.setData({
          cityList: data.data,
        })
      } else if (reqNewOrRefresh == 3) {
        that.setData({
          cityList: data.data,
          scrollPosition: 0,
          isAll: false,
        })
      } else if (reqNewOrRefresh == 4) {

        that.setData({
          cityList: data.data,
          scrollPosition: 0,
          locCityId: selCityId,
          selCityId: selCityId,
          selCityName: that.data.locCityId,
          headAdd: that.data.headAdd,
          isAll: false,
          isSelLoc: true,
        })
      }

    })
  },
  // 选择定位的地址
  selLocAddress: function () {
    this.setData({
      isAll: false,
      isSelLoc: true,
    })
    this.reqProvince(2)
  },
  // 选择省
  selProvince: function (e) {
    var proId = e.currentTarget.dataset.proid;
    var proName = e.currentTarget.dataset.proname;
    this.setData({
      selProId: proId,
      selCityId: -1,
      isSelLoc: false,
      selProName: proName
    })
    this.reqCity(3);
  },
  // 选择市
  selCity: function (e) {
    var cityId = e.currentTarget.dataset.cityid;
    var cityName = e.currentTarget.dataset.cityname;
    if (this.data.selCityId == cityId) {
      cityId = -1;
      cityName = '';
    }
    if (this.data.isAll) {
      this.setData({
        isAll: false
      })
    }
    if (this.data.selProId == undefined || this.data.selProId == -1) {
      this.setData({
        selProId: this.data.locProId
      })
    }
    this.setData({
      selCityId: cityId,
      isSelLoc: false,
      selCityName: cityName
    })

    if (this.data.selCityId == this.data.locCityId && this.data.selProId == this.data.locProId) {
      this.setData({
        isSelLoc: true
      })
    }

  },
  // 确认地址
  sureAddress: function () {
    var address = '';
    if (this.data.isAll) {
      this.setData({
        headAdd: '全国',
        address: '',
      })
    } else {
      if (this.data.isSelLoc) {
        this.setData({
          headAdd: this.data.locCityName
        })
        address = this.data.locProId + ',' + this.data.locCityId
      } else {
        if (this.data.selCityId != -1) {
          this.setData({
            headAdd: this.data.selCityName
          })
          address = this.data.selProId + ',' + this.data.selCityId
        } else {
          this.setData({
            headAdd: this.data.selProName
          })
          address = this.data.selProId
        }
      }
    }
    this.setData({
      showDialog: false,
      address: address
    })

    onfire.fire('refreshLoc', this.data.headAdd)

  },
  // 切换分类
  changeSort: function (e) {
    var sortType = e.currentTarget.dataset.sortid;
    if (sortType != this.data.sortType) {
      this.setData({
        sortType: sortType
      })
      console.log('进来了')
      this.reqService()

    }


  },
  //  选择排序
  inputEvent: function (e) {
    this.setData({
      goods_type: e.detail.value
    })
  },
  // 地址选择弹出
  onClickButton: function (e) {
    let that = this;

    that.setData({
      showDialog: !this.data.showDialog
    });
    if (this.data.showDialog) {

      if (this.data.locProId == -1 || this.data.locProName == '') {
        this.reqLoc(0);
      }

    }

  },
  onClickdiaView: function () {
    this.setData({
      showDialog: !this.data.showDialog
    });

  },

  // 获取焦点
  focus_event: function (e) {
    this.setData({
      hideOrShowsGo: false
    }
    )
  },
  // 失去焦点
  blur_event: function (e) {
    this.setData({
      hideOrShowsGo: true
    }
    )
  },
  input_event: function () { },

  submsit: function (e) {
    console.log(e)
    // var keyword = e.detail.value.keyword;

    // if(keyword==""){
    //   util.showMsg('搜索的关键词不能为空')

    //   return;
    // }else{
    this.reqService()
    // }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.reqKeys();
    
    if (options.types == 1) {
      this.setData({
        showDialog: true,
        types: 1,
      })
      this.reqLoc(4);
    }
  },
  // 跳转到对应的详情页
  jumpToDetail: function (e) {
    var productId = e.currentTarget.dataset.productid;
    wx.navigateTo({
      url: '/pages/goods_detail/goods_detail?productId=' + productId,
    })
  },
  // 获取搜索页关键词
  reqKeys: function () {
    var that = this;
    var url = host.host + '/search-index.html';
    var data = {}
    util.showLoading('加载中')
    util.httpsPostWithId(url, data, function (data) {
      wx.hideLoading();
      that.setData({
        keywords: (data.data.keywords ? data.data.keywords:[])
      })
    })
  },
  // 点击关键词搜索
  search: function (e) {
    var keyword = e.currentTarget.dataset.keyword;
    this.setData({
      goods_type: keyword
    })
    console.log(keyword + '----')
    this.reqService()
  },
  // 网络请求
  reqService: function () {

    if (this.data.goods_type == "") {
      util.showMsg('搜索的关键词不能为空')

      return;
    }

    this.setData({
      hideOrShowGoods: false,
      first_enter: false,

      // first_enter: false,
    })
    var that = this;

    var url = host.host + '/search.html'

    var field = '';


    var data = {
      keyword: this.data.goods_type,
      address: that.data.address
    }

    switch (this.data.sortType) {

      case '1':
        data.field = 'id'
        break;
      case '2':
        data.field = 'actualSales'
        break;
      case '3':
        data.field = 'malMobilePrice'
        break;
    }
    that.setData({
      showDialog: false,
      control: false,
    })
    wx.showLoading({

      title: '加载中...',

    })
    console.log(data)
    util.httpsPostWithId(url, data, function (data) {

      wx.hideLoading()

      var goods_datas = []

      var data = data.data;

      var config = data.config.image_resource;
      that.setData({
        hideOrShowGoods: false,
        first_enter: false,
      })
      for (var i = 0; i < data.producListVOs.length; i++) {
        var goods_info = new Object;
        var JsonData = data.producListVOs[i];
        goods_info.goods_id = JsonData.id;
        goods_info.goods_name = JsonData.name1;
        goods_info.goods_price = JsonData.malMobilePrice;
        goods_info.goods_img = config + JsonData.masterImg;
        goods_datas[i] = goods_info;
      }
      that.setData({

        count: data.count,
        goods_datas: goods_datas,
        pageIndex: 1,
        control: true,

      })


      wx.showToast({

        title: '查询完毕',

        duration: 2000,

      })



    })
  },
  // 输入按钮确认点击

  reqConfirm: function (e) {

    var keyword = e.detail.value
    if (keyword.length != 0) {
      this.reqService(keyword)
    } else {
      util.showMsg('请输入关键词')
    }

  },
  reqMore: function () {
    var that = this
    var url = host.host + '/searchJson.html'
    var data = {
      keyword: this.data.goods_type,
      page: this.data.pageIndex + 1,
      address: this.data.address,
      field: (this.data.sortType == '1' ? 'id' : (this.data.sortType == '2' ? 'actualSales' :'malMobilePrice'))
    }

    util.httpsPostWithId(url, data, function (data) {

      if (data.data.products.length != 0) {
        var goods_datas = []

        var config = data.data.config.image_resource;

        data.data.products.forEach((product)=>{
          var goods_info = {
            goods_id: product.id,
            goods_name: product.name1,
            goods_price: product.malMobilePrice,
            goods_img: config + product.masterImg,
          }
          goods_datas.push(goods_info)
        })
       
        that.setData({
          goods_datas: that.data.goods_datas.concat(goods_datas),
          pageIndex: pageIndex + 1,
        })

      } else {
        util.showToast('已加载全部数据')
      }
    })
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.hideOrShowGoods) {
      this.reqMore()
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    // 用户点击右上角分享
    var that = this;
    return {
      title: host.companyName, // 分享标题
      path: '/pages/goods_search/goods_search'// 分享路径
    }
  },
})