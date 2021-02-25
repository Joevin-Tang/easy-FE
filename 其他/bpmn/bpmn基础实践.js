# bpmn.js基础实践


<br />

<a name="df368884"></a>
## 前言

---

      由于近期参与的一个bpm项目，刚好涉及到bpmn流程图，故选了bpmn.js作为技术支持。不得不说它确实很强大，唯一的缺点就是只有英文文档，生态圈并不是很丰富。尽管过程痛苦，但结果还是好的。写下此文也是为了记录实践的过程。<br />
<br />

<a name="70b5b455"></a>
## 快速安装

---

`yarn add bpmn-js`<br />`yarn add bpmn-js-properties-panel`<br />`yarn add camunda-bpmn-moddle`<br />ps: 包的具体作用后面会解释<br />
<br />
<br />
<br />

<a name="bc120b21"></a>
## 用法

---

以下代码都是基于vue实现<br />
<br />

<a name="4af1215f"></a>
### 基础用法

---

首先实现一个基础版的，仅查看和节点的编辑。这里需要一个html标签作为载体，实例化后再通过`importXML` 方法导入准备好的xml字符串，那么就可以完成初始化了。<br />
<br />
<br />没有比上代码更有说服力了：<br />

```vue
<template>
  <div class="containers">
    <!-- 画板 -->
    <div class="canvas" ref="canvas" />
  </div>
</template>

<script>
  // 引入核心包
  import BpmnModeler from 'bpmn-js/lib/Modeler'
  export default {
    methods: {
      initCanvas () {
      	const canvas = this.$refs.canvas
        // 实例化-创建画板
        this.bpmnModeler = new BpmnModeler({
            container: canvas,
        })
        // 导入xml
        this.bpmnModeler.importXML(xmlStr, err => {
          if (err) {
              console.log('error rendering: ', err)
          } else {
              console.log('rendered:')
          }
        })
      }
    }
  }
</script>
```

<br />成功加载后大概是这样的：<br />![image.png](https://cdn.nlark.com/yuque/0/2020/png/191574/1583654894872-3065d7ca-efb1-4860-b061-a1746ca4cbc8.png#align=left&display=inline&height=340&name=image.png&originHeight=200&originWidth=389&size=5570&status=done&style=shadow&width=661#align=left&display=inline&height=200&originHeight=200&originWidth=389&status=done&style=none&width=389)<br />
<br />

<a name="bff5f7db"></a>
### 工具栏&属性面板

---

既然是建模器，那么没有工具栏和属性面板是没有灵魂的。接下来分别把这两个模块添加进去propertiesPanelModule & propertiesProviderModule，工具栏会自动集成到画板里面，属性面板需要额外提供一个载体。这里需要注意的是如果需要属性面板的功能必须添加工具栏，否则无效。<br />
<br />
<br />ex：<br />

```vue
<template>
  <div class="containers">
    <!-- 画板 -->
    <div class="canvas" ref="canvas" />
    <!-- 右侧属性面板 -->
    <div id="js-properties-panel" class="panel" />
  </div>
</template>

<script>
  // 引入核心包
  import BpmnModeler from 'bpmn-js/lib/Modeler'
  // 右侧属性面板
  import propertiesPanelModule from 'bpmn-js-properties-panel'
  import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'
  import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda'

  // 左边工具栏以及编辑节点的样式
  import 'bpmn-js/dist/assets/diagram-js.css'
  import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
  import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
  import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
  // 右侧属性面板样式
  import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css'
  
  export default {
    methods: {
      initCanvas () {
      	const canvas = this.$refs.canvas
        // 实例化-创建画板
        this.bpmnModeler = new BpmnModeler({
            container: canvas,
            additionalModules: [
              // 左边工具栏以及节点
              propertiesProviderModule,
              // 右侧属性面板
              propertiesPanelModule
            ],
            // needed if you'd like to maintain camunda:XXX properties in the properties panel
            moddleExtensions: {
              camunda: camundaModdleDescriptor
            }
        })
      }
    }
  }
</script>
```

<br />ok，生成之后大概是这样的，官方demo页：[快点我！](https://demo.bpmn.io/)<br />![image.png](https://cdn.nlark.com/yuque/0/2020/png/191574/1583658232424-873cfee3-bae2-4740-9147-5f105adad0aa.png#align=left&display=inline&height=593&name=image.png&originHeight=1186&originWidth=2220&size=207566&status=done&style=none&width=1110#align=left&display=inline&height=1186&originHeight=1186&originWidth=2220&status=done&style=none&width=2220)<br />看起来已经是五脏俱全了，但英文还在啊，好在有提供i18n的接口。虽然官方有提供部分的中文配置，但还是有欠缺的，需要自行配置。<br />
<br />

<a name="2cf26cbf"></a>
### 功能完善

---

以上已经实现了基本的建模器，但还是有许多地方需要完善的，类似于保存下载，还有右下角碍眼的logo等。那么接下来就一项一项地去完善。<br />

1. 添加i18n，具体的配置后面会提供，具体配置可以下载附件看demo



```javascript
// i18
import customTranslate from './customBpmn/customTranslate/customTranslate'

var customTranslateModule = {
  translate: ['value', customTranslate]
}

 this.bpmnModeler = new BpmnModeler({
   container: canvas,
   additionalModules: [
     // i18
     customTranslateModule
   ],
 })
```


2. 去掉右下角logo



```javascript
// XML加载完后 删除 bpmn logo
const bjsIoLogo = document.querySelector('.bjs-powered-by')
bjsIoLogo.style.cssText = 'display: none;'
```


3. 增加保存xml和svg功能，这里是实现了下载功能，可根据具体的需求做对应的处理。



```javascript

    // 提交
    handleSave () {
      this.bpmnModeler.saveXML({ format: true }, (err, xml) => {
        if (err) {
          return this.$Message.error(err)
        }
        // TODO
      })
    },
    // 下载svg
    handleSaveSvg () {
      this.bpmnModeler.saveSVG({ format: true }, (err, data) => {
        let dataTrack = 'svg'
        this.downLoadFile(dataTrack, data)
      })
    },
    // 下载xml
    handleSaveXml () {
      this.bpmnModeler.saveXML({ format: true }, (err, data) => {
        let dataTrack = 'bpmn'
        this.downLoadFile(dataTrack, data)
      })
    },
    downLoadFile (dataTrack, data) {
      const a = document.createElement('a')

      let name = `diagram.${dataTrack}`

      a.setAttribute(
        'href',
        `data:application/bpmn20-xml;charset=UTF-8,${encodeURIComponent(data)}`
      )
      a.setAttribute('target', '_blank')
      a.setAttribute('dataTrack', `diagram:download-${dataTrack}`)
      a.setAttribute('download', name)

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    },
```


4. 增加撤销和恢复功能



```javascript
  // 恢复
  handleRedo () {
    this.bpmnModeler.get('commandStack').redo()
  },
  // 撤销
  handleUndo () {
    this.bpmnModeler.get('commandStack').undo()
  }
```


5. 小地图 TODO



```javascript
// 小地图
import minimapModule from 'diagram-js-minimap'
// 小地图样式
import 'diagram-js-minimap/assets/diagram-js-minimap.css'

this.bpmnModeler = new BpmnModeler({
  container: canvas,
  additionalModules: [
    minimapModule
  ]
});
```

<br />写到这建模器的基本功能都可以使用了，当然它还有其他的也不错的功能，待后续慢慢挖掘。<br />
<br />
<br />附上demo：[bpmn-demo.rar](https://cdn.nlark.com/yuque/0/2020/rar/191574/1586248036766-557cbe15-a93f-486e-875e-6dce0beb1585.rar?_lake_card=%7B%22uid%22%3A%221584675274679-0%22%2C%22src%22%3A%22https%3A%2F%2Fcdn.nlark.com%2Fyuque%2F0%2F2020%2Frar%2F191574%2F1586248036766-557cbe15-a93f-486e-875e-6dce0beb1585.rar%22%2C%22name%22%3A%22bpmn-demo.rar%22%2C%22size%22%3A258108%2C%22type%22%3A%22%22%2C%22ext%22%3A%22rar%22%2C%22progress%22%3A%7B%22percent%22%3A99%7D%2C%22status%22%3A%22done%22%2C%22percent%22%3A0%2C%22id%22%3A%22sq5yy%22%2C%22refSrc%22%3A%22https%3A%2F%2Fwww.yuque.com%2Fattachments%2Fyuque%2F0%2F2020%2Frar%2F191574%2F1584675274942-8120a160-a010-4b24-a5f6-1cda9dfcfe1a.rar%22%2C%22card%22%3A%22file%22%7D)

---



<a name="ddaeaafd"></a>
## 待续...
