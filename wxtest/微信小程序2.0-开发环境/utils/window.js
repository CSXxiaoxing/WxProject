/**
 * @author 陈盛兴 <a251156539@163.com>
 * 文件目的 - 降低转换成本
 */
// 可能需要用到
var host = require('./host.js') 
var dict = require('./dict') 
var util = require('./util.js') 
var common = require('./common.js') 
import cl from "fillter";

/**
 * @todo world - 世界大BOSS
 * @todo worldString - 主要判断依据
 */
const world = wx;
const worldString = 'wx';
/**
 * @todo 不友好兼容
 * 名称不同造成的不友好结构与代码
 */
const wxAPI = { 
    // 测试用
    'downloadFile': {
        'my' : false,
        'swan': false,
    },
    'aa': { 
        'wx' : false,
    },
    // 正式
    'showModal': {  // 确认框
        'my' : 'confirm',
    },
}
const SETAPI = {
    'getStorageSync' : keys => {
        let [res={}] = [window.getStorageSync({ key: keys })];
        return res.data
    }
}


/**
 * @function Window - 判断小程序的API，回调，参数，组件等是否在当前版本可用
 * 
 * @param {Boolean} boo - show or hide 
 * @param {Object} obj - 参数
 * @param {String} obj.type - Toast/Loading（提示内容)
 * @arg {String} [obj.image] - 自定义图片路径 - image 的优先级高于 icon
 * @arg {Number} [obj.duration=1500] - 延迟消失 - Toast下有效
 * @arg {Boolean} [obj.mask=false] - 是否显示透明蒙层
 * 
 * @callback <-fn-：success，fail，complete-> 成功/失败/执行完毕
 */
let APISOS = void 0;
// 方法验证
const Window = API => world.canIUse(API) ? world[API] : Replace( API );
// 替代方案
const Replace = API => wxAPI[API] ? wxAPI[API][worldString] || DIY_API(API) : DIY_API(API);
/**
 * @todo DIY实现
 * 不存在有效代替接口或者同类型结构冲突大时自定义方法或者改造
 */
const DIY_API = API => {
    APISOS = API;
    return SETAPI[API] ? SETAPI[API] : ERROR_API
}
/**
 * @todo - 提示执行失败
 * @todo - 错误位置-待增加，错误代码-APISOS。
 */
let ERROR_API = () => console.error(`开发人员请注意！存在无效API:( ${APISOS} )，请及时修复。`) 

// 响应测试
Window('aa')()

// 设立监听集
Window.MoniOBJ = {
    webViewSrc: false,  // webview
    Authorize: false,   // 授权监听
}

export default Window