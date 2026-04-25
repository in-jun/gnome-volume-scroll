# gnome-volume-scroll

GNOME Shell extension that adjusts volume by scrolling anywhere on the top bar. Each scroll tick changes volume by 5% and shows the standard OSD indicator.

## Install

```sh
mkdir -p ~/.local/share/gnome-shell/extensions/volume-scroll@local
cp extension.js metadata.json ~/.local/share/gnome-shell/extensions/volume-scroll@local/
gnome-extensions enable volume-scroll@local
```

Log out and back in (Wayland), then enable the extension.

## Compatibility

GNOME Shell 45 – 50. The extension feature-detects `osdWindowManager.showAll` (added in 49) and falls back to `show(-1, ...)` on older versions.
