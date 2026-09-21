# Ticketrue editorial concert carousel

The six landscape photographic bases are generated with the built-in image generation tool, then composed as posters in HTML/CSS so all event names, dates, and buttons remain sharp, accessible, and editable. They depict fictional events, not real performers. The reference screenshot guided layout only; its imagery and copy are not reused.

## Final assets and prompt set

Each prompt requested a 16:9, realistic music-magazine concert photograph with film grain, believable live lighting, anonymous performers, a dark left half reserved for web typography, and no text, logos, or stock-photo polish. Their event-specific direction was:

| Asset | Direction |
| --- | --- |
| `dist/assets/banners/velora.webp` | Alternative electronic vocalist on the right; teal and magenta practical stage beams; textured crowd silhouettes. |
| `dist/assets/banners/nara.webp` | Orchestra, grand piano, and conductor in a historic concert hall; amber tungsten lighting and plum shadows. |
| `dist/assets/banners/kairo.webp` | Intimate R&B singer and band at a rooftop show; city at night, violet and orange lamps. |
| `dist/assets/banners/pulse.webp` | Outdoor electronic festival at dusk; side-stage view, dense crowd, cobalt blue and yellow lights. |
| `dist/assets/banners/nova.webp` | Seven anonymous small silhouettes on a stadium stage; silver-white lights, blue haze, audience viewpoint. |
| `dist/assets/banners/sora.webp` | Indie musician with guitar in a small theatre; dusty periwinkle and amber practical lights, intimate audience. |

Posters use their respective fictional event metadata from `dist/data.js`. The carousel is in `dist/carousel.js`; it advances every six seconds, loops, pauses on hover/focus/hidden tab or reduced-motion preference, and includes arrows and a small pause control on the banner. The centered position uses each slide's layout width so adjacent posters peek equally on both sides. Search in the existing header routes to the filtered concert list.
