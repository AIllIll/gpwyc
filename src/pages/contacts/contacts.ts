// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'

@pagify()
export default class extends MyPage {
  data = {
    contacts:{}
  }

  async onLoad(options: any) {
    //console.log(await wxp.getUserInfo())
    /*if(this.store.contacts=={} && this.store.userInfo){
      
    }
    this.setDataSmart({
      contacts:this.store.contacts
    })
    */
  }

  onClickCard(e:any){
    const friendInfo=e.currentTarget.dataset.item;
    wxp.navigateTo({
      url:"../chat/chat?friendInfo="+JSON.stringify(friendInfo)
    })
  }
  onClickNewFriends(){
    wxp.navigateTo({
      url:"../newFriends/newFriends"
    })
  }
}
