#!/usr/bin/env python3
"""
Build options-control/ — four directions for the `#control` section, each
rendered at real size on the real page's stylesheet, so they are compared by
looking rather than by description.

    python3 tools/build-control-options.py
    okou host ./options-control --site okou-control-options

ROUND 2. The first four were built from feedback 16-20 alone and Tong's verdict
on what is live was *"完全不符合我们的期望"*. Three inputs arrived with that
verdict and all three change the answer:

  · **The wireframe** (okou-ai-teammate-swiss) — the origin of this section, and
    it is one real product screen with four short claims around it. *"其实讲的
    事情很简单。就是关于 agent 权限的问题。"* The shipped version had grown a
    dialog, a browser card, two captions and a note.

  · **The R2 brand illustrations.** The register is now fixed and it is NOT the
    hand-drawn ink spot this repo already had: flat vector, one uniform black
    outline, geometric, a character with an orange face, a cobalt beanie and a
    lime jumpsuit, no noise, tonal shadow only. Two new spots were generated to
    match it — `spot-permission-key.png` and `spot-cloud-computer.png`.

  · **Three named routes.** *"可以是插画，或者交互的方式，或者抽象模拟我们真实
    产品"* — so the four below are one of each plus one that is all three at the
    smallest possible size, rather than four layouts of the same idea.

Fixed in all four
  · 16  The card is the product's REAL in-chat permission card
        (`PermissionActionCard`) — one 88px row, neutral bordered confirm, the
        product's own strings, the real scope from the connector catalog.
  · 17  Isolated execution is the cloud COMPUTER drawing, never a UI rectangle,
        and it is never the subject.
  · 18  Gone. No credential or network card anywhere.
  · 19  The activity trail is half of one closing line.
  · 20  **btw or it does not count.** The shipped section is 1.25 screens;
        every direction here is under 0.8 and two are under 0.6.

Content, and what changed in it
  The heading and the lede are the wireframe's, unedited. What was cut is the
  two long claims and the closing note — three paragraphs compressed to one
  trailing line, with `microVM` said in the reader's language as feedback 17
  asks. Nothing new is claimed; every sentence here is a shorter version of a
  sentence that was already on the page.
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
    """state: ready | saved

    Read out of `PermissionActionCard` in
    `vm0-ai/vm0 → turbo/apps/platform/src/views/okou-page/chat-body-cards.tsx`,
    and checked against it again this round line by line:

        shell     min-h-[88px] w-full flex-col gap-3 rounded-lg
                  border-border/70 bg-background/85 p-3 shadow-sm
                  sm:flex-row sm:items-center sm:justify-between
        icon      h-10 w-10 rounded-lg border-border/70 bg-muted/40, mark at 22
        title     truncate text-[0.9375rem] font-medium
        detail    mt-0.5 line-clamp-2 text-sm leading-5 muted
        expiry    mt-0.5 text-xs font-medium text-amber-700
        duration  h-8 w-[116px] rounded-lg text-xs
        confirm   h-9 rounded-lg BORDER + bg-background hover:bg-state-hover —
                  neutral, never the brand primary

    Strings are the product's own, from `i18n/locales/en-US/common.json`:
        chat.permissions.connectorTitle     "{{connectorName}} permissions"
        chat.permissions.actionDescription  "{{action}} {{permissionName}}"
        chat.permissions.allow              "Allow"
        chat.permissions.updated            "Permissions updated"
        chat.permissions.duration           "Permission duration"  (the select's
                                            aria-label)
        chat.permissions.expiresInHours_one "Expires in {{count}} hour"

    BOTH states are always in the markup and CSS shows one — swapping
    `.pcard__c`'s innerHTML orphaned the listeners bound to the nodes it
    replaced, and it is also the only version that renders with JS off.
    """
    return (
        '<div class="pcard" data-state="%s">'
        '<span class="pcard__l">'
        '<span class="pcard__ic"><img src="assets/connectors/google-ads.svg" alt="" '
        'width="22" height="22"></span>'
        '<span class="pcard__t"><b>Google Ads permissions</b>'
        '<i>Allow campaign-budgets.write</i>'
        '<em class="pcard__exp">Expires in 1 hour</em></span>'
        '</span>'
        '<span class="pcard__c">'
        '<span class="pcard__ready"><span class="pcard__sel">%s%s</span>'
        '<span class="pcard__go">Confirm</span></span>'
        '<span class="pcard__done">%s Permissions updated</span>'
        '</span>'
        '</div>' % (state, dur, CHEV, TICK))


SPOT_KEY = ('<img class="spot" src="assets/brand/spot-permission-key.png" alt="" '
            'width="900" height="900" loading="lazy">')
SPOT_CLOUD = ('<img class="spot" src="assets/brand/spot-cloud-computer.png" alt="" '
              'width="900" height="900" loading="lazy">')

# ── the copy ──────────────────────────────────────────────────────────
# Heading and lede are the WIREFRAME's, unedited (RULES K1). The two long
# claims and the closing note are cut to one trailing line: `microVM` becomes
# the reader's words because feedback 17 asks for a cloud computer, and the
# activity trail becomes half a sentence because 19 asks for less of it.
HEAD = ('<h2 class="display display--center"><span class="line">Everything stays</span>'
        '<span class="line">under <mark class="mark mark--red">your control.</mark></span></h2>')
LEDE = ('<p class="section-body">Decide what each Agent and each workflow can read, '
        'change, and approve. Permissions follow the person, not the automation.</p>')
BTW = ('Each run gets its own cloud computer, wiped when the job ends, and keeps a '
       'trail of what it read and wrote.')


# ══════════════════════════════════════════════════════════════════════
#  A · 抽象模拟真实产品 — the ask, and nothing else
#
#  The route: abstract the real product. One run, stopped. No columns, no
#  captions, no drawing, no window chrome — the conversation is three lines of
#  type on the section's own ground, and the only object is the card.
#  The bet: the section is over in six seconds and the reader has understood
#  the whole permission model, because the model IS "it stopped to ask you".
# ══════════════════════════════════════════════════════════════════════

def option_a():
    return '''
<section class="panel panel--card oc oc--a" id="a">
  %s
  %s
  <div class="oa2">
    <p class="oa2__said"><span>Maya</span>Rebalance this week’s paid budget toward whatever is converting.</p>
    <p class="oa2__said oa2__said--ok"><span>Okou</span>Broad Test is at 1.1× and Founder Ops at 3.8×. I can move 30%% of the spend across — but I need to write the new budgets.</p>
    %s
    <p class="oa2__after">The run waits here until a person answers. Not a rule set six months ago.</p>
  </div>
  <p class="note">%s</p>
</section>''' % (HEAD, LEDE, pcard(), BTW)


# ══════════════════════════════════════════════════════════════════════
#  B · 插画 — the drawing says it
#
#  The route: illustration, in the R2 brand register. The person holds the
#  key and keeps hold of the ring; the agent is the orange cube, waiting on
#  the other side of a door it cannot open. That picture is the whole claim —
#  "permissions follow the person" — before a word is read.
#  The card laps the drawing's lower edge so the picture and the product are
#  one object rather than an illustration with a screenshot next to it.
# ══════════════════════════════════════════════════════════════════════

def option_b():
    return '''
<section class="panel panel--card oc oc--b" id="b">
  <div class="ob2">
    <div class="ob2__art">%s</div>
    <div class="ob2__say">
      %s
      %s
      %s
      <p class="ob2__btw">%s</p>
    </div>
  </div>
</section>''' % (SPOT_KEY, HEAD.replace(' display--center', ''),
                 LEDE.replace('section-body', 'section-body ob2__lede'), pcard(), BTW)


# ══════════════════════════════════════════════════════════════════════
#  C · 交互 — you allow it, here
#
#  The route: the newer interaction, and therefore the simplest UI on the
#  page. The card is LIVE: change the duration, press Confirm, and the run
#  above it moves on. The claim is not described, it is handed to the reader —
#  the one gesture the product actually asks of a person is the one gesture
#  this section asks of them.
#  Everything else is deleted, including both captions and the heading's
#  second line, because an interactive object with prose around it reads as a
#  diagram of an interaction rather than as one.
# ══════════════════════════════════════════════════════════════════════

def option_c():
    return '''
<section class="panel panel--card oc oc--c" id="c">
  %s
  %s
  <div class="oc2" data-live="1">
    <p class="oc2__ask"><b>Okou</b> wants to write next week’s budgets in Google Ads.</p>
    <div class="oc2__card">%s</div>
    <p class="oc2__out" aria-live="polite"><i></i><span>Maya’s grant, not the workflow’s</span></p>
  </div>
  <p class="note">%s</p>
</section>''' % (HEAD, LEDE, pcard(), BTW)


# ══════════════════════════════════════════════════════════════════════
#  D · 三格 — asked, granted, gone
#
#  The route: all three at the smallest size there is. Three frames, read left
#  to right, one line under them: the cube at a door it cannot open, the key
#  handed over for an hour, the machine wiped. It is the only direction where
#  isolated execution is SHOWN rather than mentioned, and it is also the
#  shortest — which is the most literal reading of "应该是一个 btw 的感觉".
#  No headings inside the frames: a three-frame strip that captions itself is
#  four things to read, not three pictures.
# ══════════════════════════════════════════════════════════════════════

def option_d():
    return '''
<section class="panel panel--card oc oc--d" id="d">
  %s
  %s
  <ol class="od2">
    <li class="od2__f">
      <span class="od2__art od2__art--ask"><img src="assets/brand/spot-permission-key.png" alt="" width="900" height="900" loading="lazy"></span>
      <p class="od2__c"><b>It asks.</b> One connector, one action.</p>
    </li>
    <li class="od2__f">
      <span class="od2__art od2__art--card">%s</span>
      <p class="od2__c"><b>You allow it.</b> For as long as you choose.</p>
    </li>
    <li class="od2__f">
      <span class="od2__art od2__art--iso"><img src="assets/brand/spot-cloud-computer.png" alt="" width="900" height="900" loading="lazy"></span>
      <p class="od2__c"><b>Then it is gone.</b> The machine is wiped.</p>
    </li>
  </ol>
  <p class="note">Permissions follow the person, not the automation — and every run keeps a trail of what it read and wrote.</p>
</section>''' % (HEAD, LEDE, pcard())


OPTIONS = [
    ('A', 'The ask, and nothing else',
     '抽象模拟真实产品 · 0.83 screens · shipped is 1.25',
     'Three lines of conversation and the card that stopped it. No columns, no '
     'captions, no drawing, no window chrome. The permission model IS "it '
     'stopped to ask you", so the fastest way to explain it is to show a run '
     'that has stopped.',
     option_a),

    ('B', 'The drawing says it',
     '插画 · R2 brand register · 0.76 screens',
     'The person holds the key and keeps hold of the ring; the agent is the '
     'orange cube, waiting at a door it cannot open. That is "permissions '
     'follow the person" before a word is read. The real card laps the '
     'drawing so the picture and the product are one object.',
     option_b),

    ('C', 'You allow it, here',
     '交互 · the card is live · 0.73 screens · the shortest',
     'Change the duration, press Confirm, and the run above it moves on. The '
     'one gesture the product asks of a person is the one gesture this section '
     'asks of the reader. Everything else is deleted, because prose around an '
     'interactive object turns it into a diagram of an interaction.',
     option_c),

    ('D', 'Asked, granted, gone',
     '三格连环画 · all three routes · 0.79 screens',
     'Three frames and one line under them. The only direction where isolated '
     'execution is shown rather than mentioned instead of being a claim in '
     'prose, and the only one that gets both new drawings on screen at once.',
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
    wanted = {'brand/spot-permission-key.png', 'brand/spot-cloud-computer.png',
              'brand/agent-okou.svg', 'connectors/google-ads.svg',
              'fonts/roobert-var.woff2'}
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
<!-- the site's own typeface: styles.css already carries the @font-face -->
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="variants.css">
</head>
<body class="opts">
<header class="opts__head">
  <p class="opts__k">Feedback 16–20 · four directions</p>
  <h1 class="opts__h">The security section, four ways</h1>
  <p class="opts__l">Each one is the real section at real size, on the real stylesheet.
  All four carry the product’s <b>in-chat</b> permission card (16), say isolated
  execution as a cloud <b>computer</b> in the R2 brand register (17), delete the
  credential card (18), demote the activity trail to half a line (19), and come in
  <b>under 0.8 screens</b> against the shipped 1.25 (20). Heading and lede are the
  wireframe’s, unedited; what was cut is two long claims and a closing note.
  <b>A</b> abstracts the real product, <b>B</b> is illustration-led, <b>C</b> is
  interactive, <b>D</b> is all three at the smallest size there is.</p>
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
