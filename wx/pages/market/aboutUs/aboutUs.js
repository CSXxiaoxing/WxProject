import {host, util, dict, common, cl} from '../../../utils/server';

Page({
    data: {},
    onToolFun(e){ this.setData({ tool: e.detail }) },               // 全局注入
    onLoad(){ this.reqService() },                                  // 数据请求
    onPullDownRefresh(){ cl.PullDownRefresh(0,0,this.reqService) }, // 下拉刷新
    previewImage: e => cl.preview( cl.Target(e,'imgurl') ),      // 预览图片-单
    reqService: function(){
        var url = host.host + '/about/us', that = this;
        cl.Load('加载中')
        util.httpsGet(url,function(data){
            cl.Load(null)
            that.setData({
                passage: common.parsePassage(data.data.compayInfo.description),
                data: data.data
            })
        },'','关于我们')
    },
    onShareAppMessage: function () { // 用户点击右上角分享
        return {
            title: host.companyName,
            path: dict.pages.aboutUs,
        }
    },
})