// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage} from 'base/'

interface user{
  userInfo: userInfo,
  openId: string
}

interface userInfo{
  avatarUrl:string,
  nickName:string,
  openId:string
}

interface subordinate{
  openId:string,
  status:number,
  userInfo:userInfo
}

interface taskInfo{
  leader:string,
  title:string,
  detail:string,
  subordinate:Array<subordinate>
}

interface task{
  _id:string,
  taskInfo:taskInfo
}
// const getUuid=require("uuid/v4")
@pagify()
export default class extends MyPage {
  data = {
    task:{
      _id:'',
      taskInfo:{
        leader:'',
        title:'',
        detail:'',
        subordinate:[{
          openId:'',
          status:''
        }]
      }
    },
    leader:'',
    confirmed:'',
    isLeader:''
  }

  async onLoad(options: any) {
    const taskId=options.taskId;
    const task:task = await this.getTaskOne(taskId);
    let subordinate = task.taskInfo.subordinate;
    let status = 0;
    let isLeader = false;
    if (task.taskInfo.leader === this.store.openId){
      isLeader = true;
      for(var i in subordinate){
        const user = await this.getUserOne(subordinate[i].openId);
        subordinate[i].userInfo = user.userInfo
      }
    }
    else {
      for( var i in subordinate){
        let element = subordinate[i];
        if(element.openId === this.store.openId){
          
          if(element.status === 2){
          }
          else if(element.status === 1){
          }
          else if(element.status === 0){
            await this.onRead(task)// 这时候taskId还没有setdata，要传个参
            element.status = 1
            // 将状态更新为已读
            // 添加notice
            // ws提醒
          }
          else {
            console.log("还有这种status？", element.status)
          }
          
          status = element.status
        }
      }
    }
    console.log("task", task)
    const leader = await this.getUserOne(task.taskInfo.leader);
    this.setDataSmart({
      task:task,
      leader:leader,
      status:status,
      isLeader: isLeader,
      subordinate: subordinate
    })
  }

  // 网络函数
  async getTaskOne(taskId:string){
    return await new Promise<task>((resolve)=>{
      wx.request({
        url: this.store.config.host+"/task/find",
        method: "GET",
        data: {
          taskId:taskId
        },
        success: (res:any) => {
          console.log("getTaskOne", res.data.data)
          if(res.data.status==="success"){
            resolve(res.data.data.task)
          }
        }
      })
    })
  }
  // 网络函数
  async getUserOne(openId:string){
    return await new Promise<user>((resolve)=>{
      wx.request({
        url: this.store.config.host+"/user/find",
        method: "GET",
        data: {
          openId:openId
        },
        success: (res:any) => {
          console.log("getUserOne", res.data.data)
          if(res.data.status==="success"){
            resolve(res.data.data.user)
          }
        }
      })
    })
  }

  // 点击确认之后，更改任务状态、插入notice、ws提醒获取
  async onClickConfirm(){
    const taskId = this.data.task._id;
    let taskInfo = this.data.task.taskInfo;
    const newTask = await this.updateTaskStatus(taskId, String(this.store.openId), 2) // 更改任务状态
    this.setDataSmart({
      task: newTask
    })
    const ws1 = this.store.ws1
    const notice = {
      fromId: this.store.openId,
      toId: taskInfo.leader,
      title: '您发布的任务：'+ taskInfo.title +' 有新的确认',
      command: {
        goToTask: taskId
      }
    }
    await this.addNotice(notice) // 插入notice
    const signal = {
      fromId: this.store.openId,
      toId: taskInfo.leader,
    }
    ws1.send({data:JSON.stringify({event:"notice", data: signal })}) // ws提醒获取
    wx.navigateBack({delta:1});
  }

  // 点开之后，已读，更改任务状态、插入notice、ws提醒获取
  async onRead(task:task){
    let taskId = task._id;
    let taskInfo = task.taskInfo;
    const newTask = await this.updateTaskStatus(taskId, String(this.store.openId), 1) // 更改任务状态
    this.setDataSmart({
      task: newTask
    })
    const ws1 = this.store.ws1
    const notice = {
      fromId: this.store.openId,
      toId: taskInfo.leader,
      title: '您发布的任务：'+ taskInfo.title +' 有新的已读',
      command: {
        goToTask: taskId
      }
    }
    await this.addNotice(notice) // 插入notice
    const signal = {
      fromId: this.store.openId,
      toId: taskInfo.leader,
    }
    ws1.send({data:JSON.stringify({event:"notice", data: signal })}) // ws提醒获取
  }

  // 网络函数 更改任务状态 
  async updateTaskStatus(taskId:string, subId:string, status:number){
    return await new Promise<String>((resolve,reject)=>{
      wx.request({
        url: this.store.config.host+"/task/updateStatus",
        method: "POST",
        data: {
          taskId: taskId,
          subId: subId,
          status: status
        },
        success:res=>{
          if(res.data.status==="success"){
            console.log('成功更新任务状态', res.data.data.newTask)
            this.setDataSmart({
              task: res.data.data.newTask
            })
            resolve(res.data.data.newTask)
          }else{
            reject()
          }
        }
      })
    }) 
  }
  // 网络函数 插入notice表 
  async addNotice(notice:Object){
    return await new Promise((resolve,reject)=>{
      wx.request({
        url: this.store.config.host+"/notice/add",
        method: "POST",
        data: {
          notice: notice
        },
        success:res=>{
          if(res.data.status==="success"){
            console.log('成功添加notice', res.data.data.noticeId)
            resolve(res.data.data.noticeId)
          }else{
            reject()
          }
        }
      })
    }) 
  }

  /*setTaskStatus(taskId:string,status:string){
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
  }*/
}
