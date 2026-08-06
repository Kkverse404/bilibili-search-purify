// ==UserScript==
// @name         B站搜索结果纯净版
// @namespace    http://tampermonkey.net/
// @version      3.7
// @description  标题含关键词任意一部分即保留，黑名单二次过滤
// @author       AI Assistant
// @match        *://search.bilibili.com/*
// @match        *://*.bilibili.com/*
// @icon         https://www.bilibili.com/favicon.ico
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const STRICT_MATCH_MODE = true;
    const AUTO_RELIEVE_WHITE_SCREEN = true;

    // 停用词：匹配前统一剔除，避免助词打断匹配
    const STOP_WORDS_REGEX = /的|了|也|都|是|在|与|和|或|并|而|及|以及|怎么|如何|为什么|什么|居然|竟然|原来是|居然是|啊|呀|吧|呢|吗/g;

    const BLACKLIST_WORDS = [
        /姿势/, /坚持\d+分钟/, /好色/, /畜生/, /擦边/, /福利/, /漏/, /丝袜/, /黑丝/, /白丝/,
        /性感/, /走光/, /露底/, /诱惑/, /大长腿/, /腿控/, /足控/, /烧鸡/, /懂的都懂/,
        /老司机/, /车牌/, /福利姬/, /深夜/, /女友/, /绿茶/, /肉丝/, /网袜/, /蕾丝/,
        /深V/, /事业线/, /真空/, /凸点/, /私拍/, /挑逗/, /调情/, /情趣/, /内衣/, /睡衣/,
        /泳装/, /比基尼/, /火辣/, /暴露/, /清凉/, /撩人/, /魅惑/, /玉足/, /软色情/,
        /擦边球/, /打擦边/, /私密/, /私处/, /暧昧/, /技师/,

        /震惊/, /颠覆认知/, /离谱/, /天花板/, /破防/, /绝绝子/, /封神/, /吓尿/, /看呆/,
        /看傻/, /千万不要/, /删前速看/, /全网最/, /史诗级/, /吊打/, /秒杀/, /惊呆/,
        /泪目/, /毁三观/, /避雷/, /这谁顶得住/, /这你受得了吗/, /谁能拒绝/, /谁懂啊/,
        /家人们/, /血压/, /炸了/, /疯了/, /绝了/, /yyds/, /救命/, /震碎三观/,
        /大开眼界/, /万万没想到/, /你敢信/, /破大防/, /蚌埠住了/, /无语死了/,
        /杀疯了/, /卷疯了/, /赢麻了/, /输麻了/, /神级/, /顶级/, /碾压/, /史上最强/,
        /全网第一/, /世界顶级/, /刷新认知/, /不敢相信/, /难以置信/, /突发/, /紧急/,
        /重磅/, /炸锅/, /沸腾/, /慌了/, /懵了/, /傻了/, /哭了/, /笑不活了/,
        /笑死人/, /大型社死/, /社会性死亡/, /离谱到家/, /天花板级/, /必看/, /必知/,
        /不看后悔/, /错过后悔/, /出大事了/, /轰动全国/, /99%的人不知道/,

        /少爷梦/, /大型纪录片/, /不要笑/, /人类早期/, /珍贵影像/, /补档/, /防失联/,
        /某音/, /某手/, /纯爱战士/, /牛头人/, /大型纪录片之/, /传奇/, /注意看/,
        /这个男人叫小帅/, /这个女人叫小美/, /佛波勒/, /退退退/, /挖呀挖/,
        /听我说谢谢你/, /奥利给/, /双击666/, /老铁/, /集美/, /咱就是说/, /一整个/,
        /尊嘟假嘟/, /泰裤辣/, /耶斯莫拉/, /我太难了/, /emo/, /摆烂/, /躺平/,
        /打工人/, /搬砖/, /摸鱼/, /划水/, /没毛病/, /干就完了/,

        /脑残/, /智障/, /废物/, /垃圾/, /人渣/, /败类/, /杂种/, /狗东西/, /王八蛋/,
        /兔崽子/, /贱人/, /去死/, /该死/, /菜鸡/, /辣鸡/, /弱鸡/, /fw/, /nt/, /sb/,
        /屌丝/, /网暴/, /人肉搜索/,

        /免费送/, /点赞领/, /关注领/, /评论领/, /私信领/, /加微信/, /加v/, /vx/,
        /扣扣/, /qq/, /联系方式/, /私下/, /私聊/, /私我/, /加好友/, /扫码/, /二维码/,
        /小黄车/, /橱窗/, /下单/, /带货/, /直播带货/, /赚大钱/, /暴富/, /发财/,
        /兼职/, /日结/, /在家赚钱/, /月入过万/, /轻松赚钱/, /零成本/, /无门槛/,
        /创业/, /加盟/, /代理/, /微商/, /刷单/, /跑分/, /赌博/, /博彩/, /彩票/,
        /赌球/, /下注/, /回本/, /上岸/, /网贷/, /贷款/, /高利贷/, /套路贷/,
        /校园贷/, /私下转账/, /线下交易/, /进群/,

        /算命/, /算卦/, /风水/, /占卜/, /八字/, /招财/, /旺运/, /辟邪/, /镇宅/,
        /转运/, /改运势/, /求姻缘/, /化解小人/, /逢凶化吉/, /根治/, /百分百见效/,
        /无效退款/, /终身保修/, /零风险/, /包治百病/,

        /血腥/, /暴力/, /打人/, /打架/, /自杀/, /自残/, /跳楼/, /割腕/, /上吊/,
        /毒品/, /吸毒/, /贩毒/, /枪支/, /管制刀具/, /炸药/
    ];

    const BLACKLIST_UP_NAMES = [
        "努力的橙子薄肌", "是有小虎牙", "换换影视", "国产纪录片传奇"
    ];

    // 清洗文本：去停用词、去标点空格、转小写
    function cleanText(text) {
        return text
            .toLowerCase()
            .replace(STOP_WORDS_REGEX, '')
            .replace(/[\s,，.。!！?？、；：:;"'“”‘’()（）【】\[\]+\-—_/\\|~`@#$%^&*=]/g, '')
            .trim();
    }

    // 增强版关键词获取
    function getSearchKeyword() {
        const urlParams = new URLSearchParams(window.location.search);
        let keyword = urlParams.get('keyword') || urlParams.get('search') || urlParams.get('q') || urlParams.get('query');
        if (keyword) return keyword.trim().toLowerCase();

        const inputSelectors = [
            'input.search-input-el',
            '.nav-search-input',
            '.search-input',
            'input[type="text"]',
        ];
        for (const sel of inputSelectors) {
            const input = document.querySelector(sel);
            if (input && input.value.trim()) {
                return input.value.trim().toLowerCase();
            }
        }

        const titleMatch = document.title.match(/^(.*?)\s*[-|]\s*搜索结果/);
        if (titleMatch) return titleMatch[1].trim().toLowerCase();

        return '';
    }

    // ========== 核心修改：宽松匹配逻辑 ==========
    // 规则：标题包含搜索词中任意 ≥2 字的连续片段，就算相关
    function isTitleRelevant(titleText, keyword) {
        const cleanKeyword = cleanText(keyword);
        const cleanTitle = cleanText(titleText);

        // 整词直接命中，直接通过
        if (cleanTitle.includes(cleanKeyword)) return true;

        // 提取搜索词中所有连续 2 字片段，任意一个命中即通过
        if (cleanKeyword.length >= 2) {
            for (let i = 0; i <= cleanKeyword.length - 2; i++) {
                const fragment = cleanKeyword.slice(i, i + 2);
                if (cleanTitle.includes(fragment)) {
                    return true;
                }
            }
        }

        // 搜索词只有 1 个字的兜底情况
        if (cleanKeyword.length === 1) {
            return cleanTitle.includes(cleanKeyword);
        }

        return false;
    }

    function filterGarbage() {
        const currentKeyword = getSearchKeyword();
        console.log('%c[B站纯净版] 获取到的搜索词:', 'color: #00bcd4; font-weight: bold', currentKeyword || '(无)');

        const videoCards = document.querySelectorAll('.bili-video-card');
        console.log("[B站纯净版] 视频卡片数量:", videoCards.length);
        if (videoCards.length === 0) return;

        let visibleCount = 0;

        videoCards.forEach((card) => {
            const titleEl = card.querySelector('.bili-video-card__info--tit') ||
                            card.querySelector('.bili-video-card__title a') ||
                            card.querySelector('a[title]');
            const authorEl = card.querySelector('.bili-video-card__info--author') ||
                             card.querySelector('.bili-video-card__author');
            if (!titleEl || !authorEl) return;

            const titleText = (titleEl.getAttribute('title') || titleEl.innerText).toLowerCase().trim();
            const authorName = authorEl.innerText.trim();

            let colContainer = card.closest('.col_3, .col_xs_1_5, .col_md_2, .col_xl_1_7, .video-list-item, .bili-video-card__wrap');
            if (!colContainer) colContainer = card;

            colContainer.style.display = '';
            card.style.display = '';

            // ========== 相关性判断 ==========
            let isRelevant = false;
            if (STRICT_MATCH_MODE && currentKeyword !== '') {
                isRelevant = isTitleRelevant(titleText, currentKeyword);
            } else {
                isRelevant = true;
            }

            if (!isRelevant) {
                console.log(`[B站纯净版] 隐藏无关: "${titleText}"`);
                colContainer.style.display = 'none';
                return;
            }

            // ========== 黑名单过滤 ==========
            let shouldHide = false;
            let hideReason = '';
            for (let regex of BLACKLIST_WORDS) {
                if (currentKeyword && regex.test(currentKeyword)) continue;
                if (regex.test(titleText)) {
                    shouldHide = true;
                    hideReason = `黑名单词: "${regex.source}"`;
                    break;
                }
            }
            if (!shouldHide && BLACKLIST_UP_NAMES.includes(authorName)) {
                shouldHide = true;
                hideReason = `UP主黑名单: "${authorName}"`;
            }

            if (shouldHide) {
                console.log(`[B站纯净版] 隐藏垃圾: "${titleText}"，原因: ${hideReason}`);
                colContainer.style.display = 'none';
            } else {
                visibleCount++;
            }
        });

        // 白屏兜底
        if (AUTO_RELIEVE_WHITE_SCREEN && visibleCount === 0 && videoCards.length > 0) {
            console.warn('[B站纯净版] ⚠️ 所有结果均被屏蔽，已自动放宽匹配规则，避免白屏');
            videoCards.forEach(card => {
                const container = card.closest('.col_3, .col_xs_1_5, .col_md_2, .col_xl_1_7, .video-list-item, .bili-video-card__wrap') || card;
                container.style.display = '';
            });
        }
    }

    // 防抖 + DOM监听
    let isScheduled = false;
    const observer = new MutationObserver(() => {
        if (!isScheduled) {
            isScheduled = true;
            requestAnimationFrame(() => {
                filterGarbage();
                isScheduled = false;
            });
        }
    });

    filterGarbage();
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    // 监听SPA地址变化
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(filterGarbage, 150);
        }
    }).observe(document, { subtree: true, childList: true });

})();
