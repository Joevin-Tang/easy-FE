
# keep-alive源码分析



<a name="a4d3b02a"></a>
## 概述

<br />在vue里面，`keep-alive` 是一个抽象组件，不存在Dom渲染，它的作用是缓存所包裹组件的实例， 而不是销毁。<br />

<a name="8ce750bd"></a>
## 源码分析

<br />先上官方参数解释<br />**Props**：<br />

- `include` - 字符串或正则表达式。只有名称匹配的组件会被缓存。
- `exclude` - 字符串或正则表达式。任何名称匹配的组件都不会被缓存。
- `max` - 数字。最多可以缓存多少组件实例。


<br />**从生命周期开始讲起**<br />既然 `keep-alive` 是一个组件，那么就会有组件的生命周期，接下来就根据这个顺序来讲述吧。<br />

```javascript
created () {
    this.cache = Object.create(null)
    this.keys = []
  }
```

<br />首先在创建完组件实例的时候会初始化两个参数，`keys` 存放组件实例对应的key，而 `cache` 则是相当于一个缓存池（代码层面就是一个对象），后面部分讲述的会更容易理解。<br />
<br />
<br />初始化后，可以看到 mounted 里添加了 watch 监听两个参数 `include` 和 `exclude` ，这是为了匹配参数然后删除不需要的缓存。如下：<br />

```javascript
mounted () {
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  }
```

<br />匹配的方式比较简单，主要通过三种方式去匹配组件名称，分别为字符串、正则表达式，字符串数组。代码如下：<br />

```javascript
// 通过正则匹配组件名称
function matches (pattern: string | RegExp | Array<string>, name: string): boolean {
  // 数组
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
    // 字符串
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
    // 正则表达式
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}
```

<br />**如何删除？？**<br />

```javascript
// 删除缓存
function pruneCache (keepAliveInstance: any, filter: Function) {
  const { cache, keys, _vnode } = keepAliveInstance
  for (const key in cache) {
    const cachedNode: ?VNode = cache[key]
    if (cachedNode) {
      const name: ?string = getComponentName(cachedNode.componentOptions)
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  } 
}

// 删除缓存条目
function pruneCacheEntry (
  cache: VNodeCache,
  key: string,
  keys: Array<string>,
  current?: VNode
) {
  const cached = cache[key]
  if (cached && (!current || cached.tag !== current.tag)) {
    // 调用实例方法销毁组件
    cached.componentInstance.$destroy()
  }
  cache[key] = null
  // 移除当前缓存的key
  remove(keys, key)
}
```

<br />以上可以看出 `pruneCache` 方法主要是遍历缓存池，匹配上的再调用 `pruneCacheEntry` 方法，实际上的删除操作在后者，这里需要注意的是删除缓存前需要把该组件实例销毁 `cached.componentInstance.$destroy()`<br />
<br />
<br />**这才是重点！**<br />核心的逻辑处理还是在 `render` 方法里<br />

```javascript
render () {
    const slot = this.$slots.default
    const vnode: VNode = getFirstComponentChild(slot)
    const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // check pattern
      const name: ?string = getComponentName(componentOptions)
      const { include, exclude } = this
      // 判断是否需要缓存
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      // 下面才是缓存处理
      const { cache, keys } = this
      const key: ?string = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
        : vnode.key
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance
        // make current key freshest
        // 让当前的key最新，先删除，再添加到数组末尾。原来这就是最新的key = =
        remove(keys, key)
        keys.push(key)
      } else {
        cache[key] = vnode
        keys.push(key)
        // prune oldest entry
        // 删除最老的条目，从前面设置最新操作可以看出，数组头部就是最老的，没毛病
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }

      vnode.data.keepAlive = true
    }
    
    return vnode || (slot && slot[0])
  }
```

<br />**简单梳理下逻辑：**<br />

- 第一步，找到包裹的组件虚拟dom节点vnode。
- 第二步，判断是否需要缓存，如果不需要则直接返回。
- 第三步，需要缓存的情况，更新缓存池。
- 第三步又分两种情况，第一种，如果缓存池已存在该vnode就直接复用，然后把 `key` 从 `keys` 里删掉，再把 `key` `push` 进 `keys`，那么就能理解为啥 `else` 块里面需要删除前端的缓存了；第二种，纯新增，直接加就完事了，然后再判断下有没有超出max，超出了就删最旧的一条。


<br />

<a name="25f9c7fa"></a>
## 总结

<br />前面罗里吧嗦说一堆，做个总结吧。<br />

- keep-alive 是个抽象组件，所以也有生命周期
- keep-alive 是通过keys和cache两个变量来管理缓存的，可以把keys看成版本号管理，cache 则是组件缓存池
- 如果与 key 对应的缓存已经存在则直接复用，再更新一把 keys
- 缓存新旧管理使用到了页面置换LRU算法，这里通过数组前端删后端增的方式，类似队列，如图：


<br />是不是很简单~
