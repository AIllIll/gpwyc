// 此文件是由模板文件 ".dtpl/component/$rawModuleName.ts.dtpl" 生成的，你可以自行修改模板

import {MyComponent, comify} from 'base'

@comify()
export default class extends MyComponent {
  /**
   * 组件的属性列表
   */
  properties = {
    full: {
        type: Boolean,
        value: false
    },
    avatarUrl: {
        type: String,
        value: ''
    },
    badge:{
        type: String,
        value: ''
    },
    nickName: {
        type: String,
        value: ''
    },
    motto: {
      type: String,
      value: ''
    },
    extra: {
        type: String,
        value: ''
    }
  }

  /**
   * 组件属性值有更新时会调用此函数，不需要在 properties 中设置 observer 函数
   */
  onPropUpdate(prop: string, newValue: any, oldValue: any) {

  }
}

