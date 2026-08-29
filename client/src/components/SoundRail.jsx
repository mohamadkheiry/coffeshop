import SoundWave from './SoundWave';

const phrases = ['قهوه تخصصی', 'موسیقی منتخب', 'فضای صمیمی', 'گفت‌وگوی واقعی'];

export default function SoundRail({ light = false }) {
  return (
    <div className={`sound-rail${light ? ' sound-rail--light' : ''}`} aria-label="ارزش‌های کافه صدا">
      <div className="sound-rail__line"><SoundWave /></div>
      <div className="sound-rail__phrases shell">
        <span className="sound-rail__latin" dir="ltr">STORIES IN SOUND</span>
        {phrases.map((phrase) => <span key={phrase}>{phrase}</span>)}
      </div>
    </div>
  );
}
