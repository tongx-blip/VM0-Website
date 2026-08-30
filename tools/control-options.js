/* Option C only: the permission card is live.
   Nothing here ships as-is — it is the mechanic being reviewed. The point of
   the direction is that the reader performs the one gesture the product asks
   of a person, so the card has to actually do it: pick a duration, press
   Confirm, and the grant appears with the duration you chose and the name of
   the person it belongs to.

   Deliberately small: no library, no rAF, no timers. There is no loop here —
   a loop would make it a demo playing at you, which is the opposite of the
   claim. It waits, exactly like the run does. */
(function () {
  'use strict';
  var stage = document.querySelector('.oc2[data-live]');
  if (!stage) return;

  var card = stage.querySelector('.pcard');
  var sel = stage.querySelector('.pcard__sel');
  var go = stage.querySelector('.pcard__go');
  var out = stage.querySelector('.oc2__out span');
  if (!card || !sel || !go || !out) return;

  /* THE PRODUCT'S OWN FOUR, and only those. Checked against
     `USER_PERMISSION_GRANT_EXPIRES_IN_OPTIONS` = ["1h","24h","7d","always"] in
     signals/permission-allow/permission-grant-expiration.ts, and the labels
     against `authorization.permission.durationOptions.*`. The first version of
     this file offered "This time only", which the product does not have, and
     left out "7 days", which it does. Default is "1h" —
     DEFAULT_USER_PERMISSION_GRANT_EXPIRES_IN. */
  var DURATIONS = ['1 hour', '24 hours', '7 days', 'Always'];
  var EXPIRY = ['Expires in 1 hour', 'Expires in 24 hours', 'Expires in 7 days', ''];
  var exp = stage.querySelector('.pcard__exp');
  var at = 0;

  /* The select is a real control, so it has to behave like one for a keyboard
     as well: the product's is a <select>, and a div that only answers the
     mouse would be a picture of a control (RULES F35). */
  function relabel() {
    sel.firstChild.nodeValue = DURATIONS[at];
    sel.setAttribute('aria-label', 'Permission duration: ' + DURATIONS[at]);
  }
  function cycle() {
    if (card.dataset.state === 'saved') return;
    at = (at + 1) % DURATIONS.length;
    relabel();
  }
  function confirm() {
    if (card.dataset.state === 'saved') return;
    /* the card carries both states in its markup and CSS shows one — see
       pcard(). Replacing the controls with innerHTML orphaned the listeners
       bound to them, and "Ask again" came back dead. */
    card.dataset.state = 'saved';
    /* the duration goes on the CARD, in the product's amber, because that is
       where the product puts it; the page's line beside it says the thing the
       page is claiming and does not repeat the UI */
    if (exp) { exp.textContent = EXPIRY[at]; exp.hidden = !EXPIRY[at]; }
    stage.dataset.done = '1';
    reset.hidden = false;
  }

  [sel, go].forEach(function (el) {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  });
  sel.addEventListener('click', cycle);
  go.addEventListener('click', confirm);

  /* A one-way demo is spent the moment the first reader touches it, and four
     people look at a review page. Putting it back is part of the mechanic. */
  var reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'oc2__again';
  reset.textContent = 'Ask again';
  reset.hidden = true;
  reset.addEventListener('click', function () {
    card.dataset.state = 'ready';
    stage.dataset.done = '';
    reset.hidden = true;
    at = 0; relabel();
    sel.focus();
  });
  stage.appendChild(reset);

  relabel();
})();
