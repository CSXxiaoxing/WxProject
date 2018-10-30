/**
 * @todo csx修正
 */

//獲取當前頁面的路徑
function getPageRouteUrl(options, num=1){
    if (!options && num==1){
      console.log('无法获取当前页面地址')
      return '/pages/index0/index0';
    }
    var pages = getCurrentPages();
    var pageRoute = '/' + pages[pages.length - num].route;    // 上一个页面 or 登录辅助

    var [keys,values] = [[],[]];

    for (var key in options) {
      //只遍历对象自身的属性，而不包含继承于原型链上的属性。  
        if (options.hasOwnProperty(key) === true) {
            keys.push(key);
            values.push(options[key]);
        }
    }
    for (let i = 0;i<keys.length;i++){
        pageRoute = pageRoute + ((i == 0 ? '?' : '&') + keys[i] + '=' + values[i])
    }
    return pageRoute;
    console.log(pageRoute)
}
//解析段落和图片
function parsePassage(str, config) {
    if (str == null) {
      return '';
    }
    var content = HtmlToText(str);
    var contents = content.split('\r\n')
    var passage = [];
    for (var i = 0; i < contents.length; i++) {
      contents[i] = removeSpace(contents[i])
      var item = {
        str: contents[i]
      };
      var regex = /http:\/\/.*?(jpg|png|gif|jpeg)/
      // 判断图片路径是来自img标签 还是 文本输入的
      if (contents[i].match(/.*?(jpg|png|gif|jpeg)/) && contents[i] != '' && contents[i].substr(0, 5) == '#!@|#') {
        item.type = 0;
        contents[i] = contents[i].substring(5)
        if (contents[i].substr(0, 4) != "http" && config != undefined) {
          contents[i] = config + contents[i];
        }
        item.str = contents[i];
      } else {
        item.type = 1;
      }
      if (item.str != '') {
        passage.push(item);
      }
  
    }
    return passage;
}
/**
 * @todo csx fn封装
 */
function getPageName(){
    var pages = getCurrentPages();
    var pageRoute = pages[pages.length - 1].route;
    var pageName =pageRoute.split('/').reverse()[0];
    return pageName;     // 当前页面名称
}
/**
 * 阿里图片优化
 * @todo [0: 是否安卓, 1: 换算比例， 2: w, 3: h,]
 */
function iosOrAndroid(){
    var pic = wx.getSystemInfoSync();
    var definition = 4; // 清晰度
    // 下标 -> 4 小图清晰度 [0-100]
    // 下标 -> 5 大图清晰度 [100-500]
    // 6 w 7 h
    return  [pic.system.includes('Android') ? '/format,webp' : '', parseFloat((750 / pic.screenWidth)).toFixed(3)*1, pic.screenWidth, pic.screenHeight, ~~definition*1.5, ~~definition, pic.windowWidth, pic.windowHeight];
}
function thePx(px){ // i6 换算 当前机型尺寸
    var pic = wx.getSystemInfoSync();
    var pxx = px*2/(parseFloat((750 / pic.screenWidth)).toFixed(3)*1)
    return  ~~pxx;
}
/**
 * check the class -- 正则校验参数
 * @param {Object} obj - 参数
 * @param {String} obj.phone - 校验手机
 * @param {String} obj.email - 校验邮箱
 */
const check = {
    phone: phone => /0?(13|14|15|17|18)[0-9]{9}/.test(phone),
    email: email => /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(email)
}











//返回今天日期
function returnDate(DateType){
    var  date = new Date();
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()

    return (DateType == "date" ? year + '-' + month + '-' + day : (DateType == "time" ? hour + ":" + minute + ":" + second : year + '-' + month + '-' + day + ' ' + hour + ":" + minute + ":" + second))
  
}

// 日期截取
function getDate(date) {
  if (date.length < 10) {
    return;
  }
  return date.substr(0, 10);
}
// 判断url是否包含？号
function isConcat(url) {
  var flag = false;
  for (var i = 0; i < url.length; i++) {
    var child = url.charAt(i)
    if (child == '?') {
      flag = true;
    }
  }
  return flag;
}
//不分行，用于tips
function convertHtmlToText(inputText) {
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
  // returnText = returnText.replace(/<(?:.|\s)*?>/g, "");

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

//解析富文本 。筛选p标签下文字 及 img标签
function HtmlToText(inputText) {//分行，用于文章
  var returnText = "" + inputText;
  var str = returnText.match(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi)  //匹配
  if (str != null) {
    for (var y = 0; y < str.length; y++) {
      str[y].replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function (match, capture) {
        returnText = returnText.replace(match, "<p>" + '#!@|#' + capture + "<\/p>\r\n")
        str[y] = capture
      })
    }
  }

  returnText = returnText.replace(/<\/div>/ig, '\r\n');
  returnText = returnText.replace(/<\/li>/ig, '\r\n');
  returnText = returnText.replace(/<li>/ig, ' * ');
  returnText = returnText.replace(/<\/ul>/ig, '\r\n');
  //-- remove BR tags and replace them with line break
  returnText = returnText.replace(/<br\s*[\/]?>/gi, "\r\n");
  // console.log(returnText)
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
// 解析出新闻文字省略
function parseNewsDesc(newStr) {
  var content = parsePassage(newStr);
  var newsDesc = '';
  for (var x = 0; x < content.length; x++) {
    //截取新闻
    if (content[x].str != '' && content[x].type != 0 && newsDesc.length < 60) {
      newsDesc += content[x].str
    }
  }
  if (newsDesc.length > 60) {
    newsDesc = newsDesc.substr(0, 60);//新闻太长截取一部分
  }
  return newsDesc;
}
//替换电话号码星号
function hidePhone(phone) {
  if (phone.length == 11) {
    return phone.substring(0, 3).concat('****').concat(phone.substring(7, 12))
  }
}
// 校验字符串中是否有空格
//参数typec只判断是否全是空格
function checkSpace(str,typec) {
  if (str==''){
    return false;
  }
  if (typec){
    for (var i = 0; i < str.length; i++) {
      if (str.charAt(i) != " ") {
        return false;
      }
    }
  }else{
    for (var i = 0; i < str.length; i++) {
      if (str.charAt(i) == " ") {
        return false;
      }
    }
  }

  return true;
}

// 日期格式化
function getFDate(value) {
  if (value != null && value != "") {
    var date = new Date(value.replace(/-/g, "/"));
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 1);
    var day = date.getDate().toString();
    var hour = date.getHours().toString();
    var minutes = date.getMinutes().toString();
    var seconds = date.getSeconds().toString();
    if (month < 10) {
      month = "0" + month;
    }
    if (day < 10) {
      day = "0" + day;
    }
    if (hour < 10) {
      hour = "0" + hour;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    return year + "-" + month + "-" + day;
  } else {
    return '-';
  }
}

//替换空格
function removeSpace(str) {
  var rule = new RegExp(/&nbsp;/, 'g')
  return str.replace(rule, '')
}
function toDecimal2(x) {
  var f = parseFloat(x);
  if (isNaN(f)) {
    return false;
  }
  var f = Math.round(x * 100) / 100;
  var s = f.toString();
  var rs = s.indexOf('.');
  if (rs < 0) {
    rs = s.length;
    s += '.';
  }
  while (s.length <= rs + 2) {
    s += '0';
  }
  return s;
}
//乘法 
function accMul(arg1, arg2) {
  var m = 0;
  var s1 = arg1.toString()
  var s2 = arg2.toString();
  try {
    m += s1.split(".")[1].length
  } catch (e) {

  }
  try {
    m += s2.split(".")[1].length
  } catch (e) {

  }
  return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m)
}
//加法  
function accAdd(arg1, arg2) {
  var r1, r2, m;
  try {
    r1 = arg1.toString().split(".")[1].length
  } catch (e) {
    r1 = 0
  }

  try {
    r2 = arg2.toString().split(".")[1].length
  }
  catch (e) { r2 = 0 } m = Math.pow(10, Math.max(r1, r2))
  return (arg1 * m + arg2 * m) / m
}
//检测输入文字是否合法
function checkStr(str) {
//   var chinese = /^(\w|[\u4E00-\u9FA5,.;? ！。'’‘【】、，？+-~!@#$%^&*_\{\}])*$/;
  var chinese = /^(\w|[\u4E00-\u9FA5,.;? ！。'’‘【】、，？+-~!@#$%^&*_\{\}\r\n\\s])*$/;
  if (!chinese.test(str)) {
    return false;
  } else {
    return true;
  }
}
//减法  
function Subtr(arg1, arg2) {
  var r1, r2, m, n;
  try {
    r1 = arg1.toString().split(".")[1].length
  }
  catch (e) {
    r1 = 0
  }
  try {
    r2 = arg2.toString().split(".")[1].length
  } catch (e) {
    r2 = 0
  }
  m = Math.pow(10, Math.max(r1, r2));
  n = (r1 >= r2) ? r1 : r2; return ((arg1 * m - arg2 * m) / m).toFixed(n);
}
// 去掉省和市
function removeStr(str) {
  str = str.replace('省', '');
  str = str.replace('市', '');
  return str;
}
//像素点转换
/**
 * @Param length:宽度rpx转换成像素
 */
function exchangeToPx(length) {
  length -= 0;//强转为数字
  var screenInfo = wx.getSystemInfoSync();

  console.log(screenInfo)
  return parseFloat(length / (750 / screenInfo.screenWidth)).toFixed(3);
}
function getPageHeight(){
  var screenInfo = wx.getSystemInfoSync();
  return exchangeToRpx(screenInfo.windowHeight)
}
function exchangeToRpx(length) {
  length -= 0;//强转为数字
  var screenInfo = wx.getSystemInfoSync();
  return Math.ceil(length / (screenInfo.screenWidth / 750));
}
function toDecimal(value) {
  var value = Math.round(parseFloat(value) * 100) / 100;
  var xsd = value.toString().split(".");
  if (xsd.length == 1) {
    value = value.toString() + ".00";
    return value;
  }
  if (xsd.length > 1) {
    if (xsd[1].length < 2) {
      value = value.toString() + "0";
    }
    return value;
  }
} 
function randomWord(randomFlag, min, max) {
  var str = "",
    range = min,
    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '哈', '月', '心','天','黃','張','吳','李','胡'];

  // 随机产生
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min;
  }
  for (var i = 0; i < range; i++) {
    var pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}

function RandomNum(Min, Max) {
  var Range = Max - Min;
  var Rand = Math.random();
  var num = Min + Math.round(Rand * Range);
  return num;
}
module.exports = {
  exchangeToPx: exchangeToPx,
  exchangeToRpx: exchangeToRpx,
  accAdd: accAdd,
  accMul: accMul,
  getDate: getDate,
  isConcat: isConcat,
  removeSpace: removeSpace,
  toDecimal2: toDecimal2,
  toDecimal:toDecimal,
  Subtr: Subtr,
  checkStr: checkStr,
  convertHtmlToText: convertHtmlToText,
  HtmlToText: HtmlToText,
  parsePassage: parsePassage,
  checkSpace: checkSpace,
  parseNewsDesc: parseNewsDesc,
  removeStr: removeStr,
  returnDate: returnDate,
  getPageRouteUrl: getPageRouteUrl,
  RandomNum: RandomNum,
  randomWord: randomWord,
  getPageHeight: getPageHeight,
  // csx
  getPageName: getPageName,
  iosOrAndroid: iosOrAndroid(),
  thePx,    // 换取当前机型尺寸
  check,    // 校验
}