// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'

//const getUuid=require("uuid/v4")
@pagify()
export default class extends MyPage {
  data = {
    tags: ["发起的任务", "收到的任务"],
    tagSelected: '0',//0or1 tags的下标
    showDrawer: false,
  }

  async onLoad(options: any) {

  }

  async onShow(){
    await this.getTasks();
  }

  

  // 网络函数
  async getTasks(){
    return await new Promise((resolve)=>{
      wx.request({
        url: this.store.config.host+"/task/get",
        method: "GET",
        data: {
          openId:this.store.openId
        },
        success: (res:any) => {
          console.log("getTasks", res.data.data)
          if(res.data.status==="success"){
            this.store.myReceivedTasks=res.data.data.received
            this.store.myReleasedTasks=res.data.data.released
            resolve()
          }
        }
      })
    })
  }

/*
  setTaskStatus(taskId:string,status:string){
    //信号生成
    const date=new Date();
    const msgTime=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.toTimeString().slice(0,8)
     //const msgTime=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()
    const uuid=getUuid();
    console.log("uuid",uuid)
    const newSignal={
      uuid:uuid,
      fromUser:this.store.openId,
      toGroup:taskId,
      msgType:"taskFeedback",
      msgTime: msgTime,
      msgContent:status
    }
    
    //发送部分
    if(this.store.socketOpen){
      wxp.sendSocketMessage({
        data: JSON.stringify(newSignal)
      })
    }
    else{
      console.log("socketOpen: ",this.store.socketOpen)
    }
  }
*/
  // 组件函数
  onClickAdd(){
    this.toggleDrawer();
  }

  toggleDrawer() {
    this.setDataSmart({
      showDrawer: !this.data.showDrawer
    });
  }

  onClickCell(e:any){
    console.log(e.currentTarget.dataset.item)
    const taskId=e.currentTarget.dataset.item._id;
    wxp.navigateTo({
      url:"../taskDetails/taskDetails?taskId="+taskId
    })
  }
  async onClickTag(e:any) {
    // await this.getTasks();
    this.setDataSmart({
      tagSelected: e.currentTarget.dataset.index
    })
  }

  async onNoticeClose(e:any){
    console.log("关闭通知", e)
  }

  toTaskCreate() {
    this.setDataSmart({
      showDrawer: false
    });
    wx.navigateTo({
      url:'../tasksCreate/tasksCreate'
    })
  }
}
