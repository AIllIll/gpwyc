// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage} from 'base/'

@pagify()
export default class extends MyPage {
  data = {
    
  }

  async onLoad(options: any) {
  if(this.store.userInfo){
    this.store.conversations=[{
      nickName:this.store.userInfo.nickName,
      avatarUrl:this.store.userInfo.avatarUrl,
      badge:2,
      motto:"motto",
      extra:"extra"
    },{
      nickName:this.store.userInfo.nickName,
      avatarUrl:this.store.userInfo.avatarUrl,
      badge:6666,
      motto:"motto",
      extra:"extra"
    }]
  }
   
  }

  onClickCell(e:any){
    console.log(e)
  }
}
