#!/usr/bin/env python3
"""tools/site/build.py — builds the stand-alone website for GitHub Pages from game/.

    python3 tools/site/build.py <out-dir>

game/index.html is written for the claude.ai page host, which adds the document shell itself;
the website needs the full document, so this copies game/ and wraps the page in a proper
<!doctype html> shell with the author, description and link-preview tags.
"""
import os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..', 'game'))
TITLE = 'مغامرة برعم في وطننا'
AUTHOR = 'نسرين محمود جان، راشد أحمد عسيري'
DESC = 'لعبة تعليمية للأطفال: نتعلم الحروف والأرقام في رحلة عبر مدن المملكة. إعداد: نسرين محمود جان، برمجة وتصميم: راشد أحمد عسيري.'

HEAD = f"""<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{TITLE}</title>
<meta name="author" content="{AUTHOR}">
<meta name="description" content="{DESC}">
<meta name="theme-color" content="#0e6b3a">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{DESC}">
<meta property="og:type" content="website">
<style>:root{{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0}}[hidden]{{display:none!important}}</style>
<link rel="stylesheet" href="css/game.css">
</head>
<body>
"""

def main(out):
    if os.path.exists(out):
        for name in os.listdir(out):                  # keep the git checkout, replace everything else
            if name == '.git':
                continue
            p = os.path.join(out, name)
            shutil.rmtree(p) if os.path.isdir(p) and not os.path.islink(p) else os.remove(p)
    else:
        os.makedirs(out)
    for name in os.listdir(GAME):
        src, dst = os.path.join(GAME, name), os.path.join(out, name)
        if name == 'index.html':
            continue
        shutil.copytree(src, dst) if os.path.isdir(src) else shutil.copy2(src, dst)
    page = open(os.path.join(GAME, 'index.html'), encoding='utf-8').read()
    body = '\n'.join(l for l in page.splitlines()
                     if not re.match(r'\s*<(title|meta|link)\b', l))      # the shell above carries these
    with open(os.path.join(out, 'index.html'), 'w', encoding='utf-8') as fh:
        fh.write(HEAD + body.strip() + '\n</body>\n</html>\n')
    open(os.path.join(out, '.nojekyll'), 'w').close()  # serve the files as they are
    print('built', out)

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'site')
