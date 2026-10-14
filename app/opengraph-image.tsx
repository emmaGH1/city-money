import { ImageResponse } from 'next/og';
import { brandMarkSvg } from '../lib/brand-svg';

export const runtime = 'nodejs';
export const alt = 'City Money. A little goes around here. Cleanverse verified assets on Monad.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  const mark = 'data:image/svg+xml;base64,' + Buffer.from(brandMarkSvg).toString('base64');
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', padding: '58px 76px 56px', background: '#fdf1e1', color: '#03442f', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <img src={mark} alt="" width={99} height={84} />
        <div style={{ display: 'flex', fontSize: 38, fontWeight: 750, letterSpacing: '-1.6px' }}>City Money</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 86, fontWeight: 750, lineHeight: 0.98, letterSpacing: '-4px' }}>
          <span>A little goes</span><span>around here.</span>
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: '#355744', lineHeight: 1.4 }}>Community credits with boundaries built in.</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 19, letterSpacing: '0.4px', fontWeight: 600 }}>
        <span>Cleanverse verified assets</span><span style={{ color: '#dc6a42' }}>●</span><span>Monad testnet</span>
      </div>
      <div style={{ position: 'absolute', right: 0, bottom: 0, width: 340, height: 13, background: '#dc6a42', borderTopLeftRadius: 18 }} />
    </div>,
    { ...size },
  );
}
