// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage} from 'base/'

@pagify()
export default class extends MyPage {
  data = {
    contacts:[]
  }

  async onLoad(options: any) {
    //console.log(await wxp.getUserInfo())
    if(this.store.contacts.length==0 && this.store.userInfo){
      this.store.contacts=[{
        nickName:this.store.userInfo.nickName,
        avatarUrl:this.store.userInfo.avatarUrl,
        badge:2,
        extra:"extra"
      },{
        nickName:this.store.userInfo.nickName,
        avatarUrl:this.store.userInfo.avatarUrl,
        badge:2,
        extra:"extra"
      }]
    }
    this.setDataSmart({
      contacts:this.store.contacts
    })
    
  }

  onClickCard(e:any){
    console.log(e)
  }
}
