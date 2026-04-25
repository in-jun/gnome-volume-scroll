import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Volume from 'resource:///org/gnome/shell/ui/status/volume.js';

const VOLUME_STEP_FRACTION = 0.05;

function iconNameForLevel(level) {
    if (level <= 0) return 'audio-volume-muted-symbolic';
    if (level < 1 / 3) return 'audio-volume-low-symbolic';
    if (level < 2 / 3) return 'audio-volume-medium-symbolic';
    return 'audio-volume-high-symbolic';
}

function showVolumeOsd(level) {
    const gicon = new Gio.ThemedIcon({name: iconNameForLevel(level)});
    const manager = Main.osdWindowManager;
    if (manager.showAll)
        manager.showAll(gicon, null, level, 1);
    else
        manager.show(-1, gicon, null, level, 1);
}

export default class VolumeScrollExtension extends Extension {
    enable() {
        this._mixer = Volume.getMixerControl();
        this._sink = this._mixer.get_default_sink();
        this._maxVolume = this._mixer.get_vol_max_norm();

        this._scrollHandler = Main.panel.connect(
            'scroll-event', (_actor, event) => this._onScroll(event));
        this._sinkHandler = this._mixer.connect(
            'default-sink-changed', (mixer, id) => {
                this._sink = mixer.lookup_stream_id(id);
            });
    }

    disable() {
        Main.panel.disconnect(this._scrollHandler);
        this._mixer.disconnect(this._sinkHandler);
        this._scrollHandler = null;
        this._sinkHandler = null;
        this._mixer = null;
        this._sink = null;
    }

    _onScroll(event) {
        if (!this._sink)
            return Clutter.EVENT_PROPAGATE;

        const step = VOLUME_STEP_FRACTION * this._maxVolume;
        const direction = event.get_scroll_direction();
        let volume = this._sink.volume;

        if (direction === Clutter.ScrollDirection.UP)
            volume += step;
        else if (direction === Clutter.ScrollDirection.DOWN)
            volume -= step;
        else
            return Clutter.EVENT_PROPAGATE;

        volume = Math.max(0, Math.min(volume, this._maxVolume));
        this._sink.volume = volume;
        this._sink.push_volume();

        showVolumeOsd(volume / this._maxVolume);
        return Clutter.EVENT_STOP;
    }
}
