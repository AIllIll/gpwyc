// 此文件是由模板文件 ".dtpl/page/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {pagify, MyPage, wxp} from 'base/'

@pagify()
export default class extends MyPage {
  data = {
    contacts:{}
  }

  async onLoad(options: any) {
    const grouptest={
      openId:"group666666",
      avatarUrl:"../../images/avatar/addFriends.png",
      nickName:"群测试",
      member:["oP7yP4gjNnPbPgtCKkZtq9qeErqI","oP7yP4remI5DCvlQgvFv9Lg4Iukg"]
    }
    this.store.contacts[grouptest.openId]=grouptest;
    this.setDataSmart({contacts:this.store.contacts})
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
    if(friendInfo.openId.slice(0,5)=="group"){
      wxp.navigateTo({
        url:"../groupChat/groupChat?friendInfo="+JSON.stringify(friendInfo)
      })
    }else{
      wxp.navigateTo({
        url:"../chat/chat?friendInfo="+JSON.stringify(friendInfo)
      })
    }
  }
  onClickNewFriends(){
    wxp.navigateTo({
      url:"../newFriends/newFriends"
    })
  }
  onClickHistory(){
    wxp.navigateTo({
      url:"../conversations/conversations"
    })
  }
}
