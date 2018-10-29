/**
 * @author 陈盛兴 <a251156539@163.com>
 */
var host = require('./host.js')
var dict = require('./dict') 
var util = require('./util.js')
var common = require('./common.js')
import window from "window";

/**
 * 封装约定：
 * 1、大写字母开头方法是封装微信api和页面初始化默认事件
 */
const logType = false;  // 是否打印log
class fun {
    constructor() { 
        /**
         * url/路由方式/用户信息/全局
         * @readonly
         */ 
        this.host = host;
        this.dict = dict;
        this.pages = dict.pages;
        this.routerName = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab', 'navigateBack'];
        this.userInfo = void 0;
        this.Minitabbar = void 0;
        this.Rpage = void 0;    // 登录后数据恢复请求辅助-pages路径
        this.dlRouter = void 0;
        // 防止数据不返回终止页面
        this.tipTime = false;
    }
}
// 完成的封装------------------------------
/**
 * @function Tip - 显示隐藏的Toast/Loading
 * @param {Boolean} boo - show or hide 
 * @param {Object} obj - 参数
 * @param {String} obj.title - title（提示内容)
 * @param {String} obj.type - Toast/Loading（提示内容)
 * @arg {String} [obj.icon] - 'success','loading','none'
 * @arg {String} [obj.image] - 自定义图片路径 - image 的优先级高于 icon
 * @arg {Number} [obj.duration=1500] - 延迟消失 - Toast下有效
 * @arg {Boolean} [obj.mask=false] - 是否显示透明蒙层
 * @callback <-fn-：success，fail，complete->
 */
const Tip = function ( boo, obj ) {
    let $this = pointer(this);
    if ( boo ) {
        wx[ 'show'+obj.type ] (obj)
        $this.tipTime = true;
    }
    else {
        wx[ 'hide'+obj.type ] ();
        $this.tipTime = false;
    }
    if ($this.tipTime && obj.type=="Loading") {
        var setT = setTimeout( ()=>{
            if(pointer(this).tipTime) {
                wx[ 'showToast' ] ( {title:'请求超时',icon:'none'} )
            }
            wx[ 'hide' + obj.type ] ()
            console.log(pointer(this).tipTime)
            clearTimeout(setT)
        }, 3500 )
    }
    return $this
}
const Load = function( obj={} ){
    if (!obj) Tip(0,{type:'Loading'});
    else if (typeof obj == 'object') Tip(1,{title:obj.title || '加载中',type:'Loading',mask:obj.mask || true});
    else if (typeof obj == 'string') Tip(1,{title:obj,type:'Loading',mask:true});
    else Tip(0,{type:'Loading'});
}
/**
 * @param {string} phone - 手机号码
 */
var phone = function(phone){
    wx.makePhoneCall({
        phoneNumber: phone
    })
}
/**
 * @param {String} current - 当前显示图片的http链接
 * @param {Array} urls - 需要预览的图片http链接列表
 */
var preview = function(current, urls=[current]){
    wx.previewImage({current,urls})
}
/**
 * -获取元素中设置的data-xxx-
 * @param e 节点obj
 * @param {string} ele data-xxx 中要取的xxx
 */
let Target,target;
Target = target = (e, ele) => ele?e.currentTarget.dataset[ele]:e.currentTarget.dataset;

/**
 * -内部使用-
 * @event pointer - 矫正指针
 * @param field - this
 */
const pointer = (field=new fun) => field;

/**
 * @todo log table dir
 */
function log() {
    if (!logType) return false;
    var o = 0,oo,num;
    try{
    if (arguments.length == 0) return false;
    else if (typeof arguments[0] == 'number') {
        o++; num = arguments[0];
    }
    else if (arguments[0] instanceof Array) {
        o++;
        num=arguments[0][0];
        oo=arguments[0][1];
    }
    if (arguments.length >= 2) {
    if (!arguments[2] && o) 
    console[console[arguments[1+o]]?arguments[1+o]:'log'](`${arguments[0+o]} 
                                %c ${common.getPageName()} ${oo?'['+oo+']':''}:${o==0?'?':num} `, "color: #333;background-color:#6892463a;padding:5px 1px;line-height: 20px;");
    else {
        console.groupCollapsed(`${arguments[0+o]} 
                                %c ${common.getPageName()} ${oo?'['+oo+']':''}:${o==0?'?':num} `, "color: #333;background-color:#6892463a;padding:5px 1px;line-height: 20px;");
        if(console[arguments[1+o]])
            for (var i = 2+o; i < arguments.length; i++) console[arguments[1+o]](arguments[i])
        else 
            for (var i = 1+o; i < arguments.length; i++) {
                console.log(arguments[i])
            }
        console.log(`%c`, "padding: 70px 300px; line-height:140px; background:url('https://images0.cnblogs.com/blog/431064/201402/072156353445447.gif') no-repeat -25px -20px;")
　　    console.groupEnd();
        }
    }
    else {
        console.log(`${arguments[0]}
                                %c  --小尾巴：${common.getPageName()} `, "color: #333;background-color:#6892463a;padding:5px 1px;line-height: 20px;")// 橙色
    }
    } catch ( err ) {}
}

/**
 * set TabBar and Navigation style
 * @todo 定型后优化代码结构
 */
var NavigationTabBar = function (extConfig) {
    let $this = pointer(this)

    var extConfig = host.extConfig;
    if( extConfig ){
        wx.setNavigationBarColor({
            frontColor: '#ffffff',  // 只能000 or fff
            backgroundColor: extConfig.navigatorBackColor, // 背景色
            animation: {
                duration: 400,
                timingFunc: 'easeOut'
            }
        })
    }
    return $this;
}

/**
 * @todo 小程序初始化的默认配置
 */
var Init = function(){
    let $this = pointer(this)
    WxSsid()
    return $this;
}
/**
 * @todo tool - 默认的全局样式配置等...
 */
var Tool = function(callback){
    let that = pointer(this)
    wx.getStorage({ 
        key: host.agentId + "tabbar",
        success(res) {
            callback(res.data)
        },
        fail() { 
            util.httpsGet(host.tabHost, res => {
                let _data = res.data ? res.data.MiniappTabBar : false;
                _data && storageSync( "tabbar",  _data );
                callback(_data)
                that.Minitabbar = true;
            })
        }
    })
    return that;
}

/**
 * @todo - 默认的全局wx配置等...
 */
var InitPage = function(name){
    let $this = pointer(this)
    NavigationTabBar()  // 页面头脚样式
    return $this;
}
/**
 * @todo 需密钥页面或请求 -- 无引用，不需要的话可删除
 */
var key = function(){
    let $this = pointer(this)
    Ssid()  // 检查Ssid是否存在；
    return $this;
}


/**
 * @todo 获取用户缓存资料
 */
// 检查Session是否过期
var WxSsid = function(){
    let $this = pointer(this)
    wx.checkSession({
        success(e){
            Ssid()
            return $this;
        },
        fail(){
            accredit(true)
        }
    })
    return $this;
}
var Ssid = function(){
    let $this = pointer(this)
    wx.getStorage({
        key: 'ssId',
        success: function(res) {
            log('ssid',res.data)
        },
        fail(){
            accredit(true)
        }
    })
    return $this;
}

// 登录
function WxLogin(obj){
    let $this = pointer(this)
    log('用户参数：',this.userInfo)

    var userInfo = wx.getStorageSync('userInfo')
    var nickname = userInfo.nickName;
    var avatarUrl = userInfo.avatarUrl;
    
    wx.login({
        success: function (res) { 
            //发送请求获取登录的code
            if (res.code) {
                var code = res.code;
                var options = {
                    agentId: host.agentId,
                    code: code,
                    nickname: nickname,
                    profilePhoto: avatarUrl,
                }
            }
            var url = host.host + '/wechat/memberWxsign/wxlogin.html';

            util.httpsPost(url, options, res => {
                // 如果服务器相应成功，返回sessionId
                var data = res;
                if (data.success) {
                    wx.setStorageSync('ssId', data.data.ssid)
                    wx.hideLoading()
                    Tip(1, { type: 'Toast', title: '授权成功' ,icon: 'none'})
                    util.wx2Ssid()
                } else { 
                  // 弹窗提示登陆失败
                  wx.hideLoading();
                  Tip(1, { type: 'Toast', title: '授权失败,请联系客服或稍后再试' ,icon: 'none'})
                  log('授权失败,请检查小程序配置,如APPID，秘钥等')
                }
                
            })
        }
    })
}


/**
 * -路由-
 * @todo 初步完成
 * @param {Number} rNum - 0:'navigateTo' 1:'redirectTo' 2:'reLaunch' 3:'switchTab' 4:'navigateBack' 
 * @param {Object} rEvent - 对象参数
 * @arg {object} rEvent.url - 跳转位置 rEvent.pages || rEvent.url 
 * @arg {number} rEvent.delta - 返回层数
 */
var Router = function ( rNum, rEvent={} ) {
    let $this = pointer(this)
    let [rName, url] = [$this.routerName[rNum], rEvent.url || rEvent.pages];

    let success = rEvent.success ? rEvent.success : function(){   // 跳转成功后回调
        Tip( 0, {type: 'Loading'} )
    }
    let fail = rEvent.fail ? rEvent.fail : function(e){  // 跳转失败后回调
        var rtArr = getCurrentPages();
        if (e.errMsg.split(' ').includes('tabbar') || e.errMsg.split(' ').includes('tab')) {
            if(url.indexOf('/')!=0){
                url = '/'+url;
            }
            Router(3,{url:url})
        }
        else if ( rtArr.length >= 9 ) {
            // 超层失败处理-目前最高十层
            Router(1,{ url:url })
        } else {
            Router(3,{url:url}) // 自杀式跳转-防止微信更改msg文字造成跳转bug
            Tip( 1, {
                type: 'Toast',
                icon: 'none',
                title: '抱歉,页面君走丢了呢',
                duration: 1500,
                mask: true,
            } )
        }
    }
    let complete = rEvent.complete ? rEvent.complete : function(e){  // 跳转结束后回调（不论成败）
    }
    let delta = rEvent.delta ? rEvent.delta : 1; // 返回层数

    if ( !url && rNum!=4 ) {  // 无效的跳转
        Tip(1, {
            type: 'Toast',
            icon: 'none',
            title: '抱歉,你要找的页面君不存在',
            mask: true,
        })
        return false
    }

    if(url == undefined){
        rNum = 4;
    } else if(url.indexOf('/')!=0){
        url = '/'+url;
    }
    let rData = {url:url, success , fail, complete, delta};
    wx[ rName ]( rData )
    return $this
}



/**
 * 点击元素路由封装
 * @param {*} e - 元素ele
 * @param {*} _path - 地址或者元素ele
 */
var jumpRouter = function( e, _path={} ){
    let $this = pointer(this);

    let url = _path.url ? _path.url : $this.Target(e, 'url');
    let urlT = _path.urlT ? _path.urlT : $this.Target(e, 'urlT');
    Router( 0, {url:url} )
    return $this;
}
// 分离样式和功能的管道
var fStyle = function(data, ){
    let [styleDict, pxDict] = [dict.styleDict, dict.pxToRpx];
    let fl = (data) => {
        var [allObj, key] = [[], Object.keys(styleDict)];
        data.forEach( item => {
            var obj = {style:''};
            for (var ele in item) { // 分离样式和功能
                if (key.includes(ele)) obj.style += count(item, ele, )
                else if (Array.isArray(item[ele])) obj[`${ele}`] = fl(item[ele])
                else obj[`${ele}`] = item[ele]
            }
            allObj.push(obj)
        } )
        return allObj;
    }
    let count = (item, ele, ) => {  // 匹配样式
        var val = void 0;
        if (`${ele}` == 'isf') val = `position:${item[ele]?'fixed':'absolute'};`
        else if (`${ele}` == 'ff') val = `${styleDict[ele]}:'${pxtorpx(item, ele, )}';`
        else val = `${styleDict[ele]}:${pxtorpx(item, ele, )};`
        return val;
    }
    let pxtorpx = (item, ele, ) => {  // px换算
        var val = item[ele];
        if ( pxDict.includes(ele) ) val = item[ele]*2 + 'rpx';
        return val;
    }
    return new Promise(function (resolve, reject) { // 过滤样式和功能
        resolve( fl(data) )
    })
}


/**
 * @todo 下拉刷新总控制
 * @param {number} Time - 停止下拉刷新的时间
 * @param {string} DL - dark - light
 */
var PullDownRefresh = function(Time, DL, fn){
    var pName = common.getPageName();    // 当前页面名字
    var callback = function(){
        fn ? fn() : void 0;
        wx.setBackgroundTextStyle({
            textStyle: DL || 'light', // loading 图样式，仅支持 'dark', 'light'
        })
        var t = setTimeout(function(){
            wx.stopPullDownRefresh();
            clearTimeout(t)
        },Time || 3000)
    }
    return callback()
}

/**
 * 事件监听
 * @param {*} type 
 */
var accredit = function(type=false){
    window.MoniOBJ.Authorize = type
}

// 同步 storage 缓存方法
var storageSync = ( name, data ) => window('setStorageSync')( host.agentId + name,data )
/**
 * @todo 检查版本更新
 */
const UPDATA = function(){
    const update = window('getUpdateManager')()
    update.onCheckForUpdate(function (res) {})
    update.onUpdateReady(function () {
        window('showModal')({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function (res) {
                if (res.confirm) {
                    update.applyUpdate()
                }
            }
        })
    })
    update.onUpdateFailed(function () { // 新版本下载失败
        window('showModal')({
            title: '小程序有新版本了哟~',
            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
        })
    })
}
/**
 * @todo webview
 */
const webview = function(e){
    var ele = target( e, 'webview' );
    if(ele) {window.MoniOBJ.webViewSrc = ele};
}
/**
 * @todo - 监听者
 * @arg {Object} arg  - 传入的参数
 */
const Listener = ( ...arg ) => 
    Object.defineProperties( window.MoniOBJ,
        ((o={})=>(
            arg[0].map(name=>o[name]={
                set:key=>arg[1]({name,key})
            }),o
        ))()
    )

/**
 * @param  {...any} arg  由tool传值控制各个page页面
 */
const onToolFun = function(...arg){
    let e_data = arg[0].detail;
    if( Object.keys(e_data)[0] ){
        var args = {}
        for (var o in e_data) {
            args[o] = e_data[o]
        }
        arg[1].setData(args)
    }
}

// 方法注册 (方法使用名称，fn)
Object.assign(fun.prototype, {
    PullDownRefresh,    // 下拉刷新总开关
    Tip,            // 提示模态
    Load,           // load
    call: phone,    // 拨打电话
    preview,        // 图片预览
    Tool,   // tool所需配置

    UPDATA, // 检查版本更新
    Listener,   // 监听者
    onToolFun,  // 默认传值

    // 初始化
    NavigationTabBar,   // 头尾style
    Init,   // 初次登录状态判断
    InitPage,   // page初始化
    WxLogin,  // 登录
    WxSsid, // Ssid检查
    Ssid,   // 本地Ssid
    Router, // 路由跳转
    log,    // 打印
    
    fStyle,
    Target,target,  // 元素获取
    jumpRouter,
    
    // 测试或者无引入的注册fn
    key,    // 需要验证的页面
    accredit,
    storageSync,    // 同步缓存
    webview,   // 新增功能模块
});

export default new fun()