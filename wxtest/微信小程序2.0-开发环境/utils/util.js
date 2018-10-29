
var host = require('host.js')
var common = require('common.js')
var Promise = require('./plug-in/es6-promise.js')
import cl from "fillter";
import window from "window";
// 主机号
//登录对象池
//是否正在登录
var _isLogin = false;
var _tempPageRoute = []
let _i_count = 0;
// 请求回调
var getSsid = false;
var postSsid = false;    // 获取ssid后重新进行请求
// -------------------登陆
var lastPageRoute = '';
var lastReloadTime = 0;
function reqLogin(fc, callType, pageRoute) {    // 容错处理
    // if(cl){
    //     cl.WxSsid().Ssid()
    // } else {
    // }
    window.MoniOBJ.Authorize = true;
}

// 网络请求-防止多重点击
const HTTP = [];
const URLTIME = [];
function SET_TIME(_url, _fn){
    // 判断请求是否重复
    if ( HTTP.includes(_url) ) return false;
    else HTTP.push(_url);
    URLTIME[HTTP.indexOf(_url)] = setTimeout(()=>{
        if( HTTP.includes(_url) ){
            CLEAR_TIME(_url)
        } 
        clearTimeout(URLTIME[HTTP.indexOf(_url)])
    },200)
    return _fn
}
// 请求结束回调-清除机制
function CLEAR_TIME(_url){
    var id = HTTP.indexOf(_url);
    id >=0 ? HTTP.splice(id,1) : false;
}


function wx2Ssid(){
    console.log(getSsid, postSsid)
    if(getSsid){
        httpsGetWithId(getSsid[1],getSsid[2],getSsid[3],getSsid[4],getSsid[5])
        getSsid = false;
    }
    if(postSsid){
        httpsGetWithId(postSsid[1],postSsid[2],postSsid[3],postSsid[4],postSsid[5])
        postSsid = false;
    }
}

/**
 * title:toast标题
 * showType:显示icon类型 true 或 false
 * fc:完成时回调的方法
 */
function _checkReload(pageUrl) {
  let flag = true;
  if (pageUrl == lastPageRoute) {
    if (new Date().getTime() - lastReloadTime < 3000) {
      flag = false;
    }
  }
  console.log('重新打开页面' + flag)
  return flag
}
function showToast(title, showType, fc) {
  wx.showToast({
    title: title,
    image: (showType == true || showType == undefined) ? '' : '/images/dax.png',
    complete: function (res) {
      typeof fc == "function" && fc()
    },
  })
}

// 检查是否授权
function checkAuthSetting(fc, fb) {
  wx.hideLoading();
  var that = this;
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.userInfo']) {
        wx.showModal({
          title: '提示',
          content: '检测到当前授权登录失败，部分功能将不能使用，是否重新授权？',
          showCancel: true,
          success: function (res) {
            if (res.confirm) {
              if (wx.openSetting) {
                wx.openSetting({
                  success: function (res) {
                    if (res.authSetting["scope.userInfo"]) {//如果用户重新同意了授权登录
                      // 当登陆过时时重新登陆
                      reqLogin(function () {
                        typeof fc == "function" && fc()
                      }, 1)
                    }
                  },
                })
              }
            }
          },
        })
      } else {
        typeof fb == "function" && fb()
      }
    }
  })
}
// 跳转方法
function navigateTo(url) {
  if (url == '' || url == undefined) {
    return;
  }
  wx.navigateTo({
    url: url,
    success: function (res) { },
    fail: function (res) {
      wx.switchTab({
        url: url,
      })
    },
  })
}
// orderId：订单id；
// money: 支付的钱数
// describe：商品描述
// that : 调用此方法所在的page对象
// successJump:支付后无论失败或成功都会跳转的页面(输入正确的付款密码后)
function reqPay(paySn, money, describe, successCallBack, failCallBack) {
  var that = this;
  if (describe == '' || describe == undefined || describe == null) {
    describe = host.companyName
  }
  this.getSessionId(function (ssId) {
    wx.login({
      success: function (res) {

        var code = res.code;

        var data = {
          optionsRadios: 'wxpay',
          fromType: '1',
          // 订单id
          paySn: paySn,
          // 要付款数
          money: money,
          // money: 1,
          // 登陆获取的code
          code: code,
          // 商品描述
          describe: describe,
          // 用户id
          sessionId: ssId,
        }

        var url = host.host + '/payindex.html';
        httpsPost(url, data, function (data) {
            console.log('post',url)
          wx.hideLoading();

          if (data.success) {

            wx.requestPayment({
              timeStamp: data.data.timeStamp,
              nonceStr: data.data.nonceStr,
              package: data.data.package,
              signType: 'MD5',
              paySign: data.data.sign,
              success: function (res) {
                typeof successCallBack == "function" && successCallBack()
              },
              fail: function (res) {
                typeof failCallBack == "function" && failCallBack()
              },
            })
          } else {
            wx.hideLoading();
            showMsg(data.message)
          }
        }, function (data) {
          // 请检查网络链接
          showMsg('支付失败，请检查您的网络')
        }, '支付请求')
      },
    })
  })
}
// 订单界面支付
function repeatPay(id, orderSn, money, describe, successCallBack, failCallBack) {
  var that = this;
  describe = host.companyName
  wx.login({
    success: function (res) {
      var code = res.code;
      var data = {
        optionsRadios: 'wxpay',
        fromType: '2',
        orderSn: orderSn,
        money: money,          // 要付款数
        code: code,                   // 登陆获取的code
        describe: describe,          // 商品描述
        id: id
      }
      var url = host.host + '/payindex.html';
      httpsPostWithId(url, data, function (data) {
        wx.hideLoading();
        if (data.success) {
          wx.requestPayment({
            timeStamp: data.data.timeStamp,
            nonceStr: data.data.nonceStr,
            package: data.data.package,
            signType: 'MD5',
            paySign: data.data.sign,
            success: function (res) {
              log('调用支付api', res)
              typeof successCallBack == "function" && successCallBack()
            },
            fail: function (res) {
              typeof failCallBack == "function" && failCallBack()
            },
          })
        } else {
          showMsg(data.message)
        }

      }, function (data) {

      }, '重新支付网络请求')
    },
  })

}
// 积分支付 
function integralPay(paysn, that, orderId, successUrl, failUrl) {
  var that = this;
  var url = host.host + '/order/success.html?paySn=' + paysn;

  this.httpsGetWithId(url, function (data) {
    wx.hideLoading();
    var url = '';
    if (data.success) {
      showModal('提示', '支付成功,是否前往订单列表?', '去首页', '订单列表', function () {
        url = '/pages/my_indent/my_indent';
        wx.redirectTo({
          url: url,
        })
      }, function () {
        var url = '/pages/index0/index0';
        wx.switchTab({
          url: url,
        })
      })
    } else {
      showMsg(data.message)
    }
  }, function () {

  }, '支付数据')
}

// 记录历史消息
function markHistory(productId) {
  var that = this;
  var url = host.host + '/product_look_log.html?productId=' + productId
  httpsGetWithId(url, function (data) {
    log('记录商品历史记录成功', 'productId=' + productId)
  }, function () {
    log('记录商品历史失败', 'productId=' + productId)
  })
}

//////网络请求GET
function https(url, callback, logMsg) {
    console.log('htts',url)
  if (common.isConcat(url)) {
    url = url.concat('&agentId=' + host.agentId);
  } else {
    url = url.concat('?agentId=' + host.agentId);
  }
    let _fn = () => {
        wx.request({
            url: url,
            method: 'GET',
            header: {
            'Content-Type': 'application/json;charset=UTF-8'
            },
            success: function (res) {
                CLEAR_TIME(url)
            log(logMsg, url, res.data)
            callback(res.data);
            },
            fail: function () {
                CLEAR_TIME(url)
            }
        })
    }
    // 防止多重点击
    try { SET_TIME(url, _fn)() } catch (e) {}
}


function httpsGet(url, callback, fail_event, logMsg) {

  var that = this;
  wx.getNetworkType({
    success: function (res) {
      var networkType = res.networkType;
      if (networkType == 'none') {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        showMsg('当前无网络，请检查网络配置')
      } else {
            if (common.isConcat(url)) {
            url = url.concat('&agentId=' + host.agentId + '&miniappId=' + host.miniappId);
            } else {
            url = url.concat('?agentId=' + host.agentId + '&miniappId=' + host.miniappId);
            }

            
            let _fn = () => {
                wx.request({
                    url: url,
                    method: 'GET',
                    header: {
                        'Content-Type': 'application/json;charset=UTF-8'
                    },
                    success: function (res) {
                        // log(logMsg, url, res.data)
                        CLEAR_TIME(url)
                        wx.stopPullDownRefresh();
                        if (res.data.data == false && !(res.data.data instanceof Array)) {
                        // 当登陆过时时重新登陆
                        reqLogin(function () {
                            typeof callback == "function" && callback(res.data)
                        }, 1)
                        } else {
                        typeof callback == "function" && callback(res.data)
                        }
                    },
                    fail: function (res) {
                        wx.hideLoading();
                        CLEAR_TIME(url)
                        wx.stopPullDownRefresh();
                        // showToast('网络错误', false)
                        typeof fail_event == "function" && fail_event(res.data)
                    }
                })
            }
            // 防止多重点击
            try { SET_TIME(url, _fn)() } catch (e) {}
      }
    },
  })

}
/**
 * _that:是否登陆同步
 */
// 网络请求GET带ssId
var max = 5;
var closetm;
// 网络请求GET
function httpsGetWithId(url, callback, fail_event, logMsg, pageRoute) {
    getSsid = ['httpsGetWithId', url, callback, fail_event, logMsg, pageRoute];

  var that = this;
  var _tempUrl = url;
  console.log('get请求',url)
  wx.getNetworkType({
    success: function (res) {
      var networkType = res.networkType;
      
      if (networkType == 'none') {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        showMsg('当前无网络，请检查网络配置')
      } else {
          getSessionId(function (ssId) {
          if (common.isConcat(url)) {
            url = url.concat('&sessionId=' + ssId + '&agentId=' + host.agentId)
          } else {
            url = url.concat('?sessionId=' + ssId + '&agentId=' + host.agentId)
          }
          
          let _fn = () => {
            wx.request({
                url: url,
                method: 'GET',
                header: {
                'Content-Type': 'application/json;charset=UTF-8'
                },
                success: function (res) {
                    CLEAR_TIME(url)
                log(logMsg, url, res.data)
                wx.stopPullDownRefresh();

                if (!res.data) {
                    // 当登陆过时时重新登陆
                    reqLogin(function () {
                    wx.hideLoading();
                    if (pageRoute) {
                        if (_checkReload(pageRoute)) {
                        wx.redirectTo({
                            url: pageRoute,
                            success: function () {
                            lastPageRoute = pageRoute;
                            lastReloadTime = new Date().getTime();
                            },
                            fail: function (res) {
                            console.log(res)
                            wx.reLaunch({
                                url: pageRoute,
                                success: function () {
                                lastPageRoute = pageRoute;
                                lastReloadTime = new Date().getTime();
                                }
                            })
                            }
                        })
                        }
                        else {

                        }
                    }
                    }, 1, pageRoute)
                } else {

                    typeof callback == "function" && callback(res.data)
                }
                },
                fail: function (res) {
                    CLEAR_TIME(url)
                wx.hideLoading();
                wx.stopPullDownRefresh();
                //   showToast('网络错误', false)
                typeof fail_event == "function" && fail_event(res.data)
                },
                complete: function (res) {
                    console.log(res)
                },
            })
          }
          // 防止多重点击
          try { SET_TIME(url, _fn)() } catch (e) {}

        }, function () {
          reqLogin(function () {
            wx.hideLoading();
            if (pageRoute) {
              if (_checkReload(pageRoute)) {
                wx.redirectTo({
                  url: pageRoute,
                  success: function () {
                    lastPageRoute = pageRoute;
                    lastReloadTime = new Date().getTime();
                  },
                  fail: function (res) {
                    console.log(res)
                    wx.reLaunch({
                      url: pageRoute,
                      success: function () {
                        lastPageRoute = pageRoute;
                        lastReloadTime = new Date().getTime();
                      },
                    })
                  }
                })
              }
            }

          }, 1, pageRoute)
        })
      }
    },
  })
}

// 网络请求POST带上sessionId
function httpsPostWithId(url, data, callback, fail_event, logMsg) {
    postSsid = ['httpsPostWithId', url, data, callback, fail_event, logMsg];
  var that = this;
  getSessionId(function (ssId) {
    data.sessionId = ssId;
    data.agentId = host.agentId;

    let _fn = () => {
        wx.request({
        url: url,
        data: data,
        header: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        method: 'POST',
        success: function (res) {
            CLEAR_TIME(url)
            log(logMsg, url, data, res.data)
            wx.stopPullDownRefresh();
            if (res.data == false && !(res.data instanceof Array)) {
            // 当登陆过时时重新登陆
            console.log('重新登录')

            reqLogin(function () {
                typeof callback == "function" && callback(res.data)
            }, 1)
            } else {
            typeof callback == "function" && callback(res.data)
            }
        },
        fail: function (res) {
            CLEAR_TIME(url)
            wx.hideLoading();
            wx.stopPullDownRefresh();
            // showToast('网络错误', false)
            typeof fail_event == "function" && fail_event(res.data)
        },
        })
    }
        // 防止多重点击
        try { SET_TIME(url, _fn)() } catch (e) {}


  })

}
// 网络请求POST
function httpsPost(url, data, callback, fail_event, logMsg) {
    if(url.includes('wxlogin.html')){
        data['pcode'] = wx.getStorageSync('cl-QRcode');
    }
  var that = this;
  data.agentId = host.agentId;
//   data.agentId = 379;
    let _fn = () => {
        wx.request({
            url: url,
            data: data,
            header: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
            method: 'POST',
            success: function (res) {
                CLEAR_TIME(url)
            log(logMsg, url, data, res.data)
            wx.stopPullDownRefresh();
            if (res.data.data == false && !(res.data.data instanceof Array)) {
                // 当登陆过时时重新登陆
                reqLogin(function () {
                typeof callback == "function" && callback(res.data)
                }, 1)
            } else {
                typeof callback == "function" && callback(res.data)
            }
            },
            fail: function (res) {
                CLEAR_TIME(url)
            wx.hideLoading();
            wx.stopPullDownRefresh();
            //   showToast('网络错误', false)
            typeof fail_event == "function" && fail_event(res)
            },
        })
    }
    // 防止多重点击
    try { SET_TIME(url, _fn)() } catch (e) {}
}
// 获取SSID
function getSessionId(fc, fb) {
  wx.getStorage({
    key: 'ssId',
    success: function (res) {
      var sessionId = res.data;
      typeof fc == "function" && fc(sessionId)
    },
    fail: function (res) {
      typeof fb == "function" && fb()
    }
  })
}
//多参数输出日志
function log() {
  if (host.debugMode) {
    if (arguments.length == 0) {
      return;
    } else {
      if (arguments.length == 1) {
        console.log(arguments[0])
      } else {
        if (arguments[0] != undefined) {
          console.log('----------------' + arguments[0] + '-----------------')
        }
        for (var i = 1; i < arguments.length; i++) {
          console.log(arguments[i])
        }
        if (arguments[0] != undefined) {
          console.log('----------------' + arguments[0] + '-----------------')
        }
      }
    }
  }
}
function convertHtmlToText(inputText) {//不分行，用于tips
  var returnText = "" + inputText;
  returnText = returnText.replace(/<\/div>/ig, '');
  returnText = returnText.replace(/<\/li>/ig, '');
  returnText = returnText.replace(/<li>/ig, ' * ');
  returnText = returnText.replace(/<\/ul>/ig, '');
  //-- remove BR tags and replace them with line break
  returnText = returnText.replace(/<br\s*[\/]?>/gi, "");
  //-- remove P and A tags but preserve what's inside of them
  returnText = returnText.replace(/<p.*?>/gi, "");
  returnText = returnText.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 ($1)");
  //-- remove all inside SCRIPT and STYLE tags
  returnText = returnText.replace(/<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, "");
  returnText = returnText.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi, "");
  //-- remove all else
  returnText = returnText.replace(/<(?:.|\s)*?>/g, "");
  //-- get rid of more than 2 multiple line breaks:
  returnText = returnText.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, "");
  //-- get rid of more than 2 spaces:
  returnText = returnText.replace(/ +(?= )/g, '');
  //-- get rid of html-encoded characters:
  returnText = returnText.replace(/ /gi, " ");
  returnText = returnText.replace(/&/gi, "&");
  returnText = returnText.replace(/"/gi, '"');
  returnText = returnText.replace(/</gi, '<');
  returnText = returnText.replace(/>/gi, '>');
  return returnText;
}
function HtmlToText(inputText) {//分行，用于文章
  var returnText = "" + inputText;
  returnText = returnText.replace(/<\/div>/ig, '\r\n');
  returnText = returnText.replace(/<\/li>/ig, '\r\n');
  returnText = returnText.replace(/<li>/ig, ' * ');
  returnText = returnText.replace(/<\/ul>/ig, '\r\n');
  //-- remove BR tags and replace them with line break
  returnText = returnText.replace(/<br\s*[\/]?>/gi, "\r\n");
  //-- remove P and A tags but preserve what's inside of them
  returnText = returnText.replace(/<p.*?>/gi, "\r\n");
  returnText = returnText.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, " $2 ");
  //-- remove all inside SCRIPT and STYLE tags
  returnText = returnText.replace(/<script.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/script>/gi, "");
  returnText = returnText.replace(/<style.*>[\w\W]{1,}(.*?)[\w\W]{1,}<\/style>/gi, "");
  //-- remove all else
  returnText = returnText.replace(/<(?:.|\s)*?>/g, "");
  //-- get rid of more than 2 multiple line breaks:
  returnText = returnText.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/gim, "\r\n\r\n");
  //-- get rid of more than 2 spaces:
  returnText = returnText.replace(/ +(?= )/g, '');
  //-- get rid of html-encoded characters:
  returnText = returnText.replace(/ /gi, " ");
  returnText = returnText.replace(/&/gi, "&");
  returnText = returnText.replace(/"/gi, '"');
  returnText = returnText.replace(/</gi, '<');
  returnText = returnText.replace(/>/gi, '>');
  return returnText;
}
//// 请求数据等待交互
function showLoading(title) {//等待
  wx.showLoading({
    title: title,
    mask: true
  });
}
function dataOk() {//加载完成
  wx.hideLoading()
}
//弹出提示框
function showMsg(content, fc) {
  wx.showModal({
    title: '提示',
    content: content,
    showCancel: false,
    confirmColor: host.tColor,
    success: function () {
      typeof fc == "function" && fc()
    }
  })
}
//单张图片预览
function previewImage(e) {
  var url = e.currentTarget.dataset.imgurl;
  wx.previewImage({
    current: url,
    urls: [url],
  })
}
// 弹出提示框
function showModal(title, content, cancelText, confirmText, confirmEvent, cancelEvent) {
  console.log('Modal')
  wx.showModal({
    title: title,
    content: content,
    showCancel: true,
    cancelText: cancelText,
    cancelColor: '#333',
    confirmText: confirmText,
    confirmColor: host.tColor,
    success: function (res) {
      if (res.confirm) {
        typeof confirmEvent == "function" && confirmEvent()
      } else {
        typeof cancelEvent == "function" && cancelEvent()
      }
    },
  })
}
// 获取当前地址
function getLocation(fc) {
  var that = this;
  wx.getLocation({
    type: 'wgs84',
    success: function (res) {
      console.log(res)
      var url = host.host + '/guides/gcoder?coordinate=' + res.latitude + ',' + res.longitude;
      httpsGet(url, function (data) {
        console.log(common.removeStr(data.data.result.ad_info.province) + '------------' + common.removeStr(data.data.result.ad_info.city))
        typeof fc == "function" && fc(data)
      }, function () {
        showMsg('当前定位失败!')
      }, '定位信息')
    },
    fail: function (res) {
      console.log(res)
      if (res.errMsg == 'getLocation:fail:auth denied') {
        showModal('提示', '是否授权定位功能?', '取消', '授权', function () {
          if (wx.openSetting) {
            wx.openSetting({
              success: function (res) {
                if (res.authSetting["scope.userLocation"]) {//如果用户重新同意了授权登录
                  // 当登陆过时时重新登陆
                  getLocation(fc);
                }
              },
            })
          }
        }, function () { }
        )
      } else if (res.errMsg == 'getLocation:fail:system permission denied') {

      }
    },
  })
}

//无论promise对象最后状态如何都会执行
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};
function wxPromisify(fn) {
    
  return function (obj = {}) {

    return new Promise((resolve, reject) => {

      obj.success = function (res) {
        //成功
        // console.log('成功')
        resolve(res)
      }
        obj.fail = function (res) {
            //失败
            console.log('失败', res)
            reject(res)
        }
      fn(obj)
    })
  }
}
function getPromisifySimple(fn) {
  return function (obj = {}) {

    return new Promise((resolve, reject) => {

      fn(obj)
    })
  }
}

function checkSsId(fb) {
  var url = '/member/islogin.html';
  wxGetStorage('ssId').then(res => {
    console.log('检查ssid的值',res)
    url = host.host + url.concat((common.isConcat(url) ? '&' : '?') + 'sessionId=' + res.data + '&agentId=' + host.agentId);
    return wxRequestGet(url);
  }, res => {
    login(function () {
        checkSsId(fb)
    }).then(res => {
      typeof fb == "function" && fb()
    }).catch(res=>{
        console.log('login错误1', '进入页面检查无data.success,既用户没有授权个人信息')
        if(_i_count<1){
            _i_count++;
            reqLogin()
        } else {
            _i_count=0;
            cl.Router(4,{delta:1})
        }
    })
  }).catch(function (e) {
    console.log('获取ssId失败aa')
  }).then(res => {
    if (res.data == false) {
      login(function () {
        checkSsId(fb)
      }).then(res => {
        typeof fb == "function" && fb()
      }).catch(res=>{
        console.log('login错误2')
    })
    } else if (res.data.success) {
      typeof fb == "function" && fb()
    }
  }, error => {
    console.log(error)
  }).catch(function (e) {

  })
}
function login(fb, fc) {
    var fbfc = [fb,fc];
  var code = '';

  return new Promise((resolve, reject) => {

    var networkType = wxGetNetworkType();

    networkType().then(res => {

      var networkType = res.networkType;

      if (networkType == 'none') {

        wx.stopPullDownRefresh();
        wx.hideLoading();
        showMsg('当前无网络，请检查网络配置')

      } else {

        var codeData = wxLogin();

        codeData().then(resCode => {
          code = resCode.code;
          return resCode
        })
          .then(res => {
            // var userInfo = wxGetUserInfo();
            return wx.getStorageSync('userInfo');
          })
          .then(res => {
            console.log(res)
            if (res) {
              wx.setStorageSync('userInfo', res)
              var datas = {
                agentId: host.agentId,
                code: code,
                nickname: res.nickName,
                profilePhoto: res.avatarUrl,
              }
              var url = host.host + '/wechat/memberWxsign/wxlogin.html';
              return wxHttpsPost(url, datas);
            } else {
                reqLogin()
            }
          }, res => {
            /**
             * 获取用户信息失败
             */
            console.log('获取用户信息失败')
            throw new Error('getUserInfoDeny')
          })
          .then(res => {
              console.log("打印是否成功",res)
            if (res && res.data) {

                if (res.data.success) {
                    console.log('登录成功')
                    wx.setStorageSync('ssId', res.data.data.ssid)
                    resolve(res.data)
                } else {
                    reject()
                }
            } else {
                console.log('登录失败')
            }
          }
          ).catch(function (e) {
            console.log(e.message)
            reqLogin()
          })
      }
    })

  })

}
function wxLogin() {
  return wxPromisify(wx.login)
}
function wxGetUserInfo() {
  return wxPromisify(wx.getUserInfo)
}
function wxGetNetworkType() {

  return wxPromisify(wx.getNetworkType)
}
function wxHttpsPost(url, data) {
  var wxHttpsPost = wxPromisify(wx.request);

  return wxHttpsPost({
    url: url,
    data: data,
    header: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    method: 'POST',
    complete: function (res) {
      log('Post请求', res)
      console.log(url, data)
    },
  })
}
function wxHttpsGetWithId(url) {

  return new Promise((resolve, reject) => {
    // resolve();
    // reject();
    var networkType = wxGetNetworkType();
    var req = networkType().then(res => {
      /**
       * 当网络可用时
       */
      if (res.networkType != 'none') {
        return wxGetStorage('ssId')
      } else {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        showMsg('当前无网络，请检查网络配置')
      }
    })
      .then(res => {
        console.log(res)
        /**
         * 当登录后
         */
        url = host.host + url.concat((common.isConcat(url) ? '&' : '?') + 'sessionId=' + 'aaaa' + '&agentId=' + host.agentId);
        return wxRequestGet(url);
      }, res => {
        /**
         * 获取不到ssId时
         */
        console.log(res)
      })
      .then(res => {
        console.log(res)
        log('网络请求', res)

        if (res.data === false) {
          reject()
          /**
           * 重新登录
           */
        } else {
          resolve(res.data)
        }
      }, res => {
        /**
         * 当网络请求失败时
         */
        wx.hideLoading();
        wx.stopPullDownRefresh();
        // showToast('网络错误', false)
      })
  })
}
function wxRequestGet(url) {

  var wxRequestGet = wxPromisify(wx.request);
  return wxRequestGet({
    url: url,
    method: 'GET',
    header: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
  })
}
/**
 * 獲取
 */
function wxGetStorage(key) {
  var wxGetStorage = wxPromisify(wx.getStorage);
  return wxGetStorage({
    key: key
  })
}
/**
 * 获取用户信息
 */
function getUserInfo(fb) {
  wxGetStorage('userInfo').then(res => {
    console.log('拿到了...')
    console.log(res)
    typeof fb == "function" && fb(res.data)
  }, res => {
    login(function () {
      getUserInfo(fb)
    }).then(res => {
      getUserInfo(fb)
    }).catch(res=>{
        console.log('login错误3')
    })
  })
}

var lastLoginTime;
function _checkLastLogin() {
  let flag = true;
  if (new Date().getTime() - lastLoginTime < 3000) {
    flag = false;
  }
  return flag;
}
//自己写的
//封装登录
function nowLogin(){
  var userInfo = wx.getStorageInfoSync('userInfo')
  var nickname = userInfo.nickName;
  var avatarUrl = userInfo.avatarUrl;
  wx.login({
    success: function (res) {
      //发送请求获取登录的code
      if (res.code) {
        var code = res.code;
        var options = {
          agentId: host.agentId,
          nickname: nickname,
          profilePhoto: avatarUrl,
          code: code
        }
      }
      var url = host.host + '/wechat/memberWxsign/wxlogin.html';
       httpsPost(url, options, res => {
        console.log('登录结果', res)
      })
    }
  })
}


//用于切割详情类url,用途：当url需要两个id时前端传两个id以-隔开
function getSecondId(url){
  var urlArray = url.split("-");
  // console.log(urlArray[urlArray.length-1])
  var secondId = urlArray[urlArray.length - 1]
  return secondId;
}
// 消息推送
function markFormId(formId) {
    var url = host.host + '/formid/save?form_id=' + formId;
    httpsGetWithId(url, function (data) { }, function () { }, '记录推送Id')
}


module.exports = {
  convertHtmlToText: convertHtmlToText,
  HtmlToText: HtmlToText,
  reqLogin: reqLogin,  // 登陆请求
  https: https,  //发起网络请求
  showLoading: showLoading,  //请求数据等待交互
  dataOk: dataOk,
  markHistory: markHistory,  // 发送记录
  reqPay: reqPay,
  integralPay: integralPay,
  httpsGet: httpsGet,  // 网络请求Get 
  httpsPost: httpsPost,  //网络请求Post
  getSessionId: getSessionId,  // 获取ssId
  httpsGetWithId: httpsGetWithId,  // 包含ssId的请求
  httpsPostWithId: httpsPostWithId,  // 包含ssId的POST请求
  repeatPay: repeatPay,  // 重复支付
  checkAuthSetting: checkAuthSetting,
  navigateTo: navigateTo,
  showMsg: showMsg,
  previewImage: previewImage,
  showModal: showModal,
  showToast: showToast,
  getLocation: getLocation,  // 获取地址
  log: log,// 日志信息输出
  wxPromisify: wxPromisify,
  wxLogin: wxLogin,
  checkSsId: checkSsId,
  login: login,
  // wxGetUserInfo: wxGetUserInfo,
  wxGetNetworkType: wxGetNetworkType,
  wxHttpsPost: wxHttpsPost,
  wxHttpsGetWithId: wxHttpsGetWithId,
  wxRequestGet: wxRequestGet,
  wxGetStorage: wxGetStorage,
  getUserInfo: getUserInfo,
  nowLogin: nowLogin,
  wx2Ssid: wx2Ssid,  
  markFormId: markFormId,   // 消息推送
}
