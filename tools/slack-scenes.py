#!/usr/bin/env python3
"""
Draw the Outputs scenes that are genuinely a team channel as Slack, and
take the painted photograph out from behind the ones that are not.

    python3 tools/slack-scenes.py

WHICH SCENES ARE A CHANNEL. The test is not "could more than one person
care about this" — everything passes that. It is "does this work actually
happen in a channel, with more than one person in it":

  · Storefront Launch — brief, build, review, announce. Four hands.
  · Incident Triage   — incidents ARE a channel: several responders, a bot
                        posting, an on-call handover in the morning.
  · Team Digest       — the output IS a channel post. "Post it to #team."
  · Ad Campaign       — "a draft in Meta, waiting on you". The approval is
                        the collaboration, and approvals happen in channels.

And which are one person's job, and keep Okou's own conversation:

  · Lead Scoring  — a background job whose hand-off is to HubSpot, not to
                    people.
  · Spec Writing  — one PM writing; shared for comment afterwards.
  · Board Deck    — one exec, before a board meeting, confidential by
                    nature.

Those three lose the painted ground and take a soft wash in their own
scene hue instead — see `--ochat-tint` in src/css/system.css.

The Slack container keeps `.ochat`/`.ochat__row`, so the conversation
timeline in app.js drives every scene with no change; rows carry their own
`data-cue` so a scene's timing no longer depends on an array indexed by
row order and shared with the scenes that are not Slack.

Copy note: where a line already existed it is kept close to verbatim. The
brief was to change who is in the room, not what the work is.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, 'site', 'index.html')

# .jpg, not .png — the people became photographs in `51e4d5a` and the files
# were renamed with them. This constant still said .png, so the next run of
# this generator silently re-broke every facepile: six 404s that no gate
# looks for. If the set changes format again, this is the line.
AVA = 'assets/brand/avatar-%d.jpg'

# One face per person, everywhere they appear. Okou is not in here: it is
# an app in this workspace and wears the product's mark, not a face.
# avatar-1 and avatar-4 are both light-skinned and auburn, and at 36px they
# read as the same person, so no thread may cast both. Ravi took 3.
WHO = {'Maya': 2, 'Dan': 3, 'Lin': 5, 'Sam': 6, 'Noah': 4, 'Ravi': 3}

REACT = ('<img class="slk__emoji" src="assets/icons/emoji-2705.svg" alt="" '
         'width="15" height="15">')

# one person's job — Okou's own conversation, on a wash in the scene hue
WASHED = ('sales', 'product', 'leadership')

CUES = {'ask': 0, 'reply': 1240, 'result': 1980,
        'react': 2700, 'ask2': 3400, 'reply2': 4100}


def at(name):
    return '<mark class="slk__at">@%s</mark>' % name


def unfurl(service, title, url):
    return ('<div class="slk__unfurl">'
            '<p class="slk__unfurl-h">'
            # the agent's face, not the brand cube — the line is attributed to
            # the teammate who posted it. 18px in a circle: the avatar is a
            # painted square, so at Slack's 14px unrounded it read as a chip.
            '<span class="slk__unfurl-ic"><img src="assets/avatars/agent-okou.png" '
            'alt="" width="18" height="18"></span>%s</p>'
            '<p class="slk__unfurl-t">%s</p>'
            '<p class="slk__unfurl-u">%s</p></div>' % (service, title, url))


def msg(beat, who, time, body, agent=False, extra='', cont=False):
    """One message. `cont` is Slack's grouped form: a second message from
    the same sender drops the avatar and the name line and hangs at the
    first one's text indent."""
    if cont:
        return ('\n              <div class="ochat__row slk__msg slk__msg--cont" '
                'data-beat="%s" data-cue="%d">'
                '<span class="slk__av slk__av--gap" aria-hidden="true"></span>'
                '<div class="slk__body"><p class="slk__say">%s</p>%s</div></div>'
                % (beat, CUES[beat], body, extra))
    badge = '<i class="slk__badge">AGENT</i>' if agent else ''
    # THE AGENT IS A FACE, in the same 36px circle a person gets. The CSS has
    # said so since the avatar system landed; this generator was still writing
    # the brand cube, so the markup and the stylesheet disagreed until Tong
    # pointed at it: *"把这些老的logo都换成agent avatar"*.
    face = ('<span class="slk__av slk__av--okou">'
            '<img src="assets/avatars/agent-okou.png" alt="" width="36" height="36"></span>'
            if agent else
            '<span class="slk__av"><img src="%s" alt="" width="36" height="36"></span>'
            % (AVA % WHO[who]))
    return (
        '\n              <div class="ochat__row slk__msg" data-beat="%s" data-cue="%d">%s'
        '<div class="slk__body"><p class="slk__meta">'
        '<b>%s</b>%s<time>%s</time></p>'
        '<p class="slk__say">%s</p>%s</div></div>'
        % (beat, CUES[beat], face, who, badge, time, body, extra))


SCENES = {
  'marketing': dict(
    channel='launch-litoral', count='8', faces=(2, 3, 5, 6),
    rows=[
      ('ask', 'Maya', '9:24 AM',
       at('Okou') + ' build the Litoral one-pager — hero, the story, three room '
       'tiles. Brand kit is in Drive.', {}),
      ('reply', 'Okou', '9:24 AM',
       'Read the brand brief. Publishing as soon as it reads right.', dict(agent=True)),
      ('result', 'Okou', '9:26 AM', 'Published. Live now:',
       dict(agent=True, cont=True,
            extra=unfurl('Okou&#8202;·&#8202;Published', 'Litoral Coastal Hotel Site',
                         'okou-artifact-litoral-hotel.sites.vm0.io'))),
      ('ask2', 'Dan', '9:31 AM',
       'Reads well. Can you send the launch note to the list?', {}),
      ('reply2', 'Okou', '9:31 AM',
       'Drafted in Gmail — unsent, yours to send.', dict(agent=True)),
    ]),

  'engineering': dict(
    channel='incident-checkout', count='13', faces=(5, 6, 3, 1),
    rows=[
      ('ask', 'Lin', '2:06 AM',
       at('Okou') + ' something broke overnight. Group the Sentry noise by cause '
       'and open issues for anything that actually matters.', {}),
      ('reply', 'Okou', '2:07 AM',
       '1,111 events, eight root causes. Two crossed the threshold.', dict(agent=True)),
      ('result', 'Okou', '2:07 AM', 'Issues opened for those two:',
       dict(agent=True, cont=True,
            extra=unfurl('Okou&#8202;·&#8202;GitHub', 'checkout/session — 2 issues opened',
                         'github.com/vm0-ai/vm0/issues'))),
      ('ask2', 'Sam', '7:40 AM', 'Taking the checkout one.', {}),
      ('reply2', 'Okou', '7:40 AM',
       'Assigned to you, with the Sentry group linked on it.', dict(agent=True)),
    ]),

  'ops': dict(
    channel='team', count='24', faces=(4, 3, 2, 6),
    rows=[
      ('ask', 'Noah', 'Fri 4:50 PM',
       at('Okou') + ' put together what the team shipped this week and post it '
       'here every Monday morning.', {}),
      ('reply', 'Okou', 'Fri 4:51 PM',
       'Digest is written and the schedule is set — Mondays at nine, in here.',
       dict(agent=True)),
      ('result', 'Okou', 'Mon 9:00 AM', 'Week of 24 August:',
       dict(agent=True, cont=True,
            extra=unfurl('Okou&#8202;·&#8202;Scheduled', 'Weekly team digest',
                         'okou-artifact-team-digest.sites.vm0.io'))),
      ('ask2', 'Ravi', 'Mon 9:14 AM',
       'Useful. Can you add the Linear board next week?', {}),
      ('reply2', 'Okou', 'Mon 9:14 AM',
       'Added — it will be in Monday&#8217;s.', dict(agent=True)),
    ]),

  'ads': dict(
    channel='paid-acquisition', count='6', faces=(2, 3, 4, 5),
    rows=[
      ('ask', 'Maya', '11:02 AM',
       at('Okou') + ' our CPC is drifting on the AI-tools keywords. Tell me where '
       'the money is going and draft the shift.', {}),
      ('reply', 'Okou', '11:03 AM',
       'Two ad sets are carrying the drift. Moved $183 out of them and left the '
       'rest alone.', dict(agent=True)),
      ('result', 'Okou', '11:03 AM', 'Draft is in Meta, waiting on approval:',
       dict(agent=True, cont=True,
            extra=unfurl('Okou&#8202;·&#8202;Meta Ads', '$183 budget shift — draft',
                         'business.facebook.com/adsmanager'))),
      ('ask2', 'Dan', '11:20 AM', 'Approved. Push it.', {}),
      ('reply2', 'Okou', '11:21 AM',
       'Live. I will flag it here if the pacing drifts again.', dict(agent=True)),
    ]),
}

SEND = ('<svg viewBox="0 0 256 256" aria-hidden="true">'
        '<path d="M231.4,44.34s0,.1,0,.15l-58.2,191.94a15.88,15.88,0,0,1-14,11.51q-.69.06'
        '-1.38.06a15.86,15.86,0,0,1-14.42-9.15L107,164.15a4,4,0,0,1,.77-4.58l57.92-57.92a8,8,'
        '0,0,0-11.31-11.31L96.43,148.26a4,4,0,0,1-4.58.77L17.08,112.64a16,16,0,0,1,2.49-29.8'
        'l191.94-58.2.15,0A16,16,0,0,1,231.4,44.34Z"/></svg>')



# ── Okou's own window, for the three scenes that are not a channel ─────
# Tong: *"你做我们自己的产品，怎么差的这么远呢，你不借鉴一下我们的 design token
# & Components 吗？"* — so this is no longer drawn from memory. Every value is
# read out of vm0-ai/vm0:
#
#   turbo/packages/ui/src/styles/globals.css   the token scales
#   turbo/apps/platform/src/views/css/index.css  .zero-card / .zero-composer
#   .../views/okou-page/sidebar.tsx            the 68px labelled nav rail
#   .../views/okou-page/chat-thread-page.tsx   the user / assistant bubbles
#
# What that changed, concretely: the sidebar is the product's own 68px rail
# with 9px captions rather than a 148px list I invented; the type is Noto
# Sans, not the page's Instrument Sans; radii are 20/24px, not 12; borders
# are 0.7px #C5CCD7, not a mixed grey; the assistant's reply has no bubble at
# all, and the user's is gray-100 at 15px/1.7.
OKOU = {
    'sales': dict(title='Lead scoring'),
    'product': dict(title='Spec writing'),
    'leadership': dict(title='Board deck'),
}


def lucide(*paths):
    """A lucide glyph at the product's own stroke width (--icon-stroke-width)."""
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" '
            'aria-hidden="true">%s</svg>' % ''.join(paths))


CLIP = lucide('<path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0'
              '-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/>')

ARROW = lucide('<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>')

# The assistant's mark sits in the same rounded-lg tile the rail uses for a
# nav icon — the product's one container shape at this size.
# ...and in the app's own chat it is the same face. `site/index.html` has
# carried the avatar here for a while; this generator had not caught up, so
# re-running it would have put 32 cubes back on the page.
AGENT_AVA = ('<span class="ochat__ava ochat__ava--agent">'
             '<img src="assets/avatars/agent-okou.png" alt="" width="28" height="28">'
             '</span>')


def okou_window(key, rows):
    """Wrap this scene's existing rows in Okou's own app chrome."""
    sc = OKOU[key]

    # NO NAV RAIL, for the same reason Slack lost its workspace rail. Tong:
    # *"我们产品的侧边栏也要去掉和slack界面一样"*. It was a faithful copy of
    # `labeled-nav-rail` and it was still a column of navigation in front of a
    # picture about what a run produced — F-07 dimmed it, which was the half
    # measure. The window is the conversation and its composer; the title bar's
    # own controls are what still say this is Okou's app and not a chat widget.
    # The 68px + the lap go to the conversation.

    # THE HEADER'S RIGHT-HAND CONTROLS, 1:1 with `ChatThreadHeader`:
    # AutomationMenuButton (Clock), BrowserMenuButton (Globe), ArtifactsButton
    # (Package), each `variant="quiet" size="icon-sm"` at 18px. It used to be a
    # `Done` pill, which the product does not have there — "Done" in the app is
    # a `RunSectionDivider` label INSIDE the conversation
    # (`$.chat.run.done.default`), not a chip beside the thread title.
    acts = ('<span class="okw__acts" aria-hidden="true">%s%s%s</span>'
            % (lucide('<circle cx="12" cy="12" r="10"/>',
                      '<path d="M12 6v6l4 2"/>'),
               lucide('<circle cx="12" cy="12" r="10"/>',
                      '<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>',
                      '<path d="M2 12h20"/>'),
               lucide('<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8'
                      'a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8'
                      'a2 2 0 0 0 1 1.73z"/>',
                      '<path d="M12 22V12"/>',
                      '<polyline points="3.29 7 12 12 20.71 7"/>',
                      '<path d="m7.5 4.27 9 5.15"/>')))

    bar = ('\n              <p class="okw__bar"><b>%s</b>%s</p>'
           % (sc['title'], acts))

    composer = ('\n              <p class="okw__composer">'
                '<i class="okw__clip" aria-hidden="true">%s</i>'
                '<span>Ask me to automate workflows, manage tasks&hellip;</span>'
                '<i class="okw__send" aria-hidden="true">%s</i></p>'
                % (CLIP, ARROW))

    return ('<div class="ochat ochat--okou" role="group"\n'
            '                 aria-label="The conversation that produced this">'
            + '\n              <div class="okw__pane">'
            + bar + '\n              <div class="okw__list">'
            + ''.join('\n                ' + r for r in rows)
            + '\n              </div>' + composer
            + '\n              </div>\n            </div>')


def rows_of(seg):
    """Every top-level `.ochat__row` in a panel, verbatim."""
    out, i = [], 0
    while True:
        m = re.compile(r'<(div|p) class="ochat__row[^"]*"').search(seg, i)
        if not m:
            return out
        a, tag = m.start(), m.group(1)
        _, b = span_of(seg, a, tag)
        out.append(seg[a:b])
        i = b


def span_of(s, start, tag):
    """(start, end) of a balanced `<tag …> … </tag>` beginning at `start`.

    The scan begins one character IN. Starting it at `start` matches the
    element's own opening tag first, so depth goes to 2 and the span closes
    one level too late — which pulled a single row out of a four-row panel
    and left it unbalanced by one."""
    j, depth = start + 1, 1
    pat = re.compile(r'<(/?)%s\b' % tag)
    while depth:
        m = pat.search(s, j)
        if not m:
            raise SystemExit('unbalanced <%s> from %d' % (tag, start))
        depth += -1 if m.group(1) else 1
        j = m.end()
    return start, s.index('>', m.start()) + 1


def block(seg, pattern, tag):
    m = re.compile(pattern).search(seg)
    if not m:
        raise SystemExit('no %s' % pattern)
    a, b = span_of(seg, m.start(), tag)
    return seg[a:b]


def build(key, first):
    sc = SCENES[key]
    bar = ('<p class="slk__bar"><b class="slk__ch"><i>#</i>%s</b>'
           '<span class="slk__faces">%s<em>%s</em></span></p>'
           % (sc['channel'],
              ''.join('<img src="%s" alt="" width="22" height="22">' % (AVA % n)
                      for n in sc['faces']),
              sc['count']))

    body = ''
    for beat, who, time, text, opt in sc['rows']:
        body += msg(beat, who, time, text, **opt)
        if beat == 'result':
            # somebody who never typed reacted — the cheapest proof that the
            # channel holds more people than the two who spoke
            body += ('\n              <div class="ochat__row slk__react" '
                     'data-beat="react" data-cue="2700">'
                     '<span class="slk__av slk__av--gap" aria-hidden="true"></span>'
                     '<div class="slk__body"><p class="slk__pills">'
                     '<span class="slk__pill">%s<b>4</b></span>'
                     '</p></div></div>' % REACT)

    # a reserved slot: the same height whether anyone is typing or not, so
    # nothing above it can move. Out of the message flow entirely.
    ghost = ('\n              <p class="ochat__row slk__ghost" data-beat="typing" '
             'data-cue="480" data-until="1240" aria-hidden="true">'
             '<span class="slk__ghost-d"><i></i><i></i><i></i></span>'
             'Okou is typing…</p>')

    composer = (ghost + '\n              <p class="slk__composer">'
                '<span>Message #%s</span>'
                '<i class="slk__send" aria-hidden="true">%s</i></p>'
                % (sc['channel'], SEND))

    # NO WORKSPACE RAIL. Tong: *"去掉侧边栏"* — 44px of aubergine carrying four
    # grey placeholder squares. It was put here to stop the panel blending into
    # the page, which the frame's own gradient ground now does; what was left
    # was a block of colour with no information in it, taking width off the one
    # thing in the picture anybody reads. Okou's own window keeps its rail: the
    # labels there are real product navigation, not placeholders.

    return ('<div class="ochat ochat--slack"%s role="group"\n'
            '                 aria-label="The Slack channel this ran in">'
            % (' id="ochat"' if first else '')
            + '\n              <div class="slk__pane">'
            + bar + '\n              <div class="slk__list">'
            + body + '\n              </div>' + composer
            + '\n              </div>\n            </div>')


def balanced(fragment):
    for t in ('div', 'p', 'span'):
        n = sum(1 if not m.group(1) else -1
                for m in re.finditer(r'<(/?)' + t + r'[ >]', fragment))
        assert n == 0, '%s unbalanced by %d' % (t, n)


def panel_at(html, key):
    """Where the SCENE PANEL for `key` starts.

    Not `data-scene="key"` on its own: the tab buttons carry that attribute
    too and they all sit above the panels, so a plain search finds the tab
    and then walks forward into whichever panel comes first — which made
    every scene overwrite the marketing one."""
    m = re.compile(r'<div class="scene[^"]*" data-scene="%s"' % key).search(html)
    if not m:
        raise SystemExit('no scene panel for ' + key)
    return m.start()


def scene_span(html, key):
    """The `.ochat` block inside one scene. Idempotent: matches the block
    whether it is still Okou's own conversation or has already been
    rewritten.

    IT MUST BALANCE, not run to the next landmark. The first version ended
    at `<figure class="tplwin">`, which was true only while the connector
    cards sat in a column of their own — once they moved inside the frame,
    BETWEEN the window and the artifact, that span swallowed them and the
    next run deleted both cards."""
    s = panel_at(html, key)
    m = re.compile(r'<div class="ochat[^"]*"').search(html, s)
    return span_of(html, m.start(), 'div')



# ── what the run actually produced, per scene ─────────────────────────
# Tong, on feedback 05: *"每一个场景下的数字都不一样"*, and then *"如果下边的
# data和每个tab是有联系的，那这几个数据你觉得应该怎么放？… 切换tab后数据也需要变"*.
#
# EVERY VALUE HERE IS ALREADY ON SCREEN IN ITS OWN SCENE. Nothing is
# invented and nothing is a plausible-looking round number: 1,111 events and
# eight root causes are what Okou says in #incident-checkout, $183 is the
# figure in the Meta draft, and the durations are the difference between two
# timestamps in the thread above them. A metric that cannot be traced to the
# picture beside it is decoration with a number on it.
#
# The count varies on purpose. Three scenes have three facts worth stating
# and four have two; padding the short ones to a fixed trio is what made the
# old row read as a template — the same three shapes under every tab.
#
# (label, value, unit). `num` marks the ones that count up; a cadence is not
# a quantity and must not be animated as one.
METRICS = {
    'marketing': [
        ('Brief to live', '7', 'min'),        # 9:24 ask -> 9:31 in thread
        ('Room tiles built', '3', ''),        # "hero, the story, three room tiles"
        ('Waiting on you', '1', 'draft'),     # "unsent, yours to send"
    ],
    'ads': [
        ('Sessions reviewed', '10,220', ''),
        ('Budget moved', '$183', ''),
        ('Ask to live', '19', 'min'),         # 11:02 -> 11:21
    ],
    'sales': [
        ('Leads scored', '12', ''),
        ('Tier A queued', '4', ''),
    ],
    'engineering': [
        ('Events grouped', '1,111', ''),
        ('Root causes', '8', ''),
        ('Issues opened', '2', ''),
    ],
    'product': [
        ('Backlog issues linked', '6', ''),
        ('Spec filed', '1', 'page'),
    ],
    'ops': [
        ('Posted', 'Mondays', '09:00'),
        ('In the channel', '24', ''),
    ],
    'leadership': [
        ('Slides rebuilt', '8', ''),
        ('Refreshed', 'nightly', ''),
    ],
}


# NO OUTCOME STRIP. Tong: *"去掉…下方的数据"*. `METRICS` above is kept — the
# numbers are per-scene and were researched, and a summary of what a run
# produced may well come back somewhere — but nothing renders it. The picture
# is the run; three counters under it were the run explained a second time,
# and they cost the windows 63px of height on every tab to say it.


def restage(html, key):
    """Recompose one scene's `.ostage` as ONE FRAME plus the artifact window.

    Tong: *"是不是可以把左边的 connector 这两个卡片和右边的这个对话界面放到一个
    frame 里边 … 那些两个 connector cards 可以比较随机地和这个右侧的那个界面有
    一些 overlap"* — with the reference being this page's own workflow section:
    a soft gradient ground with two white cards floating over it at an offset.

    So the three-column row becomes two objects: a frame holding the app
    window with the connector cards floating over its left edge, and the
    artifact window beside it. Idempotent — it pulls the three parts out of
    whatever nesting it finds them in and re-emits them.
    """
    s = panel_at(html, key)
    a = html.index('<div class="ostage">', s)
    _, b = span_of(html, a, 'div')
    seg = html[a:b]

    seg = re.sub(r'\s*<ul class="ometrics".*?</ul>', '', seg, flags=re.S)
    conn = block(seg, r'<aside class="ostage__conn"', 'aside')
    chat = block(seg, r'<div class="ochat[^"]*"', 'div')
    win = block(seg, r'<figure class="tplwin"', 'figure')
    assert win.count('<figure') == 1, 'nested figure inside .tplwin'

    I = '\n            '
    # THE HUE MOVED OUT WITH THE GROUND. It used to sit on `.ochat`, which
    # painted the tint; the frame paints it now, and a custom property set on
    # a child is not visible to its parent — so every frame read grey until
    # the scene restated it here.
    #
    # And the artifact moved INSIDE. Tong: *"如果左边把connector和对话流结合
    # 了，那右边的结果我觉得也应该放进这个渐变色的frame里"* — the frame stopped
    # halfway across the stage and the payoff sat on the page beside it as a
    # plain white box, which is the one thing in the row with no ground.
    #
    # `.ostage__app` is the connectors and the window as ONE unit, because
    # the opening beat centres them together and the cards are anchored to
    # the window's edge, not to the frame's.
    new = ('<div class="ostage">'
           + I + '<div class="ostage__frame" style="--tab:var(--hue-%s);'
                 '--tab-mark:var(--mark-%s)">' % (key, key)
           + I + '  <div class="ostage__row">'
           + I + '    <div class="ostage__app">'
           + I + '      ' + chat
           + I + '      ' + conn
           + I + '    </div>'
           + I + '    ' + win
           + I + '  </div>'
           + I + '</div>'
           + '\n          </div>')
    return html[:a] + new + html[b:]


def main():
    html = open(HTML, encoding='utf-8').read()

    # rebuild in reverse document order so earlier offsets stay valid
    order = sorted(SCENES, key=lambda k: panel_at(html, k), reverse=True)
    first = order[-1]

    for key in order:
        a, b = scene_span(html, key)
        seg = build(key, key == first)
        balanced(seg)
        html = html[:a] + seg + html[b:]

    # ── the three that are not a channel get OKOU'S OWN WINDOW ──────────
    # Same treatment, different application: a sidebar, the thread's name,
    # the run's state and a composer. The rows themselves are lifted out of
    # the document and put back untouched — the chrome is new, the copy is
    # not. Reverse order again, for the same reason.
    for key in sorted(WASHED, key=lambda k: panel_at(html, k), reverse=True):
        a, b = scene_span(html, key)
        rows = rows_of(html[a:b])
        assert rows, 'no rows in ' + key
        # OKOU'S REPLIES WERE WEARING A PERSON'S FACE. avatar-1 is one of the
        # six human portraits — the same face Ravi wears in #team — sitting
        # on messages signed by the agent. It gets the product's mark, which
        # is what the Slack panels already do.
        rows = [re.sub(r'<span class="ochat__ava">.*?</span>', AGENT_AVA, r,
                       flags=re.S) for r in rows]
        seg = okou_window(key, rows)
        balanced(seg)
        html = html[:a] + seg + html[b:]

    # ── and every scene is restaged into one frame ──────────────────────
    for key in sorted(set(SCENES) | set(WASHED),
                      key=lambda k: panel_at(html, k), reverse=True):
        html = restage(html, key)

    open(HTML, 'w', encoding='utf-8').write(html)
    print('slack scenes: %s' % ', '.join(sorted(SCENES)))
    print('okou windows: %s' % ', '.join(WASHED))
    print('restaged:     %s scenes into one frame' % (len(SCENES) + len(WASHED)))


if __name__ == '__main__':
    main()
