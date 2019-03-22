// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage} from 'base/'

@pagify()
export default class extends MyPage {
  data = {
    date: '',
    time: '',
    title: '测试标题',
    detail: '内容内容内容',
    userList: new Array,
    subordinate: new Array, //接收者
  }

  async onLoad(options: any) {
    const userList = await this.getUserList();
    this.setDataSmart({
      userList: userList
    })
    console.log('userList', userList)
  }


  //网络函数
  async getUserList(){
    return await new Promise((resolve,reject)=>{
      wx.request({
        url:this.store.config.host+"/user/getUserList",
        success:res=>{
          if(res.data.status==="success"){
            resolve(res.data.data.userList)
          }else{
            reject()
          }
        }
      })
    })
  }
  async addTask(task:any){
    return await new Promise<String>((resolve,reject)=>{
      wx.request({
        url: this.store.config.host+"/task/add",
        method: "POST",
        data: {
          task:task
        },
        success:res=>{
          if(res.data.status==="success"){
            console.log(res.data.data.taskId)
            resolve(res.data.data.taskId)
          }else{
            reject()
          }
        }
      })
    }) 
  }
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
            console.log('添加notice成功',res.data.data.noticeId)
            resolve(res.data.data.noticeId)
          }else{
            reject()
          }
        }
      })
    }) 
  }


  //组件函数
  bindDateChange(e:any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  }
  bindTimeChange(e:any) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      time: e.detail.value
    })
  }
  bindTitleChange(e:any) {
    console.log('Title改变，携带值为', e.detail.detail.value)
    this.setDataSmart({
      title:e.detail.detail.value
    })
    
  }
  bindDetailChange(e:any) {
    console.log('Detail改变，携带值为', e.detail.detail.value)
    this.setDataSmart({
      detail:e.detail.detail.value
    })
  }
  handleSubordinateChange({ detail = {value:''} }) {
    const index = this.data.subordinate.indexOf(detail.value);
    index === -1 ? this.data.subordinate.push(detail.value) : this.data.subordinate.splice(index, 1);
    this.setDataSmart({
      subordinate: this.data.subordinate
    });
  }
  async onClickConfirm(){
    if(this.data.subordinate.length==0){
      wx.showToast({
        title:'请至少选择一个成员',
        icon:'none'
      })
    }else{
      const openId = this.store.openId;
      let subordinate: any[] = [];
      this.data.subordinate.forEach(element=>{
        const newEle = {openId:element, status: 0}
        subordinate.push(newEle)
      })
      console.log('subordinate', subordinate);
      const task = {
        leader: openId,
        subordinate: subordinate,
        title: this.data.title,
        detail: this.data.detail,
      }
      const taskId = await this.addTask(task)
      const ws1 = this.store.ws1
      for(var i in subordinate){
        let element = subordinate[i];
        const header = {
          fromId: this.store.openId,
          toId: element.openId
        }
        const notice = {
          ...header,
          title: '您有新任务：'+task.title,
          command: {
            goToTask: taskId
          }
        }
        await this.addNotice(notice)
        const signal = {
          ...header
        }
        ws1.send({data:JSON.stringify({event:"notice", data: signal })})
      }
      wx.navigateBack({delta:1});
    }
  }
}
