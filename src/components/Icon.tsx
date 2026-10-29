import Svg, { Path } from 'react-native-svg';

const PATHS = {
  bank: 'M3 10h18M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18M12 3l9 5H3z',
  savings: 'M12 4c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5',
  card: 'M3 6h18v12H3zM3 10h18M7 15h4',
  pay: 'M4 8h15l-3.5-3.5M20 16H5l3.5 3.5',
  crypto: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM9 12h6M12 9v6',
  credit: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12h6',
  photos: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M17 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  messages: 'M4 5h16v11H9l-5 4z',
  chat: 'M20 12a8 8 0 0 1-11.5 7.2L4 20l1-4A8 8 0 1 1 20 12z',
  notes: 'M6 3h9l4 4v14H6zM9 10h7M9 14h7M9 18h4',
  files: 'M3 6h6l2 2h10v11H3z',
  key: 'M8 16a4 4 0 1 1 3.4-1.9L20 22.5M16.5 18.5l2-2',
  authenticator: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12l2 2 4-4',
  lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  frost: 'M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5',
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z',
  shieldCheck: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12l2 2 4-4',
  face: 'M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M9 9v1.5M15 9v1.5M12 9v4h-1M9.5 16c1.5 1 3.5 1 5 0',
  home: 'M3 11l9-7 9 7M5 9.5V20h5v-6h4v6h5V9.5',
  ring: 'M12 21a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM9.5 7.5 10.5 4h3l1 3.5',
  activity: 'M3 12h4l3-8 4 16 3-8h4',
  settings: 'M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4',
  chevron: 'M9 6l6 6-6 6',
  back: 'M15 6l-6 6 6 6',
  check: 'M5 12.5l4.5 4.5L19 7',
  plus: 'M12 5v14M5 12h14',
  bell: 'M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20a7.5 7.5 0 0 1 15 0',
  location: 'M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 5l12 7-12 7z',
  vibrate: 'M8 4h8v16H8zM4 8v8M20 8v8',
  close: 'M6 6l12 12M18 6 6 18',
  warning: 'M12 4 2.5 20h19zM12 10v4.5M12 17.5v.01',
  phone: 'M7 3h10v18H7zM11 18h2',
  watch: 'M8 7h8v10H8zM9.5 7l1-4h3l1 4M9.5 17l1 4h3l1-4',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8v.01',
  run: 'M13 4a1.5 1.5 0 1 0 0 .01M9 20l3-6 3 2v5M7 12l3-4h4l2 3 3 1M10 8l-1 5',
  sliders: 'M4 6h16M4 12h16M4 18h16M8 4v4M15 10v4M10 16v4',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  battery: 'M3 8h15v8H3zM21 11v2',
  signal: 'M4 18v-2M9 18v-5M14 18v-8M19 18V6',
} as const;

export type IconName = keyof typeof PATHS;

type Props = { name: IconName; size?: number; color: string; strokeWidth?: number };

export function Icon({ name, size = 22, color, strokeWidth = 1.8 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={PATHS[name]}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
