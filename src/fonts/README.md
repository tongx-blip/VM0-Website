# Drop the Roobert files here

    cp ~/Downloads/RoobertTRIAL*.otf src/fonts/
    python3 tools/build-fonts.py     # → site/assets/fonts/*.woff2 + the @font-face block
    python3 tools/build-css.py

The **originals are not committed** (see `.gitignore`) — only the WOFF2 the
page actually serves. `build-fonts.py` reads the weight and the slant out of
each file's `OS/2` and `post` tables rather than out of its name, and fails if
a weight the stylesheet asks for (300/400/500/600/700) is missing.

**Licence.** Roobert TRIAL is Displaay Type Foundry's evaluation cut. Its
licence covers internal evaluation and mockups; publishing it on a live public
site — which is what `site/assets/fonts/` does, over GitHub Pages, with the
file directly downloadable — is outside that. The retail licence is the
web-font licence from Displaay. This is a note, not a blocker: it is the site
owner's call and it is written down here so it is not discovered later.
