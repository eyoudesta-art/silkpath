#!/usr/bin/env python3
"""Build public/js/institutions.js — every regular higher-education institution in mainland China.

Sources (both public):
  * Ministry of Education "全国普通高等学校名单" (the official list, .xls) — names, codes, province, city, level, notes.
    https://www.moe.gov.cn/jyb_xxgk/s5743/s5744/  (look for the newest "全国高等学校名单" notice)
  * Wikidata (CC0) — English names and official websites, matched by exact Chinese name.

Usage (needs the third-party packages xlrd and pypinyin; they are build-time only, not shipped):
    python3 -m pip install xlrd pypinyin
    python3 scripts/build_institutions.py --moe regular.xls --wikidata wd.json --as-of 2026-06-17

Wikidata query used to make wd.json (saved as SPARQL JSON):
    SELECT ?u ?zh ?en ?site WHERE {
      ?u wdt:P17 wd:Q148 ; wdt:P31/wdt:P279* wd:Q2385804 .
      ?u rdfs:label ?zh . FILTER(LANG(?zh) IN ("zh","zh-hans","zh-cn"))
      OPTIONAL { ?u rdfs:label ?en . FILTER(LANG(?en)="en") }
      OPTIONAL { ?u wdt:P856 ?site } }
"""
import argparse, collections, json, os, re, sys

PROVINCES_EN = {
    '北京市': 'Beijing', '天津市': 'Tianjin', '河北省': 'Hebei', '山西省': 'Shanxi', '内蒙古自治区': 'Inner Mongolia',
    '辽宁省': 'Liaoning', '吉林省': 'Jilin', '黑龙江省': 'Heilongjiang', '上海市': 'Shanghai', '江苏省': 'Jiangsu',
    '浙江省': 'Zhejiang', '安徽省': 'Anhui', '福建省': 'Fujian', '江西省': 'Jiangxi', '山东省': 'Shandong',
    '河南省': 'Henan', '湖北省': 'Hubei', '湖南省': 'Hunan', '广东省': 'Guangdong', '广西壮族自治区': 'Guangxi',
    '海南省': 'Hainan', '重庆市': 'Chongqing', '四川省': 'Sichuan', '贵州省': 'Guizhou', '云南省': 'Yunnan',
    '西藏自治区': 'Tibet', '陕西省': 'Shaanxi', '甘肃省': 'Gansu', '青海省': 'Qinghai', '宁夏回族自治区': 'Ningxia',
    '新疆维吾尔自治区': 'Xinjiang',
}
ETHNIC = ['回','彝','哈尼','傣','景颇','傈僳','白','藏','蒙古','哈萨克','柯尔克孜','土家','苗','侗','布依','壮','朝鲜','羌',
          '维吾尔','塔吉克','锡伯','满','瑶','纳西','拉祜','佤','布朗','基诺','怒','独龙','普米','阿昌','德昂','东乡','撒拉',
          '保安','裕固','土','仫佬','毛南','仡佬','水','京','黎','畲','高山','赫哲','鄂温克','鄂伦春','达斡尔','俄罗斯',
          '乌孜别克','塔塔尔','门巴','珞巴']


# Conventional English spellings that differ from plain pinyin.
CITY_EXCEPTIONS = {'哈尔滨市': 'Harbin', '呼和浩特市': 'Hohhot', '乌鲁木齐市': 'Urumqi', '拉萨市': 'Lhasa', '阿克苏地区': 'Aksu',
                   '喀什地区': 'Kashgar', '克拉玛依市': 'Karamay', '石河子市': 'Shihezi'}
FOREIGN_SUBSITES = ('de.', 'fr.', 'ru.', 'ja.', 'jp.', 'es.', 'ar.', 'ko.', 'kr.', 'it.', 'pt.', 'fa.', 'th.', 'vi.')


def tidy_site(url):
    from urllib.parse import urlparse
    u = urlparse(url)
    if u.scheme not in ('http', 'https') or not u.netloc: return ''
    path = u.path.rstrip('/')
    if re.match(r'^/(index|default)\.(php|html?|jsp|aspx?)$', path, re.I): path = ''
    return '%s://%s%s' % (u.scheme, u.netloc, path)


def site_rank(url):
    host = re.sub(r'^https?://', '', url).split('/')[0].lower()
    if host.startswith(FOREIGN_SUBSITES): return 0
    if host.startswith(('english.', 'en.', 'eng.')): return 3
    if host.startswith('www.') or host.count('.') <= 2: return 2
    return 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--moe', required=True); ap.add_argument('--wikidata', required=True)
    ap.add_argument('--as-of', required=True); ap.add_argument('--out', default='public/js/institutions.js')
    a = ap.parse_args()
    import xlrd
    from pypinyin import lazy_pinyin, Style

    # ---- Wikidata: zh label -> best (en, site) ----
    wd = collections.defaultdict(list)
    for b in json.load(open(a.wikidata, encoding='utf-8'))['results']['bindings']:
        zh = b['zh']['value'].strip()
        en = b.get('en', {}).get('value', '').strip()
        site = b.get('site', {}).get('value', '').strip()
        if re.match(r'^https?://', site) is None: site = ''
        wd[zh].append((en, site))

    def best(zh):
        c = wd.get(zh)
        if not c: return '', ''
        withboth = [x for x in c if x[0] and x[1]]
        pool = withboth or [x for x in c if x[0]] or c
        en = collections.Counter(x[0] for x in pool if x[0]).most_common(1)
        en = en[0][0] if en else ''
        sites = [tidy_site(x[1]) for x in pool if x[1]]
        sites = [x for x in sites if x]
        site = ''
        if sites:
            freq = collections.Counter(sites)
            site = sorted(freq, key=lambda u: (-site_rank(u), -freq[u], len(u)))[0]
        return en, site

    def city_en(city):
        if city in CITY_EXCEPTIONS: return CITY_EXCEPTIONS[city]
        c = city
        if c.endswith('自治州'):
            c = c[:-3]
            changed = True
            while changed:
                changed = False
                for e in sorted(ETHNIC, key=len, reverse=True):
                    if c.endswith(e + '族'): c = c[:-(len(e) + 1)]; changed = True; break
        c = re.sub(r'(市|地区|盟|自治县|林区|县|区)$', '', c) if len(c) > 2 else c
        return ''.join(lazy_pinyin(c, style=Style.NORMAL, v_to_u=True)).capitalize()

    sh = xlrd.open_workbook(a.moe).sheet_by_index(0)
    provinces, cities_idx, cities = [], {}, []
    rows, cur = [], None
    for r in range(sh.nrows):
        v = [str(c.value).strip() for c in sh.row(r)]
        m = re.match(r'^(.+?)（(\d+)所）$', v[0])
        if m:
            zhp = m.group(1)
            if zhp not in PROVINCES_EN: sys.exit('Unknown province header: ' + zhp)
            provinces.append({'zh': zhp, 'en': PROVINCES_EN[zhp], 'n': int(m.group(2))}); cur = len(provinces) - 1; continue
        if cur is None or not re.match(r'^\d+(\.0)?$', v[0]): continue
        name, code, auth, city, level, note = v[1], v[2], v[3], v[4], v[5], v[6]
        code = str(int(float(code))) if re.match(r'^[\d.]+$', code) else code
        if city not in cities_idx:
            cities_idx[city] = len(cities); cities.append({'zh': city, 'en': city_en(city)})
        flags = 0
        if '民办' in note: flags |= 1
        if '中外合作办学' in note: flags |= 2
        if '港澳台' in note: flags |= 4
        if auth == '教育部': flags |= 8
        en, site = best(name)
        py = ''.join(lazy_pinyin(re.sub(r'[（(].*?[）)]', '', name), style=Style.NORMAL))
        rows.append([code, name, py, en, cur, cities_idx[city], 0 if level == '本科' else 1, flags, site])

    # ---- sanity checks: fail loudly rather than ship a broken directory ----
    declared = sum(p['n'] for p in provinces)
    if len(rows) != declared: sys.exit('Row count %d != declared %d' % (len(rows), declared))
    if len({r[0] for r in rows}) != len(rows): sys.exit('Duplicate institution codes')
    if len(provinces) != 31: sys.exit('Expected 31 provincial-level regions, got %d' % len(provinces))

    data = {'asOf': a.as_of, 'provinces': provinces, 'cities': cities,
            'fields': ['code', 'zh', 'pinyin', 'en', 'province', 'city', 'level', 'flags', 'site'], 'rows': rows}
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8') as f:
        f.write('/* Generated by scripts/build_institutions.py — do not edit by hand.\n'
                ' * Source: Ministry of Education 全国普通高等学校名单 (as of %s) + Wikidata (CC0) for English names/websites.\n'
                ' * level: 0 = degree-granting (本科), 1 = vocational/associate (专科).  flags: 1 private, 2 Sino-foreign, 4 HK/Macau/Taiwan joint, 8 directly under the Ministry of Education. */\n' % a.as_of)
        f.write('window.SILKPATH_INSTITUTIONS = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    en_n = sum(1 for r in rows if r[3]); site_n = sum(1 for r in rows if r[8])
    print('institutions %d | provinces %d | cities %d | with English name %d | with website %d | %.0f KB' % (
        len(rows), len(provinces), len(cities), en_n, site_n, os.path.getsize(a.out) / 1024))


if __name__ == '__main__':
    main()
