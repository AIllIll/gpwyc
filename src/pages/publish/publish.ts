// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'
const getUuid=require("uuid/v4")

@pagify()
export default class extends MyPage {
  data = {
    status:0,//状态机
    date: "2018-09-01",
    time: "12:01",
    title:'',
    content: '',
    contentLength: 0,
    checkboxItems:[{
      avatarUrl: "../../images/1.jpg",
      nickName: "666",
      openId:"666",
      checked: false,
      value: 0
    }],
  }

  async onLoad(options: any) {
    var i=1;
    for (var key in this.store.contacts) {
      var checkBoxItem={
        avatarUrl: this.store.contacts[key].avatarUrl,
        nickName: this.store.contacts[key].nickName,
        openId: this.store.contacts[key].openId,
        checked: false,
        value: i
      }
      i=i+1;

      this.data.checkboxItems.push(checkBoxItem)
    }
    this.setDataSmart({
      checkboxItems:this.data.checkboxItems
    })
  }


  checkboxChange(e:any) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);

    var checkboxItems = this.data.checkboxItems, values = e.detail.value;
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;

      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          break;
        }
      }
    }
    this.setData({
      checkboxItems: checkboxItems
    });
  }

  bindDateChange(e:any){
    this.setData({
      date: e.detail.value
    })
  }

  bindTimeChange(e:any){
    this.setData({
      time: e.detail.value
    })
  }

  bindTitleChange(e:any){
    this.setData({
      title: e.detail.value
    })
  }

  bindContentChange(e:any){
    this.setData({
      content: e.detail.value,
      contentLength: e.detail.value.length,
    })
  }

  onClickNextStep(){
    var status = this.data.status + 1;
    this.setData({
      status:status
    })
  }

  onClickLastStep(){
    var status = this.data.status - 1;
    this.setData({
      status: status
    })
  }

  onClickReturn(){
    wxp.navigateBack({delta:1});
  }

  onClickConfirm(){
    var workers=[];
    for (var i = 0; i < this.data.checkboxItems.length; i++) {
      if (this.data.checkboxItems[i].checked){
        workers.push(this.data.checkboxItems[i].openId)
      } 
    }
    if(workers.length==0){//没选人
      wx.showToast({
        title: '请选择接收对象',
        icon: 'none'
      })
    } else if (this.data.content.length == 0 || this.data.title.length ==0 ){//没输入任务
      wx.showToast({
        title: '请输入任务',
        icon: 'none'
      })
    }else{
      
      //信号生成
      const uuid=getUuid();
      //console.log("uuid",uuid)
      const newSignal={
        uuid:uuid,
        fromUser:this.store.openId,
        toUsers:workers,
        msgType:"notice",
        msgTime: "24:00",
        title:this.data.title,
        content:this.data.content
      }

      console.log("newSignal",newSignal)
      //发送部分
      if(this.store.socketOpen){
        wxp.sendSocketMessage({
          data: JSON.stringify(newSignal) 
        })
      }
      else{
        console.log("notice发送失败 socketOpen: ",this.store.socketOpen)
      }

      
    }
      
  }
}
