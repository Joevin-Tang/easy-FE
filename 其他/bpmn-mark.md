# bpmn-mark

1. 修改属性面板表单
1. 条目工厂 引用 `'bpmn-js-properties-panel/lib/factory/EntryFactory'`，可以通过 `entryFactory`  创建对应类型的条目，

      比如：文本框 <br />
```javascript
entryFactory.textField({
  id : 'assignee',
  label : translate('Assignee'),
  modelProperty : 'assignee'
})
```


3.  BusinessObject 这是bpmn字符串对象，它的改变都会引起生成的xml的变更
3. updateBusinessObject 手动触发bpmn字符串更新
3. camunda 属性面板的一种拓展模板
3. camundaModdleDescriptor 描述camunda条目的数据结构，在这里配置的字段会在生成xml的时候加入camunda:作为前缀。

   以 assigneeName 为例。<br />1.没有加入配置，生成如下：
```xml
<bpmn:userTask id="Task_155ezdr" assigneeName="未加入配置">
  <bpmn:incoming>SequenceFlow_0a7alp9</bpmn:incoming>
</bpmn:userTask>
```
2.加入配置，生成如下：
```xml
<bpmn:userTask id="Task_155ezdr" camunda:assigneeName="加入配置">
  <bpmn:incoming>SequenceFlow_0a7alp9</bpmn:incoming>
</bpmn:userTask>
```

7. 自定义属性流程，创建tab -> 创建属性条目 -> 配置descriptors -> 导出，
7. 实现viewer的时候，如果需要拖动、快捷键，以及缩放等功能，需要引用的是

    `bpmn-js/lib/NavigatedViewer` ， `bpmn-js/lib/Viewer` 这个引用是没有以上功能的

9. [`bpmn-js-in-color`](https://github.com/bpmn-io/bpmn-js-in-color) 仅支持 版本 ^0.31.0 的 `bpmn-js`


<br />**CmdHelper - **<br />updateProperties 更新属性<br />updateBusinessObject<br />addElementsTolist<br />removeElementsFromList<br />addAndRemoveElementsFromList<br />setList
