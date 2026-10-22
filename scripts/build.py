#!/usr/bin/env python3
"""Silkpath build: copy public/ -> dist/, stamp deploy-time values, verify the result.

No dependencies (Python 3.8+ stdlib only), so it runs on any free CI runner and on a laptop.

    python3 scripts/build.py --out dist \
        --site-url https://USER.github.io/silkpath/ \
        --repo-url https://github.com/USER/silkpath
"""
import argparse, datetime, os, re, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public')
TEXT_EXT = ('.html', '.js', '.json', '.xml', '.txt', '.webmanifest', '.css')


def git_sha():
    sha = os.environ.get('GITHUB_SHA') or os.environ.get('COMMIT_REF') or os.environ.get('CF_PAGES_COMMIT_SHA')
    if sha:
        return sha[:7]
    try:
        return subprocess.check_output(['git', 'rev-parse', '--short', 'HEAD'], cwd=ROOT, stderr=subprocess.DEVNULL).decode().strip()
    except Exception:
        return 'local'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='dist')
    ap.add_argument('--site-url', default='', help='Public URL of the site, e.g. https://user.github.io/silkpath/')
    ap.add_argument('--repo-url', default='', help='GitHub repository URL (enables the "report a wrong number" link)')
    a = ap.parse_args()

    out = os.path.abspath(os.path.join(ROOT, a.out))
    if os.path.commonpath([out, ROOT]) != ROOT or out == ROOT or out == SRC:
        sys.exit('Refusing to write outside the project or over public/: ' + out)
    if os.path.exists(out):
        shutil.rmtree(out)
    shutil.copytree(SRC, out)

    site = a.site_url.strip()
    if site and not site.endswith('/'):
        site += '/'
    if site and not re.match(r'^https?://', site):
        sys.exit('--site-url must start with http:// or https://')
    now = datetime.datetime.utcnow()
    build_id = now.strftime('%Y%m%d') + '-' + git_sha()
    tokens = {
        '__SITE_URL__': site or './',
        '__REPO_URL__': a.repo_url.strip().rstrip('/'),
        '__BUILD_ID__': build_id,
        '__BUILD_DATE__': now.strftime('%Y-%m-%d'),
    }
    changed = 0
    for dp, _, files in os.walk(out):
        for f in files:
            if not f.endswith(TEXT_EXT):
                continue
            p = os.path.join(dp, f)
            s = open(p, encoding='utf-8').read()
            n = s
            for k, v in tokens.items():
                n = n.replace(k, v)
            if n != s:
                open(p, 'w', encoding='utf-8').write(n)
                changed += 1

    # ---- verification: fail the build rather than ship something broken ----
    problems = []
    if site:
        for dp, _, files in os.walk(out):
            for f in files:
                if f.endswith(TEXT_EXT):
                    s = open(os.path.join(dp, f), encoding='utf-8').read()
                    left = [t for t in tokens if t in s and t != '__REPO_URL__']
                    if left:
                        problems.append('%s still contains %s' % (os.path.relpath(os.path.join(dp, f), out), ', '.join(left)))
    sw = open(os.path.join(out, 'sw.js'), encoding='utf-8').read()
    m = re.search(r'const CORE = \[(.*?)\];', sw, re.S)
    core = re.findall(r"'([^']+)'", m.group(1)) if m else []
    if not core:
        problems.append('sw.js: could not read the CORE precache list')
    for item in core:
        path = os.path.join(out, 'index.html' if item == './' else item)
        if not os.path.exists(path):
            problems.append('sw.js precaches a missing file: ' + item)
    index = open(os.path.join(out, 'index.html'), encoding='utf-8').read()
    for ref in re.findall(r'(?:href|src)="((?!https?:|#|data:|mailto:)[^"]+)"', index):
        if not os.path.exists(os.path.join(out, ref.split('?')[0])):
            problems.append('index.html references a missing file: ' + ref)
    if problems:
        print('BUILD FAILED')
        for p in problems:
            print('  -', p)
        sys.exit(1)

    total = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(out) for f in fs)
    print('Built %s  (build %s, %d files stamped, %.0f KB total)' % (os.path.relpath(out, ROOT), build_id, changed, total / 1024))


if __name__ == '__main__':
    main()
