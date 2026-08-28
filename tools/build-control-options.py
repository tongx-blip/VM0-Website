#!/usr/bin/env python3
"""
Build options-control/ — four directions for the `#control` section, each
rendered at real size on the real page's stylesheet, so they are compared by
looking rather than by description.

    python3 tools/build-control-options.py
    okou host ./options-control --site okou-control-options

Why four. The shipped version answered feedback 16-20 and Tong's verdict was
"设计太平淡了，就是简单的排版" — with the terms for fixing it stated exactly:

    简单的排版 → 对视觉要求非常高
    更新颖的交互 → 需要 ui 更加简洁
    either way 都可以，但是我要看到的是高质量

So two of these take the first bet and two take the second, and none of them
is the shipped layout with better spacing.

What is fixed in all four
  · 16  The card is the product's REAL in-chat permission card
        (`PermissionActionCard`, chat-body-cards.tsx) — the one that appears in
        the conversation mid-run. The shipped version used the standalone
        `/permission-allow` page instead, which is a different component with a
        different shape and an orange confirm; the in-chat one is a single 88px
        row with a NEUTRAL bordered confirm.
  · 17  The cloud machine is an illustration, in the page's own hand-drawn
        brand register, generated for this and not a UI drawing.
  · 18  Gone. No credential/network card anywhere.
  · 19  The activity trail is one clause in a closing line, never a picture.
  · 20  Every direction is one screen or less.
"""
import hashlib
import os
import re
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'site')
OUT = os.path.join(ROOT, 'options-control')

CHEV = ('<svg class="ico-chev" viewBox="0 0 24 24" fill="none" stroke-width="2" '
        'stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')
TICK = ('<svg class="ico-tick" viewBox="0 0 24 24" fill="none" stroke-width="2" '
        'stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>')


# ══════════════════════════════════════════════════════════════════════
#  The product's real in-chat permission card.
#
#  Read out of `PermissionActionCard` / `PermissionActionCardContent` in
#  turbo/apps/platform/src/views/okou-page/chat-body-cards.tsx:
#
#    shell    min-h-[88px] rounded-lg border-border/70 bg-background/85 p-3
#             shadow-sm, flex-col on mobile, flex-row + justify-between on sm
#    icon     h-10 w-10 rounded-lg border-border/70 bg-muted/40, mark at 22
#    title    text-[0.9375rem] font-medium   →  "{connector} permissions"
#    detail   text-sm leading-5 muted        →  "{Allow|Deny} {permission}"
#    controls PermissionGrantDurationSelect (h-8 w-[116px] rounded-lg text-xs)
#             then the confirm: h-9 rounded-lg BORDER + bg-background, NOT the
#             brand primary. That is the single biggest tell that the shipped
#             card was the wrong component.
#
#  Strings are the product's own (common.json → chat.permissions / chat.actions),
#  and the connector, scope and description come from the connector catalog:
#  GET api.vm0.ai/api/connector-catalog/google-ads/permissions.
# ══════════════════════════════════════════════════════════════════════

def pcard(state='ready', dur='1 hour'):
    """state: ready | saved"""
    if state == 'saved':
        right = '<span class="pcard__done">%s Permissions updated</span>' % TICK
    else:
        right = ('<span class="pcard__sel">%s%s</span>'
                 '<span class="pcard__go">Confirm</span>' % (dur, CHEV))
    return (
        '<div class="pcard" data-state="%s">'
        '<span class="pcard__l">'
        '<span class="pcard__ic"><img src="assets/connectors/google-ads.svg" alt="" '
        'width="22" height="22"></span>'
        '<span class="pcard__t"><b>Google Ads permissions</b>'
        '<i>Allow campaign-budgets.write</i></span>'
        '</span>'
        '<span class="pcard__c">%s</span>'
        '</div>' % (state, right))


SPOT = ('<img class="spot" src="assets/brand/spot-cloud-machine.png" alt="" '
        'width="900" height="900" loading="lazy">')

# The claims. Every sentence is lifted from the shipped section — the wording is
# Tong's and design work does not rewrite it (RULES K1). What each direction
# changes is which of them survive and how they are shown.
CLAIM_PERM = ('Grant access one connector and one action at a time, per Agent. '
              'Sensitive writes wait for an explicit approval instead of running '
              'on their own — and it is a person who answers it.')
CLAIM_ISO = ('Each run gets its own microVM: a fresh machine with nothing left '
             'over from the last task and no route to another run’s files. '
             'When the work finishes the machine is destroyed.')
NOTE = ('Every run keeps an activity trail: what was read, what was written, who '
        'approved it and when — and the engine underneath is open source, so '
        'the behaviour can be checked rather than believed.')

HEAD = ('<h2 class="display display--center"><span class="line">Everything stays</span>'
        '<span class="line">under <mark class="mark mark--red">your control.</mark></span></h2>')
LEDE = ('<p class="section-body">Decide what each Agent and each workflow can read, '
        'change, and approve. Permissions follow the person, not the automation.</p>')


# ══════════════════════════════════════════════════════════════════════
#  A · The ask, in the conversation
#     Bet: simple layout, and ALL of the craft in one true picture.
#     One product window, cropped at the band edge the way every other
#     product visual on this page is (RULES P6, P9). The permission card is
#     not a specimen on a slide — it is where it actually appears, in a run
#     that has stopped to wait for a person.
# ══════════════════════════════════════════════════════════════════════

def option_a():
    return '''
<section class="panel panel--card oc" id="a">
  %s
  %s
  <div class="oa">
    <div class="oa__win">
      <div class="ochat oa__chat">
        <div class="ochat__row ochat__row--user">
          <p class="ochat__bubble">Where did last week’s spend actually go?</p>
        </div>
        <div class="ochat__row ochat__row--okou">
          <span class="ochat__ava"><img src="assets/brand/agent-okou.svg" alt="" width="48" height="48"></span>
          <p class="ochat__bubble">$2,770 across three campaigns. Blended ROAS 2.74x, and one of the three is carrying it.</p>
        </div>
        <div class="ochat__row ochat__row--user">
          <p class="ochat__bubble">Rebalance this week’s paid budget toward whatever is actually converting.</p>
        </div>
        <div class="ochat__row ochat__row--okou">
          <span class="ochat__ava"><img src="assets/brand/agent-okou.svg" alt="" width="48" height="48"></span>
          <p class="ochat__bubble">Broad Test is at 1.1x ROAS and Founder Ops at 3.8x. I can move 30%% of Broad Test’s spend across — total spend stays flat.</p>
        </div>
        <div class="ochat__row ochat__row--okou oa__ask">
          <span class="ochat__ava"><img src="assets/brand/agent-okou.svg" alt="" width="48" height="48"></span>
          <div class="oa__cardwrap">%s</div>
        </div>
        <div class="ochat__row ochat__row--okou oa__cut">
          <span class="ochat__ava"><img src="assets/brand/agent-okou.svg" alt="" width="48" height="48"></span>
          <p class="ochat__bubble">Waiting on that one before I touch anything.</p>
        </div>
      </div>
    </div>
    <div class="oa__side">
      <p class="oa__claim">%s</p>
      <p class="oa__claim oa__claim--iso"><span class="oa__spot">%s</span>%s</p>
    </div>
  </div>
  <p class="note">%s</p>
</section>''' % (HEAD, LEDE, pcard(), CLAIM_PERM, SPOT, CLAIM_ISO, NOTE)


# ══════════════════════════════════════════════════════════════════════
#  B · The drawing carries it
#     Bet: simple layout, and the visual quality comes from the brand's own
#     warmth layer at full size rather than from another grey rectangle.
#     The spot is the subject; the real card laps its lower edge, so the
#     abstract claim and the literal product touch each other.
# ══════════════════════════════════════════════════════════════════════

def option_b():
    return '''
<section class="panel panel--card oc" id="b">
  %s
  %s
  <div class="ob">
    <figure class="ob__fig">
      %s
      <div class="ob__card">%s</div>
    </figure>
    <div class="ob__txt">
      <p class="ob__claim"><b>It asks, and a person answers.</b> %s</p>
      <p class="ob__claim"><b>It runs somewhere else.</b> %s</p>
    </div>
  </div>
  <p class="note">%s</p>
</section>''' % (HEAD, LEDE, SPOT, pcard(), CLAIM_PERM, CLAIM_ISO, NOTE)


# ══════════════════════════════════════════════════════════════════════
#  C · One machine, three states
#     Bet: the interaction IS the idea, so the UI gets out of its way.
#     No headings, no captions, no columns — one object, one sentence, and
#     the run's own life playing on it: it asks, it is granted for an hour,
#     it is destroyed. The card's real terminal state does the second beat
#     ("Permissions updated" is the product's own string), which is why this
#     only works with the RIGHT card.
# ══════════════════════════════════════════════════════════════════════

def option_c():
    beats = [
        ('asks', 'It stops and asks. One connector, one action, and a person answers it.'),
        ('granted', 'Granted for an hour — to this Agent, for this action, by a person.'),
        ('gone', 'The machine it ran on is destroyed, with nothing carried to the next task.'),
    ]
    dots = ''.join('<button class="occ__dot" data-go="%d" aria-label="State %d"></button>'
                   % (i, i + 1) for i in range(3))
    lines = ''.join('<p class="occ__line" data-beat="%s">%s</p>' % (k, t) for k, t in beats)
    return '''
<section class="panel panel--card oc" id="c">
  %s
  <div class="occ" id="occ" data-beat="asks">
    <div class="occ__stage">
      <div class="occ__machine">%s</div>
      <div class="occ__card">%s</div>
      <div class="occ__card occ__card--done">%s</div>
    </div>
    <div class="occ__say">%s</div>
    <div class="occ__dots">%s</div>
  </div>
  <p class="note">%s</p>
</section>''' % (HEAD, SPOT, pcard(), pcard('saved'), lines, dots, NOTE)


# ══════════════════════════════════════════════════════════════════════
#  D · The dark interlude
#     Bet: atmosphere, and brevity. The page already ends on a dark band, so
#     a second dark moment is in the language rather than an import. Nothing
#     here is a column of claims: one drawing on a lit sheet, one card, two
#     lines. It is the shortest of the four, and the point is that it reads
#     as a breath between two white sections rather than a chapter.
# ══════════════════════════════════════════════════════════════════════

def option_d():
    return '''
<section class="panel od" id="d">
  <div class="od__in">
    <div class="od__l">
      <h2 class="od__h">Everything stays<br>under <mark class="mark mark--red">your control.</mark></h2>
      <p class="od__p">%s</p>
      <p class="od__p od__p--dim">%s</p>
    </div>
    <div class="od__r">
      <figure class="od__sheet">%s</figure>
      <div class="od__card">%s</div>
    </div>
  </div>
  <p class="od__note">%s</p>
</section>''' % (CLAIM_PERM, CLAIM_ISO, SPOT, pcard(), NOTE)


OPTIONS = [
    ('A', 'The ask, in the conversation',
     'Simple layout · the craft is one true picture',
     'One product window, cropped at the band edge like every other product visual '
     'on this page. The card is not a specimen — it is a run that has stopped to '
     'wait for a person. The drawing is a footnote beside the second claim.',
     option_a),
    ('B', 'The drawing carries it',
     'Simple layout · the visual quality is the illustration',
     'The spot at full size is the subject, and the real card laps its lower edge so '
     'the abstract claim and the literal product touch. Warmest of the four, and the '
     'closest to the brand layer the rest of the page already uses.',
     option_b),
    ('C', 'One machine, three states',
     'Novel interaction · so the UI gets out of the way',
     'No headings, no captions, no columns. One object and one sentence, with the '
     'run’s own life playing on it: it asks, it is granted for an hour, it is '
     'destroyed. The middle beat is the card’s real terminal state.',
     option_c),
    ('D', 'The dark interlude',
     'Novel form · shortest, and the only one with a mood',
     'The page already ends on a dark band, so a second dark moment is in the '
     'language. One drawing on a lit sheet, one card, two lines — a breath '
     'between two white sections rather than a chapter.',
     option_d),
]


def build():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    shutil.copy(os.path.join(SITE, 'styles.css'), OUT)
    # only the assets these four actually reference — the site's assets/ is
    # 10MB and a review build that takes a minute to publish gets looked at
    # less often than one that takes five seconds
    # …plus everything styles.css itself points at with url(): `okou host`
    # refuses to publish a stylesheet whose assets are missing, and it is right
    # to — a review build with holes in it is worse than a slow one.
    css = open(os.path.join(OUT, 'styles.css'), encoding='utf-8').read()
    wanted = {'brand/spot-cloud-machine.png', 'brand/agent-okou.svg',
              'connectors/google-ads.svg'}
    wanted |= {m.split('?')[0] for m in
               re.findall(r'url\(\s*assets/([^)\'"\s]+)', css)}
    for rel in sorted(wanted):
        src = os.path.join(SITE, 'assets', rel)
        if not os.path.isfile(src):
            continue
        dst = os.path.join(OUT, 'assets', rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy(src, dst)
    with open(os.path.join(OUT, 'robots.txt'), 'w') as f:
        f.write('User-agent: *\nDisallow: /\n')
    shutil.copy(os.path.join(ROOT, 'tools', 'control-options.css'),
                os.path.join(OUT, 'variants.css'))
    shutil.copy(os.path.join(ROOT, 'tools', 'control-options.js'),
                os.path.join(OUT, 'variants.js'))

    blocks = []
    for key, title, bet, blurb, fn in OPTIONS:
        blocks.append(
            '<section class="opt" id="opt-%s" aria-labelledby="h-%s">'
            '<div class="opt__head">'
            '<p class="opt__k">%s</p>'
            '<h2 class="opt__t" id="h-%s">%s</h2>'
            '<p class="opt__bet">%s</p>'
            '<p class="opt__blurb">%s</p>'
            '</div>'
            '<div class="opt__frame">%s</div>'
            '</section>' % (key.lower(), key.lower(), key, key.lower(), title, bet, blurb, fn()))

    html = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Control section · four directions</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="variants.css">
</head>
<body class="opts">
<header class="opts__head">
  <p class="opts__k">Feedback 16–20 · four directions</p>
  <h1 class="opts__h">The security section, four ways</h1>
  <p class="opts__l">Each one is the real section at real size, on the real stylesheet.
  All four fix 16 with the product’s <b>in-chat</b> permission card, answer 17 with a
  drawing, delete 18, demote 19 to the closing line, and fit one screen.
  A and B take the <b>simple layout / high visual craft</b> bet; C and D take the
  <b>newer interaction / simpler UI</b> one.</p>
</header>
<main>
%s
</main>
<footer class="opts__foot"><p>Nothing here is merged. Pick one, or a mix.</p></footer>
<script src="variants.js"></script>
</body>
</html>''' % ('\n'.join(blocks))

    # version every local asset the way the site build does, so a re-publish is
    # never read from cache (RULES R1, R8)
    def stamp(m):
        path = m.group(2)
        full = os.path.join(OUT, path.split('?')[0])
        if not os.path.isfile(full):
            return m.group(0)
        h = hashlib.sha1(open(full, 'rb').read()).hexdigest()[:8]
        return '%s="%s?v=%s"' % (m.group(1), path.split('?')[0], h)

    html = re.sub(r'(src|href)="((?:assets|variants|styles)[^"]*)"', stamp, html)
    with open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    kb = sum(os.path.getsize(os.path.join(dp, f))
             for dp, _, fs in os.walk(OUT) for f in fs) / 1024
    print('options-control/  %d directions  %.0f KB' % (len(OPTIONS), kb))


if __name__ == '__main__':
    build()
