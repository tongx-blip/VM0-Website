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
REACT = ('<img class="slk__emoji" src="assets/icons/emoji-2705.svg" alt="" '
         'width="15" height="15">')


CUES = {'ask': 0, 'reply': 1240, 'result': 1980,
        'react': 2700, 'ask2': 3400, 'reply2': 4100}


def msg(beat, avatar, name, time, body, agent=False, extra='', cont=False):
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
            % (AVA % avatar))
    return (
        '\n              <div class="ochat__row slk__msg" data-beat="%s" data-cue="%d">%s'
        '<div class="slk__body"><p class="slk__meta">'
        '<b>%s</b>%s<time>%s</time></p>'
        '<p class="slk__say">%s</p>%s</div></div>'
        % (beat, CUES[beat], face, name, badge, time, body, extra))


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
              '<mark class="slk__at">@Okou</mark> build the Litoral one-pager — hero, '
              'the story, three room tiles. Brand kit is in Drive.')

        + msg('reply', 1, 'Okou', '9:24 AM',
              'Read the brand brief. Publishing as soon as it reads right.', agent=True)

        + msg('result', 1, 'Okou', '9:26 AM',
              'Published. Live now:', agent=True, extra=UNFURL, cont=True)

        # somebody else in the room reacted — the cheapest proof that the
        # channel has more people in it than the two who typed
        + '\n              <div class="ochat__row slk__react" data-beat="react" '
          'data-cue="2700">'
          '<span class="slk__av slk__av--gap" aria-hidden="true"></span>'
          '<div class="slk__body"><p class="slk__pills">'
          '<span class="slk__pill">%s<b>4</b></span>'
          '</p></div></div>' % REACT

        + msg('ask2', 3, 'Dan', '9:31 AM',
              'Reads well. Can you send the launch note to the list?')

        + msg('reply2', 1, 'Okou', '9:31 AM',
              'Drafted in Gmail — unsent, yours to send.', agent=True)
    )

    # Slack always shows its composer, and it is what tells you the channel
    # is a place you could type into rather than a transcript of one
    # a reserved slot: it is the same height whether anyone is typing or
    # not, so nothing above it can ever move
    ghost = ('\n              <p class="ochat__row slk__ghost" data-beat="typing" '
             'data-cue="480" data-until="1240" aria-hidden="true">'
             '<span class="slk__ghost-d"><i></i><i></i><i></i></span>'
             'Okou is typing…</p>')

    composer = (
        ghost + '\n              <p class="slk__composer">'
        '<span>Message #launch-litoral</span>'
        '<i class="slk__send" aria-hidden="true">'
        '<svg viewBox="0 0 256 256" aria-hidden="true">'
        '<path d="M231.4,44.34s0,.1,0,.15l-58.2,191.94a15.88,15.88,0,0,1-14,11.51q-.69.06'
        '-1.38.06a15.86,15.86,0,0,1-14.42-9.15L107,164.15a4,4,0,0,1,.77-4.58l57.92-57.92a8,8,'
        '0,0,0-11.31-11.31L96.43,148.26a4,4,0,0,1-4.58.77L17.08,112.64a16,16,0,0,1,2.49-29.8'
        'l191.94-58.2.15,0A16,16,0,0,1,231.4,44.34Z"/></svg></i></p>')

    # the slice this replaces runs up to `<figure class="tplwin">`, so it
    # contains `.ochat`'s own closing tag — the replacement has to as well
    # the bar and the composer are fixed; the message list takes the rest,
    # so the composer sits on the panel's floor rather than under the last
    # thing said
    head, body = rows.split('</p>', 1)
    rail = ('\n              <div class="slk__rail" aria-hidden="true">'
            '<span class="slk__ws"><img src="assets/okou-icon.svg" alt="" '
            'width="17" height="17"></span>'
            '<i></i><i class="is-here"></i><i></i><i></i></div>')
    return ('<div class="ochat ochat--slack" id="ochat" role="group"\n'
            '                 aria-label="The Slack channel this page was built in">'
            + rail + '\n              <div class="slk__pane">'
            + head + '</p>\n              <div class="slk__list">'
            + body + '\n              </div>' + composer
            + '\n              </div>\n            </div>\n\n          ')


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
