
import {host, util, common, onfire, dict, cl, storage} from '../../utils/server';
const TAG = storage.tabBar;

var selectId = -1;
// 1
var receviedTabId = -1;

Page({ //selTab
    data: { 
        selectId:-1,
        // 页面排列的数据
        card_datas:[],

        // 1样式
        hideOrShow: true,   // 分类显示隐藏
        randomtProducts: [],
        control: false,
        toolType: true,    // 是否需要等待tool回调
    },
    onToolFun:function(e){
        this.setData({ tool: e.detail })
    },
    onLoad: function(){},
    onShow: function(){
        this.setData({
            template: TAG('T_Sort'),
            tColor: TAG('T_Color'),
            tColorHelp: TAG('T_CHelp'),
        })
        this.requestData(TAG('T_Sort'))
    },
    onReady: function(){},
    onPullDownRefresh(){    // 下拉刷新-更新数据
        cl.PullDownRefresh(2000,'dark',this.rData)
    },
    rData(){    // 数据请求辅助
        if(this.data.toolType == 1){
            this.reqService();
            this.reqRecommond();
        } else {
            this.getCategory();
        }
    },
    requestData(ntype){
        // console.log(9090,ntype)
        if(ntype==1){
            this.reqService();
            this.reqRecommond();
        } else {
            this.getCategory();     // 请求两次
        }
    },
    // 显示隐藏
    hideOrShowType: function () {
        var flag = this.data.hideOrShow;
        this.setData({
            hideOrShow: !flag
        })
    },
    //------------------------------获取种类列表
    getCategory: function() {
    var that = this;
    var url = host.host + '/catelist.html'
  
    // 提示加载中
    util.showLoading('加载中....');
    util.httpsGet(url,function(data){
        wx.stopPullDownRefresh()
      // success
      var data = data.data;
      var config = data.config.image_resource;
      // 拼装数据
      for (var i = 0; i < data.cateList.length; i++) {
  
        var tier1 = new Object();
  
        tier1.id = data.cateList[i].id;
  
        tier1.title = data.cateList[i].name;
  
        if (i == 0) {
          that.setData({
            selectId: data.cateList[i].id
          })
   
  
        } 
  
        var tier1_childs = [];
        // 拼装第二层数组
        for (var x = 0; x < data.cateList[i].childs.length; x++) {
  
          var tier2 = new Object();
  
          tier2.item_title = data.cateList[i].childs[x].name;
  
          tier2.id = data.cateList[i].childs[x].id;
          var tier2_childs = []
  
          // 拼装第三层数组
  
          for (var y = 0; y < data.cateList[i].childs[x].childs.length; y++) {
  
            var tier3 = new Object();
  
            tier3.name = data.cateList[i].childs[x].childs[y].name;
  
            tier3.id = data.cateList[i].childs[x].childs[y].id;
            tier3.image = config + data.cateList[i].childs[x].childs[y].image;
                          
            tier2_childs[y] = tier3;
  
          }
  
          tier2.item_child = tier2_childs;
  
          tier1_childs[x] = tier2;
  
        }
  
        tier1.content_item_datas = tier1_childs;
  
        that.data.card_datas[i] = tier1;
  
      }
     
      that.setData({
  
        load_complete: true,
  
        card_datas: that.data.card_datas
  
      })
      console.log(that.data.card_datas)
      if (selectId != -1) {
        that.setData({
          selectId: selectId
        })
        selectId = -1;
      }
  
      wx.hideLoading();
  
    },function(data){})
    
    },

  //跳转到商品搜索

  JumpToGc3: function (event) {

    var keyword = event.currentTarget.dataset.keyword;

    var typeId = event.currentTarget.dataset.typeid;

    wx.navigateTo({
      url: '/pages/goods_type/goods_type?typeId=' + typeId + '&keyword=' + keyword,
    })
  },


  //跳转到二级分类
  JumpToGoodList:function(e){
      var urlParam = e.currentTarget.dataset.url;
      var url = "/pages/goodList/goodList?url=" + urlParam;
      util.navigateTo(url);

  },

  //////////////////////////----------标题选择
  title_click: function (event) {

    var id = event.currentTarget.dataset.id


    // 如果当前点击的标题和上次的一样 就结束
    if (this.data.selectId == id){
        return;
    }

    // 
    this.setData({

      selectId: id,

    })


  },
  
  onShareAppMessage: function () {
    // 用户点击右上角分享
    return {
      title: host.companyName, // 分享标题
      desc: host.desc, // 分享描述
      path: dict.pages.index // 分享路径
    }
  },

    // 789789
    // 跳转到商品列表
  jumpToCateDetail: function (e) {
    var cateId = e.currentTarget.dataset.cateid;
    util.navigateTo('/pages/goodList/goodList?url=' + cateId)
  },
  // 
  jumpToGoodDetail: function (e) {
    var productId = e.currentTarget.dataset.productid;
    util.navigateTo('/pages/goods_detail/goods_detail?productId=' + productId)
  },
  reqService: function () {
    var url = host.host + '/catelist.html';
    util.showLoading('加载中');
    util.httpsGet(url, function (data) {
        wx.stopPullDownRefresh()
      wx.hideLoading();
      var data = data.data;
      var config = data.config.image_resource;
      var cate_data = {
        titles: [],
        hideTitles: [],
      };
      var goods, tabId;
      data.cateList.forEach((cateItem, x) => {
        var title = {
          name: cateItem.name,
          id: cateItem.id,
          goods: [],
        }
        cateItem.childs.forEach((child) => {
          var good = {
            img: config + child.image,
            name: child.name,
            id: child.id
          }
          title.goods.push(good)
        })

        if (x < 4) {
          cate_data.titles.push(title);
        } else {
          cate_data.hideTitles.push(title)
        }
      })

      if (data.cateList.length != 0) {
        if (receviedTabId != -1) {
          cate_data.titles.forEach((title) => {
            //判断从首页跳转过来
            if (title.id == receviedTabId) {
              goods = title.goods;
              tabId = title.id;
              receviedTabId = -1;
            }
          })
        } else {
          goods = cate_data.titles[0].goods;
          tabId = cate_data.titles[0].id;
        }
        this.setData({
          tabId: tabId,
          goods: goods,
          cate_data: cate_data,
        })
      }
      this.setData({
        control: true
      })
    }.bind(this), function () { }, '请求分类接口')
  },
  // 跳转到商品列表
  jumpToCateDetail: function (e) {
    var cateId = e.currentTarget.dataset.cateid;
    util.navigateTo('/pages/goodList/goodList?url=' + cateId)
  },
  // 
  jumpToGoodDetail: function (e) {
    var productId = e.currentTarget.dataset.productid;
    util.navigateTo('/pages/goods_detail/goods_detail?productId=' + productId)
  },
  
  
  changeTab: function (e) {
    var tabid = e.currentTarget.dataset.tabid;
    util.log('切换分类列表', '当前分类id=' + tabid, '之前的分类Id' + this.data.tabId)
    this.data.cate_data.titles.forEach((title)=>{
      if (tabid == title.id) {
        this.data.goods = title.goods;
      }
    })
    this.data.cate_data.hideTitles.forEach((title) => {
      if (tabid == title.id) {
        this.data.goods = title.goods;
      }
    })

    this.setData({
      tabId: tabid,
      goods: this.data.goods
    })
  },
  reqRecommond: function () {
    // 商品推荐
    var url = host.host + '/product/randomt.html';
    util.httpsGet(url, function (data) {
      var data = data.data;
      var config = data.config.image_resource;
      var randomtProducts = [];//推荐列表
      data.randomtProducts.forEach((item)=>{
        var product = {
          name: item.name1,
          id: item.id,
          img: config + item.masterImg,
          price: common.toDecimal(item.malMobilePrice)
        }
        randomtProducts.push(product)
      })

      this.setData({
        randomtProducts: randomtProducts
      })
    }.bind(this), function () { }, '请求随便看看数据')
  },


  onUnload: function () {
    onfire.un('refreshNew');
    // tabId = -1;//还原变量，避免缓存
  },

})