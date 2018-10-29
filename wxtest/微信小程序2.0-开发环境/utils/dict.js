
const styleDict = {
    w: 'width',
    h: 'height',
    bdr: 'border-radius',
    op: 'opacity',
    co: 'color',
    bdw: 'border-width',
    bds: 'border-style',
    bdc: 'border-color',
    bgc: 'background-color',
    zi: 'z-index',
    t: 'top',
    l: 'left',
    lh: 'line-height',
    ta: 'text-align',
    ws: 'white-space',
    pd: 'padding',
    fs: 'font-size',
    ff: 'font-family',
    sty: 'font-style',
    line: 'text-decoration',
    fw: 'font-weight',
    pos: 'position',
    disp: 'display',
    isf: 0,
};
const pxToRpx = ['w', 'h', 'bdr','bdw','fs','lh','t','l', 'pd'];

const pageStaticData = {
    // 页面一菜单
    navList : [{
        navs: [{
        name: '限时秒杀',
        cateType: 108,
        image: '/images/1.png'
        }, {
        name: '优惠集市',
        cateType: 105,
        image: '/images/2.png'
        }, {
        name: '阶梯竞价',
        cateType: 101,
        image: '/images/3.png'
        }, {
        name: '积分商城',
        cateType: 106,
        image: '/images/4.png'
        }, {
        name: '团购',
        cateType: 102,
        image: '/images/5.png'
        }, {
        name: '拼团',
        cateType: 124,
        image: '/images/6.png'
        }, {
        name: '砍价',
        cateType: 123,
        image: '/images/7.png'
        }, {
        name: '在线预约',
        cateType: 122,
        image: '/images/9.png'
        }, {
        name: '热门商品',
        cateType: 107,
        image: '/images/10.png'
        },{
        name: '美妆个护',
        cateType: 300,
        detailId: 16723,
        image: '/images/11.png'
        }]
    }, {
        navs: [ {
        name: '智能用品',
        cateType: 2,
        detailId: 17896,
        image: '/images/8.png'
        },{
        name: '箱包服饰',
        cateType: 3,
        detailId: 18131,
        image: '/images/12.png'
        }, {
        name: '母婴玩具',
        cateType: 300,
        detailId: 16683,
        image: '/images/13.png'
        }, {
        name: '茶冲咖啡',
        cateType: 300,
        detailId: 17899,
        image: '/images/14.png'
        }, {
        name: '家居生活',
        cateType: 300,
        detailId: 16780,
        image: '/images/15.png'
        }, {
        name: '南北特产',
        cateType: 300,
        detailId: 17891,
        image: '/images/16.png'
        }, {
        name: '生鲜乳品',
        cateType: 300,
        detailId: 16392,
        image: '/images/17.png'
        }, {
        name: '营养保健',
        cateType: 300,
        detailId: 17413,
        image: '/images/18.png'
        }, {
        name: '粮油调味',
        cateType: 300,
        detailId: 16559,
        image: '/images/19.png'
        }, {
        name: '休闲零食',
        cateType: 300,
        detailId: 16460,
        image: '/images/20.png'
        }]
    }],
    //页面四菜单
    spreads_items_datas : [{
        id: 0,
        // 隐藏控制
        hideOrShow_Control: false,
        title: '会员中心',
        childs: [{
        id: 0,
        child_title: '全部订单',
        page_url: '/pages/my_indent/my_indent'
        }, {
        id: 1,
        child_title: '我的收藏',
        page_url: '/pages/market/my_collection/my_collection'
        }, {
        id: 2,
        child_title: '地址管理',
        page_url: '/pages/market/my_address/my_address?type=1'
        }, {
        id: 3,
        child_title: '评价记录',
        page_url: '/pages/market/evaluate/evaluate'
        }, {
        id: 3,
        child_title: '咨询记录',
        page_url: '/pages/market/consult/consult'
        }, {
        id: 3,
        child_title: '我的足迹',
        page_url: '/pages/market/my_history/my_history'
        }]
    }, {
        id: 1,
        // 隐藏控制
        hideOrShow_Control: true,
        title: '服务中心',
        childs: [
        {
            id: 1,
            child_title: '我的退货',
            page_url: '/pages/market/change_goods/change_goods'
        }, {
            id: 1,
            child_title: '我的换货',
            page_url: '/pages/market/my_backGoods/my_backGoods'
        }]
    }]
}
const pages = {
    // 后台传输
    my: '/pages/my/my',  // 个人中心
    category: '/pages/category/category',  // 商品分类
    my_indent: '/pages/my_indent/my_indent',  // 我的订单
    shopCart: '/pages/shopCart/shopCart',  // 购物车
    joinUs: '/pages/joinUs/joinUs',  // 招商加盟
    goodList: '/pages/goodList/goodList',  // 商品二级分类
    goods_type: '/pages/goods_type/goods_type',// 商品三级分类
    news: '/pages/news/news',  // 新闻一级分类
    intergral_shop: '/pages/intergral_shop/intergral_shop',  // 积分商城
    coupon: '/pages/coupon/coupon',  // 优惠集市
    sellerList: '/pages/sellerList/sellerList',  // 店铺列表
    shop_detail: '/pages/shop_detail/shop_detail',  // 店铺详情
    tuangou: '/pages/tuangou/tuangou',  // 团购
    jieti: '/pages/jieti/jieti',  // 阶梯竞价
    newDetail: '/pages/newDetail/newDetail?newId=', // 新闻详情
    goods_detail: '/pages/goods_detail/goods_detail?productId=', // 商品详情

    pintuanList: '/pages/pintuanList/pintuanList',  // 拼团活动
    reserveList: "/pages/reserveList/reserveList",  // 预约
    bargainList: "/pages/bargainList/bargainList",  // 商品砍价活动
    inTime: "/pages/inTime/inTime",                 // 限时抢购


    // market
    aboutUs: '/pages/market/aboutUs/aboutUs',  // 关于我们
    add_bargainIndent: '/pages/market/add_bargainIndent/add_bargainIndent',    // 填写砍价订单
    sucCase: '/pages/market/sucCase/sucCase',    // 成功案例
    myPintuan: "/pages/market/myPintuan/myPintuan",   // 我的拼团
    tuan_detail: '/pages/market/tuan_detail/tuan_detail',    // 团购详情
    pintuanDetail: '/pages/market/pintuanDetail/pintuanDetail',    // 拼团活动详情
    submitReserve: '/pages/market/submitReserve/submitReserve',  // 提交预约信息
    reserveGoodsDetail: '/pages/market/reserveGoodsDetail/reserveGoodsDetail', // 预约商品详情
    sharePintuan: '/pages/market/sharePintuan/sharePintuan',   // 拼团商品分享
    reserveIndentDetail: '/pages/market/reserveIndentDetail/reserveIndentDetail',   // 预定订单详情
    my_history: '/pages/market/my_history/my_history',    // 我的足迹
    my_collection: "/pages/market/my_collection/my_collection",    // 我的收藏
    add_address: "/pages/market/add_address/add_address",    // 选择地址
    add_evaluate: "/pages/market/add_evaluate/add_evaluate",    // 添加评论
    evaluate: "/pages/market/evaluate/evaluate",   // 评价中心
    add_integral_indent: "/pages/market/add_integral_indent/add_integral_indent",    // 填写订单
    add_jieti_indent: "/pages/market/add_jieti_indent/add_jieti_indent",   // 阶梯填写订单
    add_qj_indent: "/pages/market/add_qj_indent/add_qj_indent",   // qj填写订单
    add_indent: "/pages/market/add_indent/add_indent",   // 填写订单
    add_pintuanIndent: "/pages/market/add_pintuanIndent/add_pintuanIndent",   // 填写拼团订单
    add_singleIndent: "/pages/market/add_singleIndent/add_singleIndent",   // 填写订单
    add_tuan_indent: "/pages/market/add_tuan_indent/add_tuan_indent",   // 填写订单
    add_consult: "/pages/market/add_consult/add_consult",   // 商品咨询 
    back_goods: "/pages/market/back_goods/back_goods",   // 申请退换货
    bargainDetail: "/pages/market/bargainDetail/bargainDetail",   // 砍价商品详情
    bindPhone: "/pages/market/bindPhone/bindPhone",   // ??  -- 无调用
    brand_goods: "/pages/market/brand_goods/brand_goods",   // 品牌街 -- 无调用 
    caseDetail: "/pages/market/caseDetail/caseDetail",   // 案例详情
    eval_detail: "/pages/market/eval_detail/eval_detail",   // ???
    my_backGoods: "/pages/market/my_backGoods/my_backGoods",   // 我的换货
    change_goods: "/pages/market/change_goods/change_goods",   // 我的退货
    my_address: "/pages/market/my_address/my_address",   // 我的地址
    partnerDetail: "/pages/market/partnerDetail/partnerDetail",   // 合作伙伴
    levMessage: "/pages/market/levMessage/levMessage",   // 在线留言
    discover: "/pages/market/discover/discover",   // 资讯
    consult: "/pages/market/consult/consult",   // 咨询记录
    
    
    index: '/pages/index0/index0',      // 首页
    index1: '/pages/index1/index1',      
    index2: '/pages/index2/index2',      
    index3: '/pages/index3/index3',      
    index4: '/pages/index4/index4',      
    goods_search: '/pages/goods_search/goods_search',            // 商品搜索
}
// 不需要全局的默认背景 - 无使用
const notbg = ['fx_rule'];
// 方法
const FN = {
    "T" : "tabBar",
}
// index的缓存名称  -- index页面需要改动
const IDXKEY = ['cl-idx0','cl-idx1','cl-idx2','cl-idx3','cl-idx4','cl-idx5'];
const theVersions = 'v2.7'  
// 防止图片前缀请求不到 -- 正式环境需要去除test
var imageSrc = 'http://test.image.cangluxmt.com/jcshopimage';
module.exports = {
    pageStaticData, // 文件转移
    styleDict,  // 需要匹配的样式
    pxToRpx,    // px转rpx
    imageSrc,   // 图片默认前缀
    pages,      // pages页面地址
    notbg,      // 不需要全局背景的页面
    IDXKEY,     // index的缓存名称
    theVersions, // 版本号

    FN,   // 方法类
}

