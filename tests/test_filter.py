from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = (ROOT / 'bilibili-search-purify.user.js').read_text(encoding='utf-8')
checks = 0


def check(page, selector, hidden):
    global checks
    if hidden:
        expect(page.locator(selector)).to_be_hidden()
    else:
        expect(page.locator(selector)).to_be_visible()
    checks += 1


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    # All origins are served from local fixtures; no requests reach Bilibili.
    page.route('**/*', lambda route: route.fulfill(
        content_type='text/html', body='<html><head></head><body></body></html>'))

    page.goto('https://www.bilibili.com/?keyword=python')
    page.set_content('''<input class="nav-search-input" value="python">
        <div class="feed-card" id="adult"><div class="bili-video-card">
          <h3 class="bili-video-card__info--tit">黑丝展示</h3></div></div>
        <div class="bili-feed-card" id="normal"><div class="bili-video-card">
          <h3 class="bili-video-card__info--tit">烹饪教程</h3></div></div>
        <div class="bili-video-card" id="headline">
          <h3 class="bili-video-card__info--tit">震惊，学习方法</h3></div>
        <div class="bili-video-card" id="blocked-up">
          <h3 class="bili-video-card__info--tit">日常分享</h3>
          <span class="bili-video-card__info--author"> 是有小虎牙 </span></div>''')
    page.add_script_tag(content=SCRIPT)
    check(page, '#adult', True)
    check(page, '#normal', False)
    check(page, '#headline', False)
    check(page, '#blocked-up', True)
    page.locator('#adult h3').evaluate('(e) => e.textContent = "旅行记录"')
    check(page, '#adult', False)
    page.locator('#normal h3').evaluate('(e) => e.setAttribute("title", "性感展示")')
    check(page, '#normal', True)
    page.evaluate('''document.body.insertAdjacentHTML('beforeend',
        '<div class="bili-video-card" id="lazy"><h3 class="bili-video-card__info--tit">擦边合集</h3></div>')''')
    check(page, '#lazy', True)

    page.goto('https://www.bilibili.com/video/BVfixture?keyword=python')
    page.set_content('''<h1 id="player-title">性感标题不应隐藏当前播放器</h1>
        <div class="video-page-card-small" id="rec-adult"><div class="info">
          <a><p class="title">黑丝展示</p></a></div></div>
        <div class="video-page-card-small" id="rec-normal"><div class="info">
          <a><p class="title">做饭教程</p></a><span class="upname">厨师</span></div></div>
        <div class="video-page-card-small" id="rec-up"><div class="info">
          <a><p class="title">日常</p></a><span class="upname">是有小虎牙</span></div></div>''')
    page.add_script_tag(content=SCRIPT)
    check(page, '#rec-adult', True)
    check(page, '#rec-normal', False)
    check(page, '#rec-up', True)
    check(page, '#player-title', False)

    page.goto('https://search.bilibili.com/all?keyword=python')
    page.set_content('''<div class="col_3" id="related"><div class="bili-video-card">
          <h3 class="bili-video-card__info--tit">python 教程</h3></div></div>
        <div class="col_xs_3" id="unrelated"><div class="bili-video-card">
          <h3 class="bili-video-card__info--tit">烹饪教程</h3></div></div>
        <div class="bili-video-card" id="search-adult">
          <h3 class="bili-video-card__info--tit">python 黑丝</h3></div>
        <div class="bili-video-card" id="search-headline">
          <h3 class="bili-video-card__info--tit">python 震惊</h3></div>''')
    page.add_script_tag(content=SCRIPT)
    check(page, '#related', False)
    check(page, '#unrelated', True)
    check(page, '#search-adult', True)
    check(page, '#search-headline', True)
    page.evaluate('''history.pushState({}, '', '?keyword=烹饪');
        document.body.appendChild(document.createElement('span'));''')
    check(page, '#related', True)
    check(page, '#unrelated', False)
    page.evaluate('history.back()')
    check(page, '#related', False)
    check(page, '#unrelated', True)

    page.goto('https://search.bilibili.com/all')
    page.set_content('''<input class="search-input-el" value="python">
        <div class="bili-video-card" id="fallback">
          <h3 class="bili-video-card__info--tit">烹饪教程</h3></div>''')
    page.add_script_tag(content=SCRIPT)
    check(page, '#fallback', True)

    page.goto('https://www.bilibili.com/other/')
    page.set_content('<div class="bili-video-card" id="other"><h3 class="bili-video-card__info--tit">黑丝</h3></div>')
    page.add_script_tag(content=SCRIPT)
    check(page, '#other', False)
    assert not errors, errors
    browser.close()
print(f'PASS: {checks} DOM behavior checks; zero script errors; network fully intercepted.')
