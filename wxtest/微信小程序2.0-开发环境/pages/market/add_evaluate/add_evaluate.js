
import {host, util, common, onfire} from '../../../utils/server';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tColor: host.tColor,
    score: [1, 2, 3, 4, 5],//初始化分数数组，
    goodsScore: 5,//评价分数
    goodsDescScore: 5,//描述相符分数
    goodsServiceScore: 5,//服务态度
    goodsSendScore: 5,//发货速度
    content: '',
    photos: [],
    upImgIndex: 0,//当前上传图片下标
    photosPathInService: [],
    evluated: false
  },
    // 全局注入
    onToolFun:function(e){
        this.setData({
            tool: e.detail
        })
    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // https://test.wechat.cangluxmt.com/wechat/member/addcommentdetail.html?orderSn=18013115463392876428&productId=124582&productGoodsId=133839&ordersProductId=1967&sessionId=08338E037E08DCBD1A501DCEC111B0F2&agentId=279 http://test.image.cangluxmt.com/jcshopimage//279/images/seller/70/little/784f3b0a-9474-4328-9834-b352e098efe2.jpg LV INITIALES 双面腰带
    this.setData({
      goodsImg: options.goodsImg,
      goodsName: options.goodsName,
      orderSn: options.orderSn,
      productId: options.productId,
      productGoodsId: options.productGoodsId,
      ordersProductId: options.ordersProductId
    })

    this.reqService();
  },
  // 选择分数
  selScore: function (e) {
    if (this.data.evluated) {
      return;
    }
    var types = e.currentTarget.dataset.types;
    var value = e.currentTarget.dataset.value - 0;
    switch (types) {

      case '0':
        this.setData({
          goodsScore: value + 1
        })
        break;
      case '1':
        this.setData({
          goodsDescScore: value + 1
        })
        break;
      case '2':
        this.setData({
          goodsServiceScore: value + 1
        })
        break;
      case '3':
        this.setData({
          goodsSendScore: value + 1
        })
        break;
    }
  },

  choosePhotos: function () {
    var that = this;
    var chooseNum = 5 - this.data.photos.length;
    if (chooseNum != 0) {
      wx.chooseImage({
        count: chooseNum,
        sizeType: ["compressed"],
        success: function (res) {
          console.log(res)
          that.setData({
            photos: that.data.photos.concat(res.tempFilePaths)
          })
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    }

  },
  removePhoto: function (e) {
    var index = e.currentTarget.dataset.index;
    var photos = [];
    this.data.photos.forEach((photo, i) => {
      if (i != index) {
        photos.push(photo)
      }
    })

    this.setData({
      photos: photos
    })
  },

  //预览图片
  preImages: function (e) {
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.photos[index],
      urls: this.data.photos,
    })
  },

  reqService: function () {
    var url = host.host + '/member/addcommentdetail.html?orderSn=' + this.data.orderSn + '&productId=' + this.data.productId + '&productGoodsId=' + this.data.productGoodsId + '&ordersProductId=' + this.data.ordersProductId;
    util.httpsGetWithId(url, function (data) {
      if (data.data.comment) {
        // 未评论
        console.log('已评论')
        this.setData({
          evluated: true
        })
      } else {
        console.log('未评论')
      }
    }.bind(this), function () { }, '请求评价商品数据')
  },

  inputEvent: function (e) {
    this.setData({
      content: e.detail.value,
    })
  },
  addEvaluate: function () {
    if (common.checkStr(this.data.content)) {
      this.upLoadImgs();
    } else {
      util.showMsg('评论内容存在特殊符号(暂不支持表情)')
    }
  },

  addEval: function () {
    var url = host.host + '/member/savecomment.html'
    var messageData = {
      orderSn: this.data.orderSn,
      productId: this.data.productId,
      productGoodsId: this.data.productGoodsId,
      ordersProductId: this.data.ordersProductId,
      grade: this.data.goodsScore,//商品评价 星数
      description: this.data.goodsDescScore,//描述相符 星数
      serviceAttitude: this.data.goodsServiceScore,//态度服务 星数
      productSpeed: this.data.goodsSendScore,//发货速度 星数
      score: [this.data.goodsScore, this.data.goodsDescScore, this.data.goodsServiceScore, this.data.goodsSendScore],
      content: (this.data.content == '' ? '此用户没有填写评价' : this.data.content),
      images: this.data.photosPathInService.toString()
    }

    util.httpsPostWithId(url, messageData, function (data) {
      wx.hideLoading();
      onfire.fire('refreshEvalList', this.data.orderSn)
      util.showMsg('评价成功!', function () {

        wx.navigateBack({
          delta: 1,
        })
      })
    }.bind(this), function () {
      wx.hideLoading();

    }, '提交评论测试')
  },
  upLoadImgs: function (fc) {

    if (this.data.photos.length > 0) {
      var that = this;
      wx.showLoading({
        title: '上传中',
        mask: true,
      })
      util.getSessionId(function (sessionId) {
        var url = host.host + '/member/uploadFiles.html?agentId=' + host.agentId + '&sessionId=' + sessionId;
        var data = {
          sessionId: sessionId,
          sellerId: host.sellerId
        }
        wx.uploadFile({
          url: url,
          filePath: that.data.photos[that.data.upImgIndex],
          name: 'imgFile',
          header: { 'Content-Type': 'multipart/form-data' },
          formData: data,
          success: function (res) {
            console.log('上传了' + (that.data.upImgIndex + 1) + '张')
            var data = JSON.parse(res.data);
            if (res.statusCode == 200) {
              console.log(data)
              if (data.success) {
                that.data.photosPathInService.push(data.data);
                that.setData({
                  photosPathInService: that.data.photosPathInService,
                })
                if (that.data.upImgIndex < that.data.photos.length - 1) {
                  that.setData({
                    upImgIndex: that.data.upImgIndex + 1
                  })
                  that.upLoadImgs();
                } else {
                  that.setData({
                    upImgIndex: 0
                  })
                  that.addEval();
                }
              } else {
                util.showMsg(data.message)
              }
            }
          },
          fail: function (res) {
            console.log(res)
            console.log('上传了' + (that.data.upImgIndex + 1) + '张失败了')
            that.setData({
              upImgIndex: 0
            })
            wx.hideLoading();
            util.showMsg('上传图片失败，请检查网络后重试')
            
          },
          complete: function (res) {
            console.log('---完成----')
            console.log(res)
          }
        })
      })

    } else {
      this.addEval();
    }

  }
})