#!/usr/bin/env python3
"""Pre-render the Persian pages (fa/*.html) from the English source pages.

English pages at the repo root are the source of truth for structure. Every element
with data-i18n / data-i18n-html gets its Persian text from build/fa.json.
Run:  python3 build/build.py
"""
import json, re, sys
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
FA = json.loads((ROOT / 'build' / 'fa.json').read_text(encoding='utf-8'))
DOMAIN = (ROOT / 'CNAME').read_text().strip() if (ROOT / 'CNAME').exists() else 'YOUR-DOMAIN.ir'
DIGITS = '۰۱۲۳۴۵۶۷۸۹'
TICKER = ['آمادگی هوش مصنوعی', 'تحلیل داده', 'هوش تجاری', 'حمل‌ونقل هوشمند', 'پشتیبانی تصمیم']
PAGES = {  # file: (title key, desc key, og title key, og desc key)
    'index.html': ('meta.title', 'meta.desc', 'og.title', 'og.desc'),
    'research.html': ('meta.rtitle', 'meta.rdesc', 'og.rtitle', 'og.rdesc'),
}

def to_fa(s):
    s = re.sub(r'\d', lambda m: DIGITS[int(m.group())], s)
    return re.sub(r'([۰-۹])\.([۰-۹])', r'\1٫\2', s)

def set_meta(soup, attr, name, value):
    tag = soup.find('meta', attrs={attr: name})
    if tag is not None:
        tag['content'] = value

def build(page):
    soup = BeautifulSoup((ROOT / page).read_text(encoding='utf-8'), 'html.parser')
    tkey, dkey, otkey, odkey = PAGES[page]
    html = soup.html
    html['lang'], html['dir'] = 'fa', 'rtl'
    for a in ('data-fa-url',):
        html.attrs.pop(a, None)
    soup.body['class'] = soup.body.get('class', []) + ['rtl']

    missing = []
    for el in soup.select('[data-i18n]'):
        k = el['data-i18n']
        if k in FA: el.string = FA[k]
        else: missing.append(k)
    for el in soup.select('[data-i18n-html]'):
        k = el['data-i18n-html']
        if k in FA:
            el.clear(); el.append(BeautifulSoup(FA[k], 'html.parser'))
        else: missing.append(k)
    for el in soup.select('[data-num]'):
        for t in list(el.find_all(string=True)):
            t.replace_with(to_fa(str(t)))
    if missing: sys.exit(f'{page}: missing FA keys {sorted(set(missing))}')

    soup.title.string = FA[tkey]
    set_meta(soup, 'name', 'description', FA[dkey])
    set_meta(soup, 'property', 'og:title', FA[otkey]); set_meta(soup, 'name', 'twitter:title', FA[otkey])
    set_meta(soup, 'property', 'og:description', FA[odkey]); set_meta(soup, 'name', 'twitter:description', FA[odkey])
    set_meta(soup, 'property', 'og:locale', 'fa_IR')
    alt = soup.find('meta', attrs={'property': 'og:locale:alternate'})
    if alt: alt['content'] = 'en_US'

    # URLs: canonical / og:url point at the /fa/ version
    path = '' if page == 'index.html' else 'research.html'
    for tag, attr in ((soup.find('link', rel='canonical'), 'href'), (soup.find('meta', attrs={'property': 'og:url'}), 'content')):
        if tag: tag[attr] = f'https://{DOMAIN}/fa/{path}'
    ld = soup.find('script', type='application/ld+json')
    if ld:
        data = json.loads(ld.string); data['url'] = f'https://{DOMAIN}/fa/'; data['inLanguage'] = 'fa'
        ld.string = json.dumps(data, ensure_ascii=False)

    # Persian pages preload the Persian fonts instead of the Latin ones
    for t in soup.find_all('link', rel='preload'):
        h = t.get('href', '')
        if 'manrope' in h: t['href'] = 'assets/fonts/vazirmatn-arabic-800-normal.woff2'
        elif 'dm-sans' in h: t['href'] = 'assets/fonts/vazirmatn-arabic-400-normal.woff2'

    # relative asset paths -> ../
    def up(v): return v if re.match(r'(https?:|mailto:|tel:|#|\.\./)', v) else '../' + v
    for tag in soup.find_all(['link', 'script', 'img', 'a']):
        for attr in ('href', 'src'):
            v = tag.get(attr)
            if v and tag.name != 'a' and not tag.get('rel') == ['alternate']:
                tag[attr] = up(v)
            elif v and tag.name == 'a' and v.startswith('assets/'):
                tag[attr] = up(v)
    for a in soup.select('[data-cv]'):
        a['href'] = a['href'].replace('_EN.pdf', '_FA.pdf')

    # language switch -> English
    lb = soup.find(id='langBtn')
    lb.string = 'EN'
    lb['href'] = '../' + ('' if page == 'index.html' else 'research.html')
    lb['hreflang'], lb['lang'], lb['data-set-lang'] = 'en', 'en', 'en'
    lb['aria-label'] = FA['aria.lang']
    soup.find(id='menuBtn')['aria-label'] = FA['aria.menu']
    soup.find(id='themeBtn')['aria-label'] = FA['aria.theme']
    tk = soup.find(id='ticker')
    if tk:
        tk.clear()
        for item in TICKER * 2:
            s = soup.new_tag('span'); s.string = item; tk.append(s)

    out = ROOT / 'fa' / page
    out.parent.mkdir(exist_ok=True)
    out.write_text(soup.decode(formatter='minimal'), encoding='utf-8')
    print('built', out.relative_to(ROOT))

for p in PAGES: build(p)
