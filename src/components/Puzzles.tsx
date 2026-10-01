import { useState } from 'react';
import { ELEMENTS, ZODIACS } from '@/game/data';
import { audio } from '@/game/audio';

/* ────────────────────────────────────────────
   谜题一：四君子书卷（按 梅→兰→竹→菊 顺序点击）
   ──────────────────────────────────────────── */
const BOOKS = [
  { name: '梅', color: 'from-[#7a2e2e] to-[#4a1a1a]' },
  { name: '兰', color: 'from-[#2e5a46] to-[#1a3a2c]' },
  { name: '竹', color: 'from-[#3d6b35] to-[#24421f]' },
  { name: '菊', color: 'from-[#a8842c] to-[#6e5518]' },
];

export function BooksPuzzle({ hard, onSuccess }: { hard?: boolean; onSuccess: () => void }) {
  const [picked, setPicked] = useState<number[]>([]);
  const [shake, setShake] = useState(false);
  const [locked, setLocked] = useState(false);
  const target = [0, 1, 2, 3];

  const clickBook = (i: number) => {
    if (shake || locked) return;
    if (picked.includes(i)) return;
    const next = [...picked, i];
    setPicked(next);
    if (next.length === 4) {
      if (next.every((v, idx) => v === target[idx])) {
        setTimeout(onSuccess, 450);
      } else {
        audio.play('fail');
        setShake(true);
        setLocked(!!hard);
        setTimeout(() => {
          setPicked([]);
          setShake(false);
        }, hard ? 2500 : 600);
      }
    }
  };

  return (
    <div className={`${shake ? 'shake' : ''} ${locked ? 'opacity-50 pointer-events-none' : ''}`}>
      {locked && <p className="text-center text-xs text-[#9e2b25] mb-2">⚡ 惊雷炸响，灯影摇曳，机关在暗中复位……</p>}
      <p className="text-center text-sm text-[#8a7a5a] mb-4 font-brush text-base">
        中堂对联写着「梅兰竹菊四时景」——按古人定序，依次拂开四卷书。
      </p>
      <div className="flex justify-center gap-4">
        {[3, 1, 0, 2].map((bookIdx, slot) => (
          <button
            key={slot}
            onClick={() => clickBook(bookIdx)}
            className={`scroll-book relative w-16 h-48 rounded-sm bg-gradient-to-b ${
              BOOKS[bookIdx].color
            } ${picked.includes(bookIdx) ? 'picked' : ''} shadow-lg`}
          >
            <span className="absolute inset-x-0 top-3 h-1 bg-black/25" />
            <span className="vertical-text absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-[#f0e6cc] font-brush">
              {BOOKS[bookIdx].name}
            </span>
            <span className="absolute inset-x-0 bottom-3 h-1 bg-black/25" />
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {picked.map((b, i) => (
          <span key={i} className="w-8 h-8 rounded-full seal flex items-center justify-center text-sm">
            {BOOKS[b].name}
          </span>
        ))}
        {Array.from({ length: 4 - picked.length }).map((_, i) => (
          <span key={i} className="w-8 h-8 rounded-full border border-[#8a7a5a]/50" />
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   谜题二：生肖转盘（拨到 龙）
   ──────────────────────────────────────────── */
export function ZodiacPuzzle({ hard, onSuccess }: { hard?: boolean; onSuccess: () => void }) {
  const [index, setIndex] = useState(0);
  const [shake, setShake] = useState(false);
  const [locked, setLocked] = useState(false);

  const confirm = () => {
    if (shake || locked) return;
    if (ZODIACS[index] === '龙') {
      onSuccess();
    } else {
      audio.play('fail');
      setShake(true);
      setLocked(!!hard);
      setTimeout(() => {
        setShake(false);
        setLocked(false);
      }, hard ? 2500 : 600);
    }
  };

  return (
    <div className={`text-center ${shake ? 'shake' : ''} ${locked ? 'opacity-50 pointer-events-none' : ''}`}>
      {locked && <p className="text-xs text-[#9e2b25] mb-2">⚡ 惊雷炸响，灯影摇曳，转盘暗中回位……</p>}
      <p className="text-sm text-[#8a7a5a] mb-5 font-brush text-base">
        黄铜转盘刻着十二生肖。残页上写着墨郎生于「壬辰」年——辰，对应何肖？
      </p>
      <div className="relative w-52 h-52 mx-auto mb-5">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#5a4518] to-[#2e2210] shadow-[0_0_30px_rgba(0,0,0,0.6),inset_0_0_20px_rgba(0,0,0,0.5)] border-4 border-[#8a6a30]" />
        {ZODIACS.map((z, i) => {
          const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + 40 * Math.cos(ang);
          const y = 50 + 40 * Math.sin(ang);
          return (
            <span
              key={z}
              className="absolute text-[#d8c690] text-sm -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {z}
            </span>
          );
        })}
        <button
          onClick={() => setIndex((i) => (i + 1) % 12)}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-[#c9a45c] to-[#8a6a30] text-[#2c2210] text-3xl font-brush shadow-lg hover:brightness-110 transition"
        >
          {ZODIACS[index]}
        </button>
      </div>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setIndex((i) => (i + 11) % 12)}
          className="px-4 py-1.5 rounded border border-[#8a6a30]/60 text-[#c9a45c] hover:bg-[#8a6a30]/20 transition"
        >
          ◀ 逆转
        </button>
        <button
          onClick={confirm}
          className="px-5 py-1.5 rounded bg-[#9e2b25] text-[#f4e9d0] hover:brightness-110 transition"
        >
          验 证
        </button>
        <button
          onClick={() => setIndex((i) => (i + 1) % 12)}
          className="px-4 py-1.5 rounded border border-[#8a6a30]/60 text-[#c9a45c] hover:bg-[#8a6a30]/20 transition"
        >
          顺转 ▶
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   谜题三：算盘账目（一石二斗 − 八斗 = 四斗）
   ──────────────────────────────────────────── */
export function AbacusPuzzle({ hard, onSuccess }: { hard?: boolean; onSuccess: () => void }) {
  const [value, setValue] = useState(0);
  const [shake, setShake] = useState(false);
  const [locked, setLocked] = useState(false);

  const confirm = () => {
    if (shake || locked) return;
    if (value === 4) {
      onSuccess();
    } else {
      audio.play('fail');
      setShake(true);
      setLocked(!!hard);
      setTimeout(() => {
        setShake(false);
        setLocked(false);
        setValue(0);
      }, hard ? 2500 : 600);
    }
  };

  return (
    <div className={`text-center ${shake ? 'shake' : ''} ${locked ? 'opacity-50 pointer-events-none' : ''}`}>
      {locked && <p className="text-xs text-[#9e2b25] mb-2">⚡ 惊雷炸响，灯影摇曳，数字悄然归零……</p>}
      <p className="text-sm text-[#8a7a5a] mb-4 font-brush text-base">账本：春借米一石二斗，秋还八斗。尚欠几斗？</p>
      <div className="inline-flex items-center gap-2 mb-5 px-6 py-4 rounded bg-gradient-to-b from-[#4a3512] to-[#2c2010] border-2 border-[#8a6a30] shadow-lg">
        <button
          onClick={() => setValue((v) => (v + 9) % 10)}
          className="w-10 h-10 rounded text-[#c9a45c] text-xl border border-[#8a6a30]/50 hover:bg-[#8a6a30]/25"
        >
          −
        </button>
        <span className="w-16 text-center text-4xl font-brush text-[#f0dfa8]">{['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'][value]}</span>
        <button
          onClick={() => setValue((v) => (v + 1) % 10)}
          className="w-10 h-10 rounded text-[#c9a45c] text-xl border border-[#8a6a30]/50 hover:bg-[#8a6a30]/25"
        >
          ＋
        </button>
      </div>
      <div>
        <button onClick={confirm} className="px-6 py-2 rounded bg-[#9e2b25] text-[#f4e9d0] hover:brightness-110 transition">
          拨定此数
        </button>
      </div>
      <p className="mt-3 text-xs text-[#8a7a5a]/70">一石 = 十斗</p>
    </div>
  );
}

/* ────────────────────────────────────────────
   谜题四：五行机关（木→火→土→金→水）
   ──────────────────────────────────────────── */
const EL_STYLE: Record<string, string> = {
  金: 'from-[#c9b06a] to-[#7a6524]',
  木: 'from-[#4a7a3d] to-[#2c4a24]',
  水: 'from-[#3d5a8a] to-[#24385a]',
  火: 'from-[#b04a2e] to-[#6e2c1a]',
  土: 'from-[#9a7442] to-[#5e4526]',
};

export function WuxingPuzzle({ hard, onSuccess }: { hard?: boolean; onSuccess: () => void }) {
  const [seq, setSeq] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [locked, setLocked] = useState(false);
  const target = ['木', '火', '土', '金', '水'];

  const press = (el: string) => {
    if (shake || locked) return;
    const next = [...seq, el];
    const idx = next.length - 1;
    if (el !== target[idx]) {
      audio.play('fail');
      setShake(true);
      setLocked(!!hard);
      setTimeout(() => {
        setSeq([]);
        setShake(false);
        setLocked(false);
      }, hard ? 2500 : 600);
      return;
    }
    setSeq(next);
    if (next.length === 5) {
      setTimeout(onSuccess, 500);
    }
  };

  return (
    <div className={`text-center ${shake ? 'shake' : ''} ${locked ? 'opacity-50 pointer-events-none' : ''}`}>
      {locked && <p className="text-xs text-[#9e2b25] mb-2">⚡ 惊雷炸响，灯影摇曳，五行黯然重归……</p>}
      <p className="text-sm text-[#8a7a5a] mb-5 font-brush text-base">
        石门上五个石钮刻着五行。残页有云：启石门者，在五行相生之序。
      </p>
      <div className="flex justify-center gap-3 mb-5">
        {ELEMENTS.map((el) => (
          <button
            key={el}
            onClick={() => press(el)}
            className={`w-16 h-16 rounded-full bg-gradient-to-br ${EL_STYLE[el]} border-2 border-[#c9a45c]/60 text-[#f0e6cc] text-2xl font-brush shadow-lg hover:scale-105 hover:brightness-110 transition`}
          >
            {el}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {target.map((_, i) => (
          <span
            key={i}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-brush ${
              seq[i] ? 'seal' : 'border border-[#8a7a5a]/50'
            }`}
          >
            {seq[i] ?? ''}
          </span>
        ))}
      </div>
    </div>
  );
}
