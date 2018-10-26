// 入口整合
var host = require('host')
var util = require('util') 
var common = require('common')
var dict = require('dict') 
var pageStaticData = dict.pageStaticData;
var onfire = require('onfire')
var WxParse = require('../wxParse/wxParse.js')
import cl from "fillter";
import storage from "storage";
// 降低转移成本
import window from "window";

export { host,util,common,pageStaticData,dict,cl,onfire,window,WxParse,storage, }
