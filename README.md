# WALWAL — Take the mic.

A responsive browser karaoke app built from scratch for Teng. Pick a song and sing with its embedded karaoke video. No audio uploads, API keys, account, or paid backend required.

## Run

Serve the project folder with any static HTTP server. With Python installed:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Deploy the project files to any HTTPS static host. Opening index.html directly with file:// is not supported (ES modules, YouTube origin checks, and microphone permissions).

## Included

- Thirteen curated OPM and English karaoke videos with lyrics in the video.
- Search by artist/title, language and mood filters.
- Play, pause, restart, seek, music volume, and theater mode.
- Queue with reorder/remove, play now, clear, and optional automatic next song.
- Favorites, recent playback, custom YouTube video links, and queue saved in localStorage.
- Local microphone input level meter, gain, and optional headphone monitoring.
- Responsive layout, keyboard focus states, labeled buttons, native dialogs, and reduced-motion support.
- Clear playback/network/microphone errors and a YouTube fallback link.

Microphone audio is not recorded, uploaded, or scored. Browser audio monitoring may have latency. Use headphones for monitoring. Microphone access requires HTTPS or localhost and browser permission.

## Playback and rights

Internet access is required. The app uses YouTube's official iframe API and privacy-enhanced player; videos, audio, and lyrics are not downloaded, extracted, or redistributed. Ads, unavailable videos, regional restrictions, and disabled embedding are controlled by YouTube/creators. Autoplay can require pressing play in the video. Song metadata identifies the original artist, not the performer of the backing track. No claim of independent audio or lyric licensing is made. LRCLIB/standalone lyrics are deliberately not included because these selected videos already provide their own timing and lyrics; separate lyric redistribution permissions have not been established.

The initial catalog's public source pages were checked on 2026-11-05. This verifies song/video identity, not playback in every region:

| Song | Original artist | Karaoke creator | Source |
| --- | --- | --- | --- |
| Pantropiko | BINI | Atomic Karaoke | https://www.youtube.com/watch?v=dOrmvYNzJNc |
| Love Story | Taylor Swift | Atomic Karaoke | https://www.youtube.com/watch?v=-pXQTGMJ8IU |
| Porque | Maldita | Atomic Karaoke | https://www.youtube.com/watch?v=dhWoHWRsQpE |
| Ikaw Ang Iibigin Ko | Regine Velasquez | Atomic Karaoke | https://www.youtube.com/watch?v=E4nJcsxhCkg |
| Maybe This Time | Sarah Geronimo | Atomic Karaoke | https://www.youtube.com/watch?v=N9rJxn7OpIg |
| Sabihin | Zelle | Atomic Karaoke | https://www.youtube.com/watch?v=Rd39nTWnNmI |
| Di Lang Ikaw | Juris | Atomic Karaoke | https://www.youtube.com/watch?v=b9Z5KDDlQkE |
| Mahal Pa Rin Kita | Rockstar | Atomic Karaoke | https://www.youtube.com/watch?v=CJhy0Vv45gw |
| On the Wings of Love | Regine Velasquez | Atomic Karaoke | https://www.youtube.com/watch?v=gbRId8ADKsA |
| Kiss Me, Kiss Me | Sarah Geronimo | Atomic Karaoke | https://www.youtube.com/watch?v=cdCu6l2ixek |
| You Belong With Me | Taylor Swift | Atomic Karaoke | https://www.youtube.com/watch?v=I3_FaKKyKPg |
| Salamat | Yeng Constantino | Atomic Karaoke | https://www.youtube.com/watch?v=fV0d0CLFj9Q |
| Love Me Like You Do | Ellie Goulding | Atomic Karaoke | https://www.youtube.com/watch?v=AQS6avY3HtI |

## Development

No build step or dependencies. `catalog.js` contains the starting catalog. `app.js` manages playback, queues, storage, and microphone access; `style.css` contains the responsive design. `logo.svg` is an original carabao and microphone mark.

Node 20+:

```sh
npm test
npm run check
```

Tests cover catalog integrity, safe video URL parsing, filtering, queue reordering, and time formatting. Browser and live playback verification are reported separately; unit tests cannot verify third-party media availability.

## Verification notes

Unit and JavaScript syntax checks pass. Browser checks verified search, favorites, queue reorder, custom link addition, and persistence. Initial Sing King and karaoke SESH candidates disabled embedding during QA and were replaced with Atomic Karaoke sources. The Pantropiko replacement initialized its embedded player and reported duration, but full video streaming stalled in the test browser; end-to-end audio playback and physical microphone input remain unverified. The app exposes a clear error and YouTube fallback when a video cannot play.

The repository uses a flat, buildless layout: serve this folder directly. No dependency installation is required.
