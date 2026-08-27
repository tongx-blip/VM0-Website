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

AVA = 'assets/brand/avatar-%d.png'

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
            '<span class="slk__unfurl-ic"><img src="assets/okou-icon.svg" alt="" '
            'width="14" height="14"></span>%s</p>'
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
    face = ('<span class="slk__av slk__av--okou">'
            '<img src="assets/okou-icon.svg" alt="" width="22" height="22"></span>'
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

    rail = ('\n              <div class="slk__rail" aria-hidden="true">'
            '<span class="slk__ws"><img src="assets/okou-icon.svg" alt="" '
            'width="17" height="17"></span>'
            '<i></i><i class="is-here"></i><i></i><i></i></div>')

    return ('<div class="ochat ochat--slack"%s role="group"\n'
            '                 aria-label="The Slack channel this ran in">'
            % (' id="ochat"' if first else '')
            + rail + '\n              <div class="slk__pane">'
            + bar + '\n              <div class="slk__list">'
            + body + '\n              </div>' + composer
            + '\n              </div>\n            </div>\n\n          ')


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
    """The `.ochat` block inside one scene, and where it ends. Idempotent:
    matches the block whether it is still Okou's own conversation or has
    already been rewritten as Slack."""
    s = panel_at(html, key)
    m = re.compile(r'<div class="ochat[^"]*"').search(html, s)
    e = html.index('<figure class="tplwin">', m.start())
    return m.start(), e


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

    # THE THREE THAT ARE NOT A CHANNEL lose the photograph. The painting was
    # doing two jobs — separating the panel from the page, and giving each
    # tab its own colour — and only the second one is worth keeping. A wash
    # in the scene's own hue keeps it and drops the picture.
    # The wash needs the scene's hue, and the hue lives on the tab button,
    # so the panel restates it. This has to happen HERE and not in a one-off
    # script: the strip below rewrites the same attribute, so anything set
    # outside this generator is gone on the next run.
    for key in WASHED:
        s = panel_at(html, key)
        m = re.compile(r'<div class="ochat"(?:\s+style="[^"]*")?', re.S).search(html, s)
        html = (html[:m.start()]
                + '<div class="ochat" style="--tab:var(--hue-%s)"' % key
                + html[m.end():])

    open(HTML, 'w', encoding='utf-8').write(html)
    print('slack scenes: %s' % ', '.join(sorted(SCENES)))
    print('washed scenes: %s' % ', '.join(WASHED))


if __name__ == '__main__':
    main()
