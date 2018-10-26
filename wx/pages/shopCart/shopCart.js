
import {host, util, common, cl, dict, storage} from '../../utils/server';
const TAG = storage.tabBar;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    price_total: 0,//商品总价
    sel_count: 0,//商品勾选数
    selAll: true,//是否全选
    tColor: host.tColor, 
    currentGoodsId:-1,
    productGoods: {},                   //要选择规格的货品
    posX: common.exchangeToPx(100), //删除按钮位移像素
    startX: 0,
    closeX: 0,//多个手指触碰滑动时设置scroll位置
    showDialog: false,
    DialogType: 0, //0选择配置  //1加入购物车
    //点击坐标判断上拉或下拉
    scroll_pos: 0,
    disTop: 0,
    touchX: 0,
    touchY: 0,
    endX: 0,
    endY: 0,
    flag: false,
    selNum: 1,
    control: false,
    cachedGoodsId: -1,//展开弹出框时，初始的货品id
    cachedAmount: 1,//展开弹出框时，初始的货品在购物车中选中的数量

  },
    // 全局注入
    onToolFun:function(e){
        this.setData({
            tool: e.detail
        })
    },
    onLoad(){

    },
    onShow: function () {
        this.setData({
            template: TAG('T_Car'),
            tColor: TAG('T_Color'),
            tColorHelp: TAG('T_CHelp'),
        })

        util.checkSsId(function () {
            this.reqService()
            this.reqRandomProduct();
        }.bind(this))
        
        this.setData({
            selAll: true,
        })
    },
    // 跳转到首页
    jumpToIndex: function () {
        cl.Router(2,{
            url: '/pages/index0/index0',
        })
    },
  // 选择样式
  sel_Style: function (e) {
    var that = this;
    var normid = e.currentTarget.dataset.normid;
    var pos = e.currentTarget.dataset.pos;
    // 选中的位置发生变化
    this.data.norms[pos].normChilds.forEach((normChild,x)=>{
      if (normChild.id == normid) {
        this.data.norms[pos].normChilds[x].sel = true;
      } else {
        this.data.norms[pos].normChilds[x].sel = false;
      }
    })

    // 循环拿选中的值
    var normAttrId = '';
    this.data.norms.forEach((normItem,x)=>{
      normItem.normChilds.forEach((normChild)=>{
        if (normChild.sel) {
          if (x != this.data.norms.length - 1) {
            normAttrId = normAttrId + normChild.id + ',';
          } else {
            normAttrId = normAttrId + normChild.id;
          }
        }
      })
    })

    var url = host.host + '/getGoodsInfo.html';
    var data = {
      productId: this.data.productGoods.productId,
      normAttrId: normAttrId
    }
    util.showLoading('加载中...')
    util.httpsPost(url, data, function (data) {
      wx.hideLoading()
      var data = data.data;

      if (data) {
        if (data.images == null || data.images == '') {
          data.images = that.data.productGoods.images
        }else{
          data.images = that.data.config + data.images
        }
        
        that.setData({
          productGoods: data,
          norms: that.data.norms
        })
      }
    }, function () { }, '选择样式')

  },

  // 弹出商品数量增加
  add: function () {

    if (this.data.selNum < this.data.productGoods.productStock) {
      this.data.selNum += 1
    }
    this.setData({
      selNum: this.data.selNum
    })

  },
  sub: function () {
    //弹出商品数量减少
    if (this.data.selNum > 1) {
      this.data.selNum -= 1
    }
    this.setData({
      selNum: this.data.selNum
    })

  },

  transEvent: function (e) {
    this.setData({
      flag: !this.data.flag
    })
  },

  touchStartEvent: function (e) {

    this.setData({
      touchX: e.changedTouches[0].clientX,
      touchY: e.changedTouches[0].clientY,
    })
  },


  touchEndEvent: function (e) {
    this.setData({
      endX: e.changedTouches[0].clientX,
      endY: e.changedTouches[0].clientY,
    })
    if (this.data.endY - this.data.touchY > 0) {
      this.setData({
        flag: true
      })
    } else if (this.data.endY - this.data.touchY < 0) {
      this.setData({
        flag: false
      })
    }
  },

  //输入框
  onInputEvent: function (e) {

  },
  //输入商品数量时，校验合法
  onblurEvent: function (e) {

    let cartId = e.currentTarget.dataset.cartid;
    let amount = 1;

    if (e.detail.value <= 0) {
      amount = 1;
    } else {
      amount = (e.detail.value - 0)
    }
    this.data.cart_data.shops.forEach((shop,i)=>{
      shop.goods.forEach((goodsItem,x)=>{
        if (goodsItem.cartId == cartId) {
          if (amount > goodsItem.stock) {
            amount = goodsItem.stock;
          }
          this.data.cart_data.shops[i].goods[x].amount = amount
        }
      })
    })

    var that = this;
    var url = host.host + '/cart/updateCartById.html'
    var data = {
      id: cartId,
      count: amount
    }
    util.showLoading('加载中')
    util.httpsPostWithId(url, data, function (data) {
      wx.hideLoading();
      if (data.success) {
        that.setData({
          cart_data: that.data.cart_data
        })
        that.price_total();
      } else {
        util.showMsg(data.message)
      }
    }, function () { })
  },
  //弹出选择框
  onClickdiaView: function (e) {
    //判断选中货品id
    let productId = e.currentTarget.dataset.productid;
    let goodId = e.currentTarget.dataset.goodid;
    let shopIndex = e.currentTarget.dataset.shopindex;
    let amount = e.currentTarget.dataset.amount;
    let shopCartId = e.currentTarget.dataset.cartid;
    if (productId == undefined) {
      this.setData({
        showDialog: !this.data.showDialog
      });
      return;
    }
    this.data.cart_data.shops[shopIndex].goods.forEach((goodsItem)=>{
      if (goodsItem.productGoods.id == goodId) {
        this.setData({
          productGoods: goodsItem.productGoods,
          currentGoodsId: goodsItem.productGoods.id,
          selNum: amount,
          shopCartId: shopCartId
        })
        var that = this;
        let url = host.host + '/productnorms/' + productId + '.html';
        util.showLoading('加载中..');
        util.httpsGet(url, function (data) {
          wx.hideLoading();
          var data = data.data;
          let config = data.image_resource;
          let norms = [];
          let currentNorm = that.data.productGoods.normAttrId.split(',');

          data.norms.forEach((normItem, x) => {
            let norm = {
              name: normItem.name,
              normChilds: []
            }
            normItem.attrList.forEach((attrItem) => {
              let normChild = {
                id: attrItem.id,
                name: attrItem.name,
                sel: (attrItem.id == currentNorm[x]),
              }
              norm.normChilds.push(normChild)
            })
            norms.push(norm)
          })

          that.setData({
            norms: norms
          })
        }, function () { }, '请求规格')
      }
    })

    this.setData({
      showDialog: !this.data.showDialog
    });

  },
  reqRandomProduct:function(){
    var that = this;
    var url = host.host + '/product/randomt.html';
    util.httpsGetWithId(url,function(data){
      var data = data.data;
      data.randomtProducts.forEach((product,i)=>{
        data.randomtProducts[i].malMobilePrice = common.toDecimal(product.malMobilePrice)
      })
      that.setData({
        config: data.config.image_resource,
        randomtProducts: data.randomtProducts
      })
    }, function () { }, '请求随机商品',"/pages/shopCart/shopCart")
  },
  //请求切换
  changeGoodsNorms: function (e) {
    //判断选中的货品id是不是和开始的一样，如果一样就不发请求
    if (this.data.currentGoodsId == this.data.productGoods.id){
      this.setData({
        showDialog: !this.data.showDialog,
        currentGoodsId:-1
      })
      return;
    }
    var url = host.host + '/cart/updateCartSpecById.html'
    var data = {
      id: this.data.shopCartId,
      productGoodsId: this.data.productGoods.id,
      count: this.data.selNum
    }
    var that = this;
    util.showLoading('加载中')
    util.httpsPostWithId(url, data, function (data) {
      wx.hideLoading();
      if (data.success) {
        that.reqService()
        that.setData({
          showDialog: !that.data.showDialog
        })

      } else {
        util.showMsg(data.message);
      }
    }, function () { }, '请求更新规格')
  },
  preSingleImage: function (e) {
    var that = this;
    var imgUrl = e.currentTarget.dataset.imgurl;
    wx.previewImage({
      current: imgUrl,
      urls: [imgUrl],
    })
  },

  //弹出窗滑动
  start: function (e) {
    this.setData({
      startX: e.changedTouches[0].clientX
    })
    if (this.data.moveId != e.currentTarget.dataset.moveid) {
      this.setData({
        moveId: -1,
      })
    }
  },
  end: function (e) {

    var dis = e.changedTouches[0].clientX - this.data.startX;
    if (dis > 0) {

      if (dis > -common.exchangeToPx(20)) {
        this.setData({
          moveId: -1,
        })
      } else {
        this.setData({
          moveId: e.currentTarget.dataset.moveid,
        })
      }

    } else if (dis < 0) {
      if (dis < -common.exchangeToPx(20)) {
        this.setData({
          moveId: e.currentTarget.dataset.moveid,
        })
      } else {
        this.setData({
          moveId: -1,
        })
      }

    }
    this.setData({
      closeX: 0
    })
  },





    
  // 跳转到热卖
  jumpToHotGoods: function () {
    util.navigateTo('/pages/hotGoods/hotGoods')
  },
  //跳转到商品详情页
  jumpToGoodsDetail: function (e) {
    var productId = e.currentTarget.dataset.productid;
    var url = "/pages/goods_detail/goods_detail?productId=" + productId;
    util.navigateTo(url);
  },
  pay: function (e) { 
    if (this.data.cart_data.shops == undefined || this.data.cart_data.shops.length == 0) {
      util.showMsg('当前购物车为空')
      return false;
    }
    if (this.data.sel_count == 0) {
      util.showMsg('请勾选对应的商品')
      return false;
    }
    if(e.detail.formId){
        util.markFormId(e.detail.formId);
    }
    wx.navigateTo({
      url: dict.pages.add_indent,
    })
  },
  reqService: function () {
    var that = this;
    var url = host.host + '/cart/detail.html';
    util.showLoading('加载中..')
    util.httpsGetWithId(url, function (data) {
      wx.hideLoading();
      // 拼接数据
      console.log('第2种样式', data)
      var data = data.data;
      var config = data.config.image_resource;
      var cart_data = {
        shops: [],//商店列表
      }
      // var cartListVOs = data.cartInfoVO.cartListVOs;

      data.cartInfoVO.cartListVOs.forEach((cartListVOsItem)=>{
        var shop = {
          id: cartListVOsItem.seller.id,
          name: cartListVOsItem.seller.sellerName,
          logo: config + cartListVOsItem.seller.sellerLogo,
          goods: [],
        }
        cartListVOsItem.cartList.forEach((cartItem) => {
 
          if (cartItem.productGoods.images != '' && cartItem.productGoods.images != null) {
            cartItem.productGoods.images = config + cartItem.productGoods.images
          } else {
            cartItem.productGoods.images = config + cartItem.product.masterImg
          }
          var good = {
            id: cartItem.product.id,//商品id
            cartId: cartItem.id,//购物车id
            img: cartItem.productGoods.images,//商品图片
            style: cartItem.productGoods.normName,
            name: cartItem.product.name1,//商品名称
            price: cartItem.productGoods.mallMobilePrice,//商品价格
            stock: cartItem.productGoods.productStock,//库存
            amount: cartItem.count,//商品数量
            hideDelBtn: true,//是否隐藏删除按钮
            productGoods: cartItem.productGoods //货品信息
          }
          // 判断是否选中商品
          if (cartItem.checked == 1) {
            good.isSel = true;
          } else {
            good.isSel = false;
          }
          shop.goods.push(good);
        })
        cart_data.shops.push(shop);
      })

      // for (var i = 0; i < cartListVOs.length; i++) {
      //   var shop = {
      //     id: cartListVOs[i].seller.id,
      //     name: cartListVOs[i].seller.sellerName,
      //     logo: config + cartListVOs[i].seller.sellerLogo,
      //     goods: [],
      //   }
      //   for (var x = 0; x < cartListVOs[i].cartList.length; x++) {
      //     var cartList = cartListVOs[i].cartList[x];
      //     if (cartList.productGoods.images != '' && cartList.productGoods.images != null) {
      //       cartList.productGoods.images = config + cartList.productGoods.images
      //     } else {
      //       cartList.productGoods.images = config + cartList.product.masterImg
      //     }
      //     var good = {
      //       id: cartList.product.id,//商品id
      //       cartId: cartList.id,//购物车id
      //       img: cartList.productGoods.images,//商品图片
      //       style: cartList.productGoods.normName,
      //       name: cartList.product.name1,//商品名称
      //       price: cartList.productGoods.mallMobilePrice,//商品价格
      //       stock: cartList.productGoods.productStock,//库存
      //       amount: cartList.count,//商品数量
      //       hideDelBtn: true,//是否隐藏删除按钮
      //       productGoods: cartList.productGoods //货品信息
      //     }
      //     // 判断是否选中商品
      //     if (cartList.checked == 1) {
      //       good.isSel = true;
      //     } else {
      //       good.isSel = false;
      //     }
      //     shop.goods[x] = good;
      //   }
      //   cart_data.shops[i] = shop;
      // }
      that.setData({
        cart_data: cart_data,
        config: config,
        control: true,
      })
      that.price_total()//计算勾选和总价
      that.isSelAll();
    }, function () {
      that.setData({
        control: true
      })
      }, '请求购物车数据', "/pages/shopCart/shopCart")
  },
  // 商品加
  amount_change: function (e) {
    // 商店id
    var shopId = e.currentTarget.dataset.shopid;
    // 购物车中商品的Id
    var cartid = e.currentTarget.dataset.cartid;
    //变化类型 加或减 1 加  0 减
    var typeC = e.currentTarget.dataset.type;
    var amount;
    for (var x = 0; x < this.data.cart_data.shops.length; x++) {
      var shop = this.data.cart_data.shops[x];
      for (var y = 0; y < shop.goods.length; y++) {
        var good = shop.goods[y];
        if (cartid == good.cartId) {
          if (typeC == 1 && this.data.cart_data.shops[x].goods[y].amount < this.data.cart_data.shops[x].goods[y].stock) {
            this.data.cart_data.shops[x].goods[y].amount += 1
          } else if (typeC == 0 && this.data.cart_data.shops[x].goods[y].amount > 1) {
            this.data.cart_data.shops[x].goods[y].amount -= 1
          } else {
              return false;
          }
          amount = this.data.cart_data.shops[x].goods[y].amount;
        }
      }
    }
    var that = this;
    var url = host.host + '/cart/updateCartById.html'
    var data = {
      id: cartid,
      count: amount
    }
    util.showLoading('加载中')
    util.httpsPostWithId(url, data, function (data) {
      wx.hideLoading();
      if (data.success) {
        that.setData({
          cart_data: that.data.cart_data
        })
        that.price_total();
      }
    })
  },
  // 计算价格和勾选数量
  price_total: function () {
    var sel_count = 0;
    var price_total = 0;
    for (var i = 0; i < this.data.cart_data.shops.length; i++) {
      var shop = this.data.cart_data.shops[i];
      for (var x = 0; x < shop.goods.length; x++) {
        if (shop.goods[x].isSel || this.data.selAll) {
          sel_count += 1;
          price_total = common.accAdd(price_total, common.accMul(shop.goods[x].price, shop.goods[x].amount))
        }
      }
    }
    this.setData({
      sel_count: sel_count,
      price_total: price_total
    })
  },
  // 判断是否全选
  isSelAll: function () {
    var selAll = true;
    for (var i = 0; i < this.data.cart_data.shops.length; i++) {
      var shop = this.data.cart_data.shops[i];
      for (var x = 0; x < shop.goods.length; x++) {
        if (!shop.goods[x].isSel) {
          selAll = false;
        }
      }
    }
    this.setData({
      selAll: selAll
    })
  },
  // 勾选
  sel_good: function (e) {
    var that = this;
    var cartid = e.currentTarget.dataset.cartid;//购物车商品id
    var check = -1;

    // 勾选对应的商品，并且判断是否全选，
    for (var i = 0; i < this.data.cart_data.shops.length; i++) {
      var shop = this.data.cart_data.shops[i];
      for (var x = 0; x < shop.goods.length; x++) {
        if (cartid == shop.goods[x].cartId) {
          if (shop.goods[x].isSel) {
            this.data.cart_data.shops[i].goods[x].isSel = false;
            check = 0;
          } else {
            this.data.cart_data.shops[i].goods[x].isSel = true;
            check = 1;
          }
        }
      }
    }
    // 请求勾选
    var url = host.host + '/cart/cartchecked.html?id=' + cartid + '&checked=' + check;
    util.httpsGetWithId(url, function (data) {
      if (data.success) {
        //判断当前的是否全选
        that.isSelAll();
        // 计算勾选的价格
        that.price_total();
        that.setData({
          cart_data: that.data.cart_data,
        })
      }
    }, function () { }, "勾选商品", "/pages/shopCart/shopCart")
  },
  //全选
  selAll: function () {
    var checked;
    if (this.data.selAll) {

      checked = 0;
    } else {

      checked = 1;
    }
    this.data.selAll = !this.data.selAll;
    for (var i = 0; i < this.data.cart_data.shops.length; i++) {
      var shop = this.data.cart_data.shops[i];
      for (var x = 0; x < shop.goods.length; x++) {
        if (this.data.selAll) {
          this.data.cart_data.shops[i].goods[x].isSel = true;
        } else {
          this.data.cart_data.shops[i].goods[x].isSel = false;
        }

      }
    }

    var url = host.host + '/cart/cartcheckedall.html?checked=' + checked
    var that = this;
    util.httpsGetWithId(url, function (data) {
      if (data.success) {
        that.price_total();
        that.setData({
          selAll: that.data.selAll,
          cart_data: that.data.cart_data,
        })
      }
    }, function () { }, "全选按钮", "/pages/shopCart/shopCart")
  },
  // 删除商品
  del_good: function (e) {
    var cartid = e.currentTarget.dataset.cartid;
    var that = this;
    util.showModal('提示', '是否在购物车中移除该商品?', '取消', '确认', function () {
      var url = host.host + '/cart/deleteCartById.html?id=' + cartid;
      util.showLoading('删除中...')
      util.httpsGetWithId(url, function (data) {
        //删除成功后再请求一遍服务器
        wx.hideLoading();
        that.reqService();
      })
    }, function () { }, "删除商品", "/pages/shopCart/shopCart")

  },
})







