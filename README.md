# B站首页、视频推荐与搜索结果过滤

本分支支持在 **B站首页推荐流、视频页推荐和搜索结果流** 中隐藏命中规则的视频卡片。首页和视频推荐过滤擦边标题及黑名单 UP 主；搜索页额外使用完整词库和强相关过滤。

Fork 自 [houliabc/bilibili-search-purify](https://github.com/houliabc/bilibili-search-purify)，保留原项目的 [MIT 许可证](LICENSE)。过滤逻辑基于实际安装的 3.1 版及其本地改进，发布版本为 3.8.0，并非合并上游 3.7 的全部功能。未采用上游“所有结果被隐藏时重新显示全部结果”的兜底，以免重新放出命中黑名单的内容。

## 过滤范围

| 页面 | 过滤行为 |
| --- | --- |
| 首页推荐流 `www.bilibili.com/` | 擦边标题词库、UP 主黑名单 |
| 视频页 `/video/…` 的推荐卡片 | 擦边标题词库、UP 主黑名单，不隐藏正在播放的视频 |
| 搜索结果 `search.bilibili.com` | 完整标题词库、UP 主黑名单、搜索词相关性 |

“强相关”沿用本分支基线的文字规则：标题包含完整搜索词，或包含搜索词按字符对半拆分后的任意一半，即视为相关；单字符搜索要求包含该字符。它不是语义理解。首页和视频页不按搜索框里的文字筛选推荐。

脚本监听动态加载和卡片文字变化，重新判断新出现或被复用的卡片。它只在本地隐藏页面元素，不会发送“不感兴趣”、拉黑账号或修改 B站推荐偏好。

## 安装本分支

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)。
2. 打开 [本分支脚本安装地址](https://raw.githubusercontent.com/Kkverse404/bilibili-search-purify/main/bilibili-search-purify.user.js)。如果浏览器仅显示源码，在 Tampermonkey 新建脚本并粘贴全文保存。
3. 已安装原脚本的用户可直接在原脚本编辑器中替换全文并保存。确保只启用一个版本，随后刷新 B站页面。

本分支保留 Firefox 原装 3.1 版的脚本名称和 namespace，以便替换已有安装。主页和反馈链接指向本仓库，自动更新已关闭，避免本地规则被其他版本覆盖；后续更新请手动安装本仓库脚本。不要使用上游 GreasyFork 链接安装本分支。

## 自定义规则

在 Tampermonkey 编辑 [脚本](bilibili-search-purify.user.js) 顶部的配置：`ADULT_WORDS` 是各页面共用的擦边标题词库，`BLACKLIST_WORDS` 是搜索页完整词库，`BLACKLIST_UP_NAMES` 按 UP 主名称精确匹配。`STRICT_MATCH_MODE` 控制搜索相关性筛选。修改后保存并刷新页面。

没有设置面板、自动学习或在线黑名单。标题先转为小写；新增英文正则时请使用小写或忽略大小写标记。

## 限制与验证

只匹配标题文字和 UP 主名称，不能识别仅封面或视频画面擦边的内容。原有词库包含“漏”“女友”“姿势”等宽泛词，可能误伤正常视频；也不能保证过滤所有低质或无关推荐。页面结构变更可能导致选择器失效，不保证零闪烁。

提供 [离线 DOM 回归检查](tests/test_filter.py)，覆盖三类页面、动态新增、卡片复用、关键词切换和浏览器后退。所有页面请求均由测试夹具拦截，不访问真实 B站，不读取浏览器登录态。运行环境需要 Node.js、Python 和 Playwright：

```sh
python -m pip install playwright
python -m playwright install chromium
node --check bilibili-search-purify.user.js
python tests/test_filter.py
```

目前已通过离线 Chromium DOM 检查；尚未在 Firefox 的真实 B站页面完成安装及运行验收。
