#!/usr/bin/env python3
"""
Rewrite the Storefront Launch scene's middle column as a Slack channel.

    python3 tools/slack-scene.py

Feedback 03, second pass: "其实我们本意是想做的更像slack … 那可能就不需要有
图片背景了". The first pass got the SHAPE right — one column, names, faces,
nobody right-aligned — but kept two things Slack does not have: chat
bubbles, and a painted ground behind them.

Held against a real Slack thread with Okou in it, the tells are:
  · no bubbles at all — plain text under a bold name, on white
  · an AGENT badge beside the app's name, which is how Slack marks a bot
  · a timestamp after every name
  · @mentions as tinted chips, links in the link colour
  · an unfurl with a left rule, not a card
  · reactions as small counted pills under the message

The container keeps `.ochat` and `.ochat__row`, so app.js §the-conversation
drives this with no change: same cue list, same typing special-case, same
`.is-live` resting rule.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, 'site', 'index.html')

AVA = 'assets/brand/avatar-%d.png'
TICK = ('<svg viewBox="0 0 24 24" fill="none" stroke-width="3.2" stroke-linecap="round" '
        'stroke-linejoin="round" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>')


def msg(beat, avatar, name, time, body, agent=False, extra=''):
    badge = '<i class="slk__badge">AGENT</i>' if agent else ''
    face = ('<span class="slk__av slk__av--okou">'
            '<img src="assets/okou-icon.svg" alt="" width="22" height="22"></span>'
            if agent else
            '<span class="slk__av"><img src="%s" alt="" width="36" height="36"></span>' % (AVA % avatar))
    return (
        '\n              <div class="ochat__row slk__msg" data-beat="%s">%s'
        '<div class="slk__body"><p class="slk__meta">'
        '<b>%s</b>%s<time>%s</time></p>'
        '<p class="slk__say">%s</p>%s</div></div>'
        % (beat, face, name, badge, time, body, extra))


UNFURL = (
    '<div class="slk__unfurl">'
    '<p class="slk__unfurl-h">'
    '<span class="slk__unfurl-ic"><img src="assets/okou-icon.svg" alt="" width="14" height="14"></span>'
    'Okou&#8202;·&#8202;Published</p>'
    '<p class="slk__unfurl-t">Litoral Coastal Hotel Site</p>'
    '<p class="slk__unfurl-u">okou-artifact-litoral-hotel.sites.vm0.io</p>'
    '</div>')


def build():
    rows = (
        # the channel's own chrome — a name, and who is in the room
        '<p class="slk__bar"><b class="slk__ch"><i>#</i>launch-litoral</b>'
        '<span class="slk__faces">'
        + ''.join('<img src="%s" alt="" width="22" height="22">' % (AVA % n)
                  for n in (2, 3, 5, 6))
        + '<em>8</em></span></p>'

        + msg('ask', 2, 'Maya', '9:24 AM',
              '<mark class="slk__at">@Okou</mark> build the one-pager for Litoral — hero, '
              'the short story, three room tiles. Brand kit is in Drive.')

        # Slack's own ghost line, kept inline where the message will land
        + '\n              <div class="ochat__row slk__msg slk__msg--typing ochat__row--typing" aria-hidden="true">'
          '<span class="slk__av slk__av--okou">'
          '<img src="assets/okou-icon.svg" alt="" width="22" height="22"></span>'
          '<div class="slk__body"><p class="slk__typing"><i></i><i></i><i></i></p></div></div>'

        + msg('reply', 1, 'Okou', '9:24 AM',
              'Read the brand brief in Drive. One page, minimal — publishing as soon '
              'as it reads right.', agent=True)

        + msg('result', 1, 'Okou', '9:26 AM',
              'Published. Live now:', agent=True, extra=UNFURL)

        # somebody else in the room reacted — the cheapest proof that the
        # channel has more people in it than the two who typed
        + '\n              <div class="ochat__row slk__react" data-beat="react">'
          '<span class="slk__av slk__av--gap" aria-hidden="true"></span>'
          '<div class="slk__body"><p class="slk__pills">'
          '<span class="slk__pill">%s<b>4</b></span>'
          '<span class="slk__pill slk__pill--eyes">Seen by 6</span>'
          '</p></div></div>' % TICK

        + msg('ask2', 3, 'Dan', '9:31 AM',
              'Reads well. Can you send the launch note to the list?')

        + msg('reply2', 1, 'Okou', '9:31 AM',
              'Drafted in Gmail — unsent, yours to send.', agent=True)
    )

    # Slack always shows its composer, and it is what tells you the channel
    # is a place you could type into rather than a transcript of one
    composer = (
        '\n              <p class="slk__composer">'
        '<span>Message #launch-litoral</span>'
        '<i class="slk__send" aria-hidden="true">'
        '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" '
        'stroke-linejoin="round"><path d="m5 12 14-7-5 7 5 7z"/></svg></i></p>')

    # the slice this replaces runs up to `<figure class="tplwin">`, so it
    # contains `.ochat`'s own closing tag — the replacement has to as well
    # the bar and the composer are fixed; the message list takes the rest,
    # so the composer sits on the panel's floor rather than under the last
    # thing said
    head, body = rows.split('</p>', 1)
    return ('<div class="ochat ochat--slack" id="ochat" role="group"\n'
            '                 aria-label="The Slack channel this page was built in">'
            + head + '</p>\n              <div class="slk__list">'
            + body + '\n              </div>' + composer
            + '\n            </div>\n\n          ')


def main():
    h = open(HTML, encoding='utf-8').read()
    # idempotent: finds the block whether this has been run before or not.
    # `str.index` RAISES rather than returning -1, so the first version's
    # `if a < 0` fallback never ran — it just threw on the second pass.
    m = re.search(r'<div class="ochat ochat--(?:thread|slack)"', h)
    if not m:
        raise SystemExit('storefront conversation block not found')
    a = m.start()
    b = h.index('<figure class="tplwin">', a)
    seg = build()
    for t in ('div', 'p', 'span'):
        n = sum(1 if not m.group(1) else -1
                for m in re.finditer(r'<(/?)' + t + r'[ >]', seg))
        assert n == 0, '%s unbalanced by %d' % (t, n)
    open(HTML, 'w', encoding='utf-8').write(h[:a] + seg + h[b:])
    print('storefront scene rebuilt as a Slack channel')


if __name__ == '__main__':
    main()
