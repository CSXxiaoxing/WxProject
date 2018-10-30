/**
 * @author 陈盛兴 <a251156539@163.com>
 * 文件目的 - 建立缓存体系
 */
// 依赖
import regeneratorRuntime from './plug-in/async'
import { util, common, cl} from "server";
var host = require('host.js')
import window from 'window.js'
/**
 * @todo 描述项
 */
const DESCRIBE = {
    TAG : 'tabBar',     // 底部选项卡
    ERR : 'error',      // 外部传值/取值-错误处理
    ERRTEXT : [`Storage对象中不存在（-）参数`,`,so函数参数（-）无法执行`],     // 错误提示
    API: {
        getStorageSync: 'getStorageSync',
    },
}

class ArgsPoint {
    constructor(...args) {
        this.args = args;
    }
    [DESCRIBE.TAG](T){
        let [ tb={} ] = [ window(DESCRIBE.API.getStorageSync)( host.agentId + DESCRIBE.TAG ) ];
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
    [DESCRIBE.ERR](prop){
        var SONTXT = (N=0,V=prop)=>DESCRIBE.ERRTEXT[N].replace(new RegExp('-','ig'),V);
        return this[prop] || 
        console.error(SONTXT()) || 
        (arg => console.error(SONTXT()+SONTXT(1,arg)))
    }
}

const Storage = new class extends ArgsPoint {
    constructor() {
      super();
    }
}

export default new Proxy(Storage, {
    get: (target, prop, receiver) => Storage[DESCRIBE.ERR](prop),
    set: (target, prop, receiver) => {},
}) 




