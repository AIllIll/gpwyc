// 此文件是由模板文件 ".dtpl/component/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {MyComponent, comify} from 'base'
const recorderManager=wx.getRecorderManager();

@comify()
export default class extends MyComponent {
  /**
   * 组件的属性列表
   */
  properties = {
    current:{
      type:String,
      value:""
    },
    maxlength:{
      type:Number,
      value:1000
    }

  }

  /**
   * 组件的初始数据
   */
  data = {
    status:"keyboard",
    touchStartPageY:0,
    touchEndPageY:0,
    hasCancel:false,
    buttonText:"按住说话",
    isInputEmpty:true,
    inputValue:"",
  }
  onCreated(){
    console.log("create")
    recorderManager.onStop((res)=>{
      //console.log(res.tempFilePath)
      
      if(this.data.hasCancel){
        this.triggerEvent("Cancel",{},{})
        this.data.hasCancel=false;
      }else{
        this.triggerEvent("Finish",{tempAudioPath:res.tempFilePath},{})
        wx.showToast({
          title:"录音成功"
        })
      }
    })
  }
  /**
   * icon响应函数
   */
  onClickAudio(){
    console.log("audio")
    this.setDataSmart({
      status:"audio"
    })
  }

  onClickKeyboard(){
    console.log("keyboard")
    this.setDataSmart({
      status:"keyboard"
    })
  }

  onClickExtra(){
    console.log("extra")
    this.triggerEvent("Extra",{},{})
  }

  onClickSend(){
    console.log("send")
    this.triggerEvent("Send",{},{})
    this.setDataSmart({
      inputValue:"",
      isInputEmpty:true
    })
  }

  /**
   * 录音响应函数
   */
  onAudioTouchStart(e:any){
    console.log("start")
    //console.log("start",e.touches[0].pageY)
    recorderManager.start({format:"mp3"});//开始录音

    this.data.touchStartPageY=e.touches[0].pageY;
    this.setDataSmart({
      buttonText:"上滑取消"
    })
    
  }

  onAudioTouchEnd(e:any){
    console.log("end")
    //console.log("end",e)
    recorderManager.stop();

    this.setDataSmart({
      buttonText:"按住说话"
    })
  }

  onTouchMove(e:any){
    if(this.data.hasCancel){

    }
    else{
      //console.log(e.touches[0].pageY)
      const touchMovePageY=e.touches[0].pageY;
      const touchStartPageY=this.data.touchStartPageY;
      if(touchStartPageY-touchMovePageY>70){
        this.data.hasCancel=true;
        console.log("cancel")
        wx.showToast({
          title:"取消录音",
          icon:"none"
        })
      }
    }
  }


  /**
   * input响应函数
   */
  onInputFocus(){
    console.log("focus")
  }
  onInputBlur(e:any){
    console.log("blur")//点击其他地方的时候，是先tap后blur
    /*if(e.detail.value==""){
      this.setDataSmart({isInputEmpty:true})
    }else{
      this.setDataSmart({isInputEmpty:false})
    }*/
  }
  onInputChange(e:any){
    //console.log(e)
    const detail=e.detail;
    if(detail.value==""){
      this.setDataSmart({isInputEmpty:true})
    }else{
      this.setDataSmart({isInputEmpty:false})
    }
    this.triggerEvent("InputChange",detail,{})
  }

  /**
   * 组件属性值有更新时会调用此函数，不需要在 properties 中设置 observer 函数
   */
  onPropUpdate(prop: string, newValue: any, oldValue: any) {

  }
}

