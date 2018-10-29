import {cl, common, util, host } from '../../../utils/server';
var CHECK = common.check;

Component({
    properties: {
        sonData:{
            type: Array,
            value: '',
            observer: function(newVal, oldVal, changedPath){
                if ( oldVal == "" || JSON.stringify(newVal) != JSON.stringify(oldVal) ) {
                    this.upData()
                }
            }
        },

    },
    data: {
        allObj: [],
        inputText: ['姓名', '电话', '内容'],
        inputValue: [],
    },
    methods: {
        input(e){
            let idx = this.data.inputText.indexOf(cl.Target(e, 'idx'));
            this.data.inputValue[idx] = e.detail.value;
        },
        upData(){
            var [data, self] = [this.data.sonData, this];
            cl.fStyle(data).then( _data => {
                cl.log([29,'msgList'], '留言组件', _data)
                self.setData({ allObj:_data })
            } )
        },
        formSubmit:function(e){
            var that= this;
            that.fromPost(this.data.inputValue,that)
        },
        fromPost: function (messages, that) {
            let flas = false;
            let warn = '';
            if (messages[0] == "") {
              flas = true;
              warn = '请输入联系人'
            } else if (!CHECK.phone(messages[1])) {
              flas = true;
              warn = '请输入正确手机号码'
            } else if (messages[2] == "") {
              flas = true;
              warn = '请输入留言内容'
            } else {
              wx.showLoading()
              messages = {
                contract: messages[0],
                telephone: messages[1],
                content: messages[2]
              }

              util.httpsPost(host.host + '/message/add', messages, res => {
                console.log('res', res)
                wx.hideLoading()
                if (res.success) {
                  wx.showToast({
                    title: "已提交",
                    icon: 'sucess',
                    success: function () {
                      that.setData({
                        inputValue: [],
                      })
                    }
                  })
                }
              })
            }
            if (flas) {
              wx.showToast({
                title: warn,
                icon: 'none',
              })
            }
          },
    },
    created: function(){
    },
    attached: function(){
        
    },
    ready: function(){
        
        
    },
    moved: ()=>{
        
    },
    detached: ()=>{
    },
});