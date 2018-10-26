/**
 * @author 陈盛兴 <a251156539@163.com>
 * 文件目的 - 建立缓存体系
 */
// 依赖
import regeneratorRuntime from './plug-in/async'
import {host, window,} from "server";

var dict = require('./dict') 
var util = require('./util.js') 
var common = require('./common.js') 
import cl from "fillter";

// 描述项
let DESCRIBE = {
    TAG : 'tabBar',     // 底部选项卡
    // TAG : Symbol('tabBar'),     // 底部选项卡

}

class ArgsPoint {
    constructor(...args) {
        this.args = args;
    }
    [DESCRIBE.TAG](T){
        let [tb={}] = [window('getStorageSync')( host.agentId + 'tabbar' )];
        let TAG = {
            T_Color: tb.themeColor || "#6e00e6",
            T_CHelp: tb.themeColorHelp || "#aa61ff",
            T_Car: tb.cartPage,
            T_My: tb.personalCenterPage,
            T_Sort: tb.productCatePage,
            T_Detail: tb.productInfoPage,
        }
        return T ? (TAG[T] || 2) : tb
    }
    * [Symbol('Q')]() {
        for (let arg of this.args) {
            yield arg;
        }
    }
}
class Storage extends ArgsPoint {
    constructor() {
      super();
    }
}

export default new Storage()