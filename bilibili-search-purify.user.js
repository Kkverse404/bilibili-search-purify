// ==UserScript==
// @name         B站搜索结果纯净版（强相关+去擦边）
// @namespace    https://github.com/houliabc/bilibili-search-purify
// @version      3.8.0
// @description  首页和视频推荐过滤擦边标题及黑名单UP主；搜索页保留原词库和强相关过滤。
// @author       houliabc, Kkverse404
// @license      MIT
// @match        *://search.bilibili.com/*
// @match        *://www.bilibili.com/*
// @run-at       document-end
// @noframes
// @icon         https://www.bilibili.com/favicon.ico
// @supportURL   https://github.com/Kkverse404/bilibili-search-purify/issues
// @homepage     https://github.com/Kkverse404/bilibili-search-purify
// @grant        none
// @downloadURL none
// ==/UserScript==

(function() {
    'use strict';

    // ================= 配置区 =================
    // 是否开启【强制相关】模式？(true开启，false关闭)
    const STRICT_MATCH_MODE = true;

    // 黑名单词库（支持正则表达式），可以根据自己需求增删
    const ADULT_WORDS = [
    // === 1. 低俗 / 擦边 / 软色情 / 恶俗 ===
    /姿势/, /坚持\d+分钟/, /好色/, /畜生/, /擦边/, /福利/, /漏/, /丝袜/, /黑丝/, /白丝/, /性感/, /走光/, /露底/, /诱惑/, /大长腿/, /腿控/, /足控/, /烧鸡/, /懂的都懂/, /懂得都懂/, /老司机/, /车牌/, /福利姬/, /深夜/, /女友/, /绿茶/, /肉丝/, /网袜/, /蕾丝/, /深V/, /事业线/, /真空/, /凸点/, /私拍/, /挑逗/, /调情/, /情趣/, /内衣/, /睡衣/, /泳装/, /比基尼/, /火辣/, /暴露/, /清凉/, /撩人/, /魅惑/, /玉足/, /软色情/, /擦边球/, /打擦边/, /私密/, /私处/, /暧昧/, /技师/,

    ];

    const BLACKLIST_WORDS = [
    ...ADULT_WORDS,

    // === 2. 严重标题党 / 夸张情绪 / 制造焦虑 ===
    /震惊/, /颠覆认知/, /离谱/, /天花板/, /破防/, /绝绝子/, /封神/, /吓尿/, /看呆/, /看傻/, /千万不要/, /删前速看/, /全网最/, /史诗级/, /吊打/, /秒杀/, /惊呆/, /泪目/, /毁三观/, /避雷/, /这谁顶得住/, /这你受得了吗/, /谁能拒绝/, /谁懂啊/, /家人们/, /血压/, /炸了/, /疯了/, /绝了/, /yyds/, /救命/, /震碎三观/, /大开眼界/, /万万没想到/, /你敢信/, /破大防/, /蚌埠住了/, /无语死了/, /杀疯了/, /卷疯了/, /赢麻了/, /输麻了/, /神级/, /顶级/, /碾压/, /史上最强/, /全网第一/, /世界顶级/, /刷新认知/, /不敢相信/, /难以置信/, /突发/, /紧急/, /重磅/, /炸锅/, /沸腾/, /慌了/, /懵了/, /傻了/, /哭了/, /笑不活了/, /笑死人/, /大型社死/, /社会性死亡/, /离谱到家/, /天花板级/, /必看/, /必知/, /不看后悔/, /错过后悔/, /出大事了/, /轰动全国/, /99%的人不知道/,

    // === 3. 无聊烂梗 / 营销号搬运 / 常见垃圾推荐 ===
    /少爷梦/, /大型纪录片/, /不要笑/, /人类早期/, /珍贵影像/, /补档/, /防失联/, /某音/, /某手/, /纯爱战士/, /牛头人/, /大型纪录片之/, /传奇/, /注意看/, /这个男人叫小帅/, /这个女人叫小美/, /佛波勒/, /退退退/, /挖呀挖/, /听我说谢谢你/, /奥利给/, /双击666/, /老铁/, /集美/, /咱就是说/, /一整个/, /尊嘟假嘟/, /泰裤辣/, /耶斯莫拉/, /我太难了/, /emo/, /摆烂/, /躺平/, /打工人/, /搬砖/, /摸鱼/, /划水/, /没毛病/, /干就完了/,

    // === 4. 人身攻击 / 低俗辱骂 ===
    /脑残/, /智障/, /废物/, /垃圾/, /人渣/, /败类/, /杂种/, /狗东西/, /王八蛋/, /兔崽子/, /贱人/, /去死/, /该死/, /菜鸡/, /辣鸡/, /弱鸡/, /fw/, /nt/, /sb/, /屌丝/, /网暴/, /人肉搜索/,

    // === 5. 违规营销 / 私域导流 ===
    /免费送/, /点赞领/, /关注领/, /评论领/, /私信领/, /加微信/, /加v/, /vx/, /扣扣/, /qq/, /联系方式/, /私下/, /私聊/, /私我/, /加好友/, /扫码/, /二维码/, /链接/, /点击下方/, /小黄车/, /橱窗/, /下单/, /带货/, /直播带货/, /赚大钱/, /暴富/, /发财/, /兼职/, /日结/, /在家赚钱/, /月入过万/, /轻松赚钱/, /零成本/, /无门槛/, /创业/, /加盟/, /代理/, /微商/, /刷单/, /跑分/, /赌博/, /博彩/, /彩票/, /赌球/, /下注/, /回本/, /上岸/, /网贷/, /贷款/, /高利贷/, /套路贷/, /校园贷/, /私下转账/, /线下交易/, /进群/,

    // === 6. 封建迷信 / 虚假宣传 ===
    /算命/, /算卦/, /风水/, /占卜/, /八字/, /招财/, /旺运/, /辟邪/, /镇宅/, /转运/, /改运势/, /求姻缘/, /化解小人/, /逢凶化吉/, /根治/, /百分百见效/, /无效退款/, /终身保修/, /零风险/, /包治百病/,

    // === 7. 危险/不良引导 ===
    /血腥/, /暴力/, /打人/, /打架/, /自杀/, /自残/, /跳楼/, /割腕/, /上吊/, /毒品/, /吸毒/, /贩毒/, /枪支/, /管制刀具/, /炸药/
];

    // UP主黑名单
    const BLACKLIST_UP_NAMES = [
        "努力的橙子薄肌", "是有小虎牙", "换换影视", "国产纪录片传奇"
    ];
    // ==========================================

    const hiddenAttribute = 'data-bili-purify-hidden';
    const style = document.createElement('style');
    style.textContent = `[${hiddenAttribute}] { display: none !important; }`;
    document.head.appendChild(style);

    function filterGarbage() {
        const isSearch = location.hostname === 'search.bilibili.com';
        const isHome = location.hostname === 'www.bilibili.com' &&
            (location.pathname === '/' || location.pathname === '/index.html');
        const isVideo = location.hostname === 'www.bilibili.com' && location.pathname.startsWith('/video/');
        if (!isSearch && !isHome && !isVideo) return;

        const currentKeyword = isSearch
            ? (new URLSearchParams(location.search).get('keyword') ||
                document.querySelector('input.search-input-el, .nav-search-input')?.value || '').trim().toLowerCase()
            : '';
        const blacklist = isSearch ? BLACKLIST_WORDS : ADULT_WORDS;
        const cards = document.querySelectorAll(isVideo
            ? '.video-page-card-small, #reco_list .bili-video-card, .recommend-list .bili-video-card'
            : '.bili-video-card');

        cards.forEach(card => {
            const titleEl = card.querySelector('.bili-video-card__info--tit, .info .title');
            const authorEl = card.querySelector('.bili-video-card__info--author, .upname');
            const titleText = (titleEl?.getAttribute('title') || titleEl?.textContent || '').trim().toLowerCase();
            const authorName = (authorEl?.textContent || '').trim();
            const container = (isSearch
                ? card.closest('[class*="col_3"], [class*="col_xs_"]')
                : card.closest('.feed-card, .bili-feed-card')) || card;

            // shortcut: 只匹配标题文字；需要识别无敏感标题的擦边封面时再增加图像识别。
            let shouldHide = blacklist.some(regex => regex.test(titleText)) ||
                BLACKLIST_UP_NAMES.includes(authorName);

            if (!shouldHide && titleText && isSearch && STRICT_MATCH_MODE && currentKeyword) {
                const middle = Math.floor(currentKeyword.length / 2);
                const isRelevant = titleText.includes(currentKeyword) ||
                    (currentKeyword.length >= 2 &&
                        (titleText.includes(currentKeyword.substring(0, middle)) ||
                         titleText.includes(currentKeyword.substring(middle))));
                shouldHide = !isRelevant;
            }

            container.toggleAttribute(hiddenAttribute, shouldHide);
        });
    }

    let isScheduled = false;
    function scheduleFilter() {
        if (isScheduled) return;
        isScheduled = true;
        requestAnimationFrame(() => {
            isScheduled = false;
            filterGarbage();
        });
    }

    filterGarbage();
    new MutationObserver(scheduleFilter).observe(document.body, {
        childList: true, subtree: true, characterData: true,
        attributes: true, attributeFilter: ['title', 'href']
    });
    window.addEventListener('popstate', scheduleFilter);
})();
