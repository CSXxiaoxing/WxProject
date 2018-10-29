// 主题颜色
let host,companyName,agentId,miniappId,tColor,tColorHelp;
let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync(): void 0;

if ( extConfig ) {
    host = extConfig.host;
    agentId = extConfig.agentId;
    miniappId = extConfig.miniappId;
    companyName = extConfig.companyName;
    // 缓存
    tColor = extConfig.themeColor || "#6e00e6";
    tColorHelp = extConfig.themeColorHelp || "#aa61ff";
 }

if(0){ 
    // host = 'http://192.168.30.175:8809/'; 
    host = 'http://dev.wechat.cangluxmt.com/wechat/'; 
    
    agentId = 1; // 微分销测试
    // agentId = 383; 
    miniappId = 284; 
}
// host = 'https://test.wechat.cangluxmt.com/wechat/'; 
// agentId = 279
// miniappId = 225

var showSvBtn = false;
var debugMode = false;

// agentId = 792; 
// agentId = 569; 
// miniappId = 260;

// agentId = 447; 
// miniappId = 254;


// host = 'http://192.168.30.172:8809/';
// agentId = 880; 
// miniappId = 275;


// 约定的get数据请求方法
var getHost = host + '/page/getInfoByCode?pagePath='; 

var color = wx.getStorageSync('clTabbar');
if(color){
    tColor = color.themeColor;
    tColorHelp = color.themeColorHelp;
}
const tabBar = function(){
    var tb = wx.getStorageSync( agentId + 'tabbar' ) || {};
    return {
        tColor: tb.themeColor || "#6e00e6",
        tColorHelp: tb.themeColorHelp || "#aa61ff",
        my: tb.personalCenterPage,
    }
}


const tabHost = host + `/page/tabbar`; 


module.exports = {
    agentId,                // appid
    miniappId,              // miniappid
    // http 
    host,                   // 请求地址 
    tabHost,                // tab请求
    getHost,                // 2.0 - 用户 host

    tColor,             // 主题色
    tColorHelp,         // 辅助色
    
    companyName,        // 小程序名称

    showSvBtn,
    debugMode,
    extConfig,          // ext

    // 重构tabbar缓存机制
    tabBar: tabBar(),
}
