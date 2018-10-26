
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

var showSvBtn = false;
var debugMode = false;

if(0){
    host = "https://wechat.cangluxmt.com/wechat/"
    agentId = 743;
    miniappId = 317;
}

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
