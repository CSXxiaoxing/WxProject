
import {host, util, common, onfire, dict} from '../../../utils/server';

var time_inter;
var refreshId = -1;
var refreshEvent = onfire.on('refreshPage', function (data) {
  util.log('新开团刷新当前页面', data)
  refreshId = data
})
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    timepos1: 0,
    timepos2: 0,
    timepos3: 0,
    timepos4: 0,
    timepos5: 0,
    timepos6: 0,
    sel_num: 1, //输入的数量
    isIn: true
  },
  onToolFun:function(e){
    this.setData({ tool: e.detail })
},
  //请求服务器
  reqService: function () {
    let url = host.host + '/pintuanactivity/' + this.data.actId + '.html';
    util.httpsGetWithId(url, function (data) {
      var data = data.data;
      var config = data.config.image_resource;
      var t_members = [];
      var goods = {
        productId: data.goods.productId,
        goodId: data.goods.id,
        name: data.ActPintuan.name,
        bottomPersonNum: data.ActPintuan.bottomPersonNum,//多少人团
        image: config + data.ActPintuan.image,
        price: common.toDecimal(data.ActPintuan.price),
        marketPrice: common.toDecimal(data.ActPintuan.marketPrice),
        productId: data.ActPintuan.productId,
        stock: data.ActPintuan.stock,
        selGoodsInfo: data.goods,
        goods_styles: [],
        sellerId: data.seller.id,
        state: data.actPintuanActivity.state
      }
      for (let i = 0; i < data.ActPintuan.bottomPersonNum; i++) {
        let item = {
          icon: '',
          nickName: ''
        }
        t_members.push(item)
      }
      data.ActPintuanMember = data.ActPintuanMember.reverse();
      data.ActPintuanMember.forEach((member, i) => {
        let item = {
          icon: (member.profilePhoto ? member.profilePhoto : member.aliProfilePhoto),
          nickName: (member.nickname ? member.nickname : member.aliNickname)
        }
        t_members[i] = item
      })
      // 拼接选择商品样式
      for (var x = 0; x < data.norms.length; x++) {
        var choiceItem = {
          name: data.norms[x].name,
          attrList: []
        }
        for (var y = 0; y < data.norms[x].attrList.length; y++) {
          var sels = {
            name: data.norms[x].attrList[y].name,
            id: data.norms[x].attrList[y].id,
          }
          if (y == 0) {
            sels.sel = true;
          } else {
            sels.sel = false;
          }
          choiceItem.attrList[y] = sels;
        }
        goods.goods_styles[x] = choiceItem;
      }
      this.setData({
        goods: goods,
        isCreate: data.isCreate,
        countTime: data.countTime, //是否创团仔
        isIn: data.isIn, //是否在团里
        t_members: t_members,
        countTime: (data.countTime ? data.countTime : 0),
        allowSize: data.actPintuanActivity.allowSize, //还差多少人
        actGroupId: data.ActPintuan.id,//拼团活动Id
        stageType: data.stageType
      })
      this.refreshActList();//推荐列表
      if (data.stageType == 1) {
        this.parseTime();
      }

    }.bind(this), function () { }, "请求拼团信息", this.data.currentPageUrl)
  },
  //请求推荐商品
  reqRandomGoods: function () {
    let url = host.host + '/randompintuanlist.html';
    util.httpsGetWithId(url, function (data) {
      var data = data.data;
      var config = data.config.image_resource;
      var randomGoods = [];
      data.pintuan.forEach((item) => {
        let goods = {
          name: item.name,
          actId: item.id,
          image: config + item.image,
          price: common.toDecimal(item.price),
          productId: item.productId
        }
        randomGoods.push(goods)
      })
      this.setData({
        randomGoods: randomGoods
      })
    }.bind(this), function () { }, "请求随机拼团商品", this.data.currentPageUrl)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var fromType = options.fromType;
    var pages = getCurrentPages();
    this.setData({
      actId: options.actId,
      currentPageUrl: '/' + pages[pages.length - 1].route + '?actId=' + options.actId + (fromType ? '&fromType=' + fromType : ''),
    })
  },
  //换一批
  refreshActList: function () {
    wx.showLoading({
      title: '加载中..',
      mask: true,
    })
    let url = host.host + '/activitylist/' + this.data.actGroupId + '.html';
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      if (data.data.actPintuanactivity.length > 0) {
        this.setData({
          ActPintuanActivity: data.data.actPintuanactivity
        })
      } else {

      }
    }.bind(this), function () {
      wx.hideLoading();
    }, "请求换一批", this.data.currentPageUrl)
  },
  //判断选择样式入口
  judgeAction: function (e) {
    let nickName = e.currentTarget.dataset.nickname;
    let fromType = e.currentTarget.dataset.fromtype;

    if (fromType == 1) {
      //参与别人发起的团
      console.log('别人发起的团')
      this.setData({
        tempActGroupId: this.data.actId,
        showDialog: !this.data.showDialog,
      });
    } else {
      console.log('自己发起团')
      this.setData({
        showDialog: !this.data.showDialog,
        tempActGroupId: 0
      });

    }
  },
  // 
  toOtherSharePintuan: function (e) {

    wx.redirectTo({
      url: dict.pages.sharePintuan+'?actId=' + e.currentTarget.dataset.agid + (this.data.fromType ? '&fromType=' + this.data.fromType : '')
    })
  },

  //发起拼团
  startPintuan: function (e) {
    /**
 *     let productId = option.productId;
let productGoodId = option.productGoodId;
let actId = option.actId;  //活动Id
actGroupId  //别人发起活动的Id
let sellerId = option.sellerId;
let number = option.number;
 */
    this.setData({
      showDialog: !this.data.showDialog,
    });
    util.navigateTo(dict.pages.add_pintuanIndent+'?productId=' + this.data.goods.productId + "&actId=" + this.data.actGroupId + "&productGoodId=" + this.data.goods.goodId + '&number=' + this.data.sel_num + '&actGroupId=' + this.data.tempActGroupId + '&sellerId=' + this.data.goods.sellerId + '&fromType=0')
  },
  //弹出选择框
  onClickdiaView: function (e) {
    this.setData({
      showDialog: !this.data.showDialog
    });
  },

  touchStartEvent: function (e) {
    console.log(e)
    this.setData({
      touchX: e.changedTouches[0].clientX,
      touchY: e.changedTouches[0].clientY,
    })
  },
  preSingleImage: function (e) {
    var that = this;
    var imgUrl = e.currentTarget.dataset.imgurl;
    if (imgUrl == '') {
      return;
    }
    wx.previewImage({
      current: imgUrl,
      urls: [imgUrl],
    })
  },
  // 选择样式
  sel_Style: function (e) {
    var that = this;
    var normid = e.currentTarget.dataset.normid;
    var pos = e.currentTarget.dataset.pos;
    // 选中的位置发生变化
    for (var x = 0; x < this.data.goods.goods_styles[pos].attrList.length; x++) {
      if (this.data.goods.goods_styles[pos].attrList[x].id == normid) {
        this.data.goods.goods_styles[pos].attrList[x].sel = true;
      } else {
        this.data.goods.goods_styles[pos].attrList[x].sel = false;
      }
    }

    // 循环拿选中的值
    var normAttrId = '';
    for (var x = 0; x < this.data.goods.goods_styles.length; x++) {
      for (var y = 0; y < this.data.goods.goods_styles[x].attrList.length; y++) {
        if (this.data.goods.goods_styles[x].attrList[y].sel) {
          if (x != this.data.goods.goods_styles.length - 1) {
            normAttrId = normAttrId + this.data.goods.goods_styles[x].attrList[y].id + ',';

          } else {
            normAttrId = normAttrId + this.data.goods.goods_styles[x].attrList[y].id;
          }
        }
      }
    }
    var url = host.host + '/getGoodsInfo.html';
    var data = {
      productId: that.data.goods.productId,
      normAttrId: normAttrId
    }
    util.showLoading('加载中...')
    util.httpsPost(url, data, function (data) {
      wx.hideLoading()
      var data = data.data;

      if (data != null) {

        that.data.goods.goodId = data.id

        // that.data.goods.price = data.mallMobilePrice;

        // that.data.goods.stock = data.productStock;

        that.data.goods.selGoodsInfo = data;
      }
      that.setData({
        goods: that.data.goods
      })
    })

  },

  touchEndEvent: function (e) {
    console.log(e)
    this.setData({
      endX: e.changedTouches[0].clientX,
      endY: e.changedTouches[0].clientY,
    })
    if (this.data.endY - this.data.touchY > 0) {
      console.log('下拉')
      this.setData({
        flag: true
      })
    } else if (this.data.endY - this.data.touchY < 0) {
      console.log('上拉')
      this.setData({
        flag: false
      })
    }
  },
  jumpToPintuanDetail: function (e) {
    util.navigateTo(dict.pages.pintuanDetail+'?productId=' + e.currentTarget.dataset.productid + "&actId=" + e.currentTarget.dataset.actid)
  },
  // 商品数量增加
  add: function () {
    if (this.data.goods == undefined) {
      return
    } else {
      if (this.data.sel_num < this.data.goods.stock) {
        this.data.sel_num += 1
      }
      this.setData({
        sel_num: this.data.sel_num
      })
    }
  },
  sub: function () {
    //商品数量减少
    if (this.data.goods == undefined) {
      return
    } else {
      if (this.data.sel_num > 1) {
        this.data.sel_num -= 1
      }
      this.setData({
        sel_num: this.data.sel_num
      })
    }
  },
  //输入框
  onInputEvent: function (e) {
    if (e.detail.value > this.data.goods.stock) {
      e.detail.value = this.data.goods.stock
    }
    this.setData({
      sel_num: e.detail.value - 0 //字符串转数字
    })
  },
  //输入商品数量时，校验合法
  onblurEvent: function (e) {
    console.log(e)
    if (e.detail.value <= 0) {
      this.setData({
        sel_num: 1
      })
    }
  },
  parseTime: function () {
    var countTime = this.data.countTime
    if (time_inter != null || time_inter != undefined) {
      clearInterval(time_inter)
    }
    time_inter = setInterval(function () {
      var day = 0,
        hour = 0,
        minute = 0,
        second = 0;//时间默认值 
      if (countTime > 0) {
        day = Math.floor(countTime / (60 * 60 * 24));
        hour = Math.floor(countTime / (60 * 60)) - (day * 24);
        minute = Math.floor(countTime / 60) - (day * 24 * 60) - (hour * 60);
        second = Math.floor(countTime) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
      }
      if (day <= 9) day = '0' + day;
      if (hour <= 9) hour = '0' + hour;
      if (minute <= 9) minute = '0' + minute;
      if (second <= 9) second = '0' + second;
      // -------------切割数组
      var timepos1 = (hour + '').split("")[0];
      var timepos2 = (hour + '').split("")[1];
      var timepos3 = (minute + '').split("")[0];
      var timepos4 = (minute + '').split("")[1];;
      var timepos5 = (second + '').split("")[0];
      var timepos6 = (second + '').split("")[1];

      this.setData({
        timepos1: timepos1,
        timepos2: timepos2,
        timepos3: timepos3,
        timepos4: timepos4,
        timepos5: timepos5,
        timepos6: timepos6
      })
      countTime--;
      if (countTime < 0) {
        clearInterval(time_inter)
      }
    }.bind(this), 1000);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('回传回来的拼团id=' + refreshId)
    setTimeout(function () {

      if (refreshId == -1) {
        util.checkSsId(function () {
          this.reqService();

          this.reqRandomGoods();
        }.bind(this))
        
      } else {
        wx.redirectTo({
          url: dict.pages.sharePintuan+'?actId=' + refreshId,
          complete: function () {
            refreshId = -1;
          }
        })
      }
    }.bind(this), 100)

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
    console.log('111')
    // onfire.un('refreshPage');
    // refreshId = -1;//还原变量，避免缓存
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    if (!this.data.showDialog) {
      this.reqService();
      this.refreshActList();
      this.reqRandomGoods();
    } else {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    console.log(e)
    var shareMsg;
    if (e.from == 'button') {
      shareMsg = {
        title: '【拼团活动】快来和我一起团~~~',
        path: dict.pages.sharePintuan+'?actId=' + this.data.actId,
        success: function (res) {
          // 转发成功
          console.log(res)
        },
        fail: function (res) {
          // 转发失败
          console.log(res)
        }
      }
    } else {
      shareMsg = {
        title: '【拼团活动】',
        path: dict.pages.pintuanDetail+'?actId=' + this.data.actGroupId + "&productId=" + this.data.goods.productId,
        success: function (res) {
          // 转发成功
          console.log(res)
        },
        fail: function (res) {
          // 转发失败
          console.log(res)
        }
      }
    }
    return shareMsg
  }
})