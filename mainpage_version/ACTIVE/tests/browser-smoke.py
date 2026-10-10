"""Functional checks for the nested portfolio entry; requires local HTTP serving."""
import argparse
import json
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:8123'
URL = BASE + '/mainpage_version/ACTIVE/'
checks = 0

def check(value, message):
    global checks
    assert value, message
    checks += 1

def content(browser):
    context = browser.new_context(java_script_enabled=False)
    page = context.new_page()
    response = page.goto(URL, wait_until='load')
    check(response.status == 200 and page.locator('[data-chapter]').count() == 4, 'Four chapters must exist')
    check(page.locator('main').count() == 1, 'One main landmark')
    check('Chatchon' in page.locator('h1').inner_text(), 'Name heading')
    page.locator('.skills summary').click()
    text = page.locator('main').inner_text()
    check(all(term in text for term in ['AIS','Python','SQL','Radio Planning','CodeSnippet','Task Planner','CONY']), 'Portfolio content retained')
    page.locator('details summary').click()
    check('Chulalongkorn University' in page.locator('details').inner_text(), 'Biography retained')
    for link in page.locator('a[href]').all():
        href = link.get_attribute('href')
        if href.startswith('#'):
            check(page.locator(href).count() == 1, 'Anchor destination: ' + href)
        elif not urlparse(href).scheme:
            check(context.request.get(urljoin(URL,href)).status == 200, 'Local destination: ' + href)
    for width,height in [(1440,900),(390,844),(320,740),(844,390)]:
        page.set_viewport_size({'width':width,'height':height})
        check(page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'No overflow at {width}x{height}')
        check(page.get_by_role('navigation',name='Chapters').is_visible(), 'Navigation available without JavaScript')
    check(page.get_by_role('link',name='LinkedIn',exact=True).count() == 1, 'Contact link')
    context.close()

parser = argparse.ArgumentParser()
parser.add_argument('--phase', choices=['content','journey','all'], default='all')
args = parser.parse_args()
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    content(browser)
    browser.close()
print(json.dumps({'phase':args.phase,'passed_checks':checks}))
