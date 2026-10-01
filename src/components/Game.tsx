import { useEffect, useMemo, useState } from 'react';
import { CLUES, HINTS, ITEMS, SCENE_ORDER, SCENES } from '@/game/data';
import { fmtTime } from '@/game/store';
import type { Game } from '@/game/store';
import { audio } from '@/game/audio';
import { AbacusPuzzle, BooksPuzzle, WuxingPuzzle, ZodiacPuzzle } from './Puzzles';

type Dialog =
  | { kind: 'text'; title: string; body: string }
  | { kind: 'books' | 'zodiac' | 'abacus' | 'wuxing' }
  | { kind: 'hints' }
  | { kind: 'notebook' }
  | { kind: 'item'; itemId: string };

interface Hotspot {
  id: string;
  x: number; // 百分比
  y: number;
  label: string;
  visible?: (g: Game['state']) => boolean;
  action: (g: Game, ui: UI) => void;
}

interface UI {
  say: (title: string, body: string) => void;
  open: (d: Dialog) => void;
  toast: (msg: string) => void;
}

export function GameScreen({ game }: { game: Game }) {
  const { state, patch, addItem, removeItem, addClue, countClick, useHint, hintCount } = game;
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);
  const [now, setNow] = useState(Date.now());
  const [confirmReset, setConfirmReset] = useState(false);
  const [muted, setMuted] = useState(audio.muted);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const ui: UI = useMemo(
    () => ({
      say: (title, body) => setDialog({ kind: 'text', title, body }),
      open: (d) => setDialog(d),
      toast: (msg) => setToast({ id: Date.now(), msg }),
    }),
    []
  );

  /* ── 热点定义 ── */
  const hotspots: Record<string, Hotspot[]> = useMemo(
    () => ({
      hall: [
        {
          id: 'couplet', x: 30, y: 26, label: '中堂对联',
          action: (g, ui) => {
            g.addClue('clueCouplet');
            ui.say('中堂对联', `红底金字的对联在灯下泛着幽光：「${CLUES.clueCouplet.text.slice(1, -1)}」\n\n（已记入笔记）`);
          },
        },
        {
          id: 'books', x: 12, y: 58, label: '书卷匣',
          action: (_g, ui) => {
            if (!game.state.p1Solved) ui.open({ kind: 'books' });
            else ui.say('书卷匣', '暗格已经空了，只剩四卷书静静躺着。');
          },
        },
        {
          id: 'gate', x: 93, y: 50, label: '宅门',
          action: (_g, ui) =>
            ui.say('宅门', '你用力推了推——大门纹丝不动。门闩从外面落了锁，敲了半天，雨声吞没了所有呼喊。'),
        },
        {
          id: 'lantern', x: 30, y: 10, label: '灯笼',
          action: (_g, ui) => ui.say('灯笼', '一盏红灯笼轻轻摇晃，烛光把「墨府」两个字的影子投在青砖上。'),
        },
        {
          id: 'chair', x: 68, y: 74, label: '太师椅',
          action: (_g, ui) => ui.say('太师椅', '椅面积着薄灰，却整整齐齐，像是主人只是暂时离开。'),
        },
      ],
      study: [
        {
          id: 'ledger', x: 30, y: 60, label: '账本与算盘',
          action: (g, ui) => {
            g.addClue('clueLedger');
            if (!game.state.p3Solved) ui.open({ kind: 'abacus' });
            else ui.say('账本与算盘', '账目已经算清：尚欠四斗。机关恢复了沉寂。');
          },
        },
        {
          id: 'zodiacDrawer', x: 62, y: 62, label: '鎏金抽屉',
          action: (_g, ui) => {
            if (!game.state.p2Solved) ui.open({ kind: 'zodiac' });
            else ui.say('鎏金抽屉', '抽屉里空空如也，铜镜已经被你取走了。');
          },
        },
        {
          id: 'desk', x: 48, y: 82, label: '书案',
          action: (g, ui) => {
            if (g.state.inventory.includes('inkstick') && !g.state.inkGround) {
              g.patch({ inkGround: true });
              ui.toast('你注水研墨，墨香四溢。墨已研好。');
              return;
            }
            if (g.state.inkGround) {
              ui.say('书案', '砚中的墨汁浓黑如漆。若有什么隐去字迹的纸，此刻正好显影。');
              return;
            }
            ui.say('书案', '一方端砚干涸已久，旁边搁着一锭未用的松烟墨。');
          },
        },
        {
          id: 'shelf', x: 86, y: 30, label: '书架',
          action: (_g, ui) =>
            ui.say('书架', '满架藏书。一册《墨府年志》翻到一半：「……壬辰年中秋，公子弥月，阖府悬灯三日……」'),
        },
        {
          id: 'window', x: 8, y: 30, label: '轩窗',
          action: (_g, ui) => ui.say('轩窗', '窗纸上映着竹影。远处隐约有更鼓声，不知是什么时辰了。'),
        },
      ],
      bedroom: [
        {
          id: 'moon', x: 78, y: 16, label: '临窗月色',
          action: (g, ui) => {
            if (g.state.mirrorUsed) {
              ui.say('临窗月色', '月光依旧，墙上的暗格已经打开了。');
              return;
            }
            if (g.state.inventory.includes('mirror')) {
              g.patch({ mirrorUsed: true });
              ui.say(
                '铜镜引月',
                '你将青铜镜举到窗前，皓月之光经镜面一折，正落在床头那面墙上——墙皮簌簌而落，露出一个小小的暗格！'
              );
              return;
            }
            ui.say('临窗月色', '月光透过窗棂，在墙上投下一片清辉。隐约觉得那片光影里藏着什么……若有一面镜子引光，或许能看清。');
          },
        },
        {
          id: 'secretBox', x: 82, y: 44, label: '墙上暗格',
          visible: (s) => s.mirrorUsed && !s.gateKeyFound,
          action: (g, ui) => {
            g.patch({ gateKeyFound: true });
            g.addItem('gateKey');
            g.addItem('blankPage');
            audio.play('pickup');
            ui.say(
              '墙上暗格',
              '暗格里藏着一把铁钥匙，匙柄刻着一座小小的石门；还有一张对折的宣纸——展开一看，纸上竟没有一个字。'
            );
          },
        },
        {
          id: 'screen', x: 22, y: 46, label: '生肖屏风',
          action: (_g, ui) =>
            ui.say('生肖屏风', '六折屏风上绘着十二生肖。辰位画着一条苍龙，爪下按着一枚小小的印章，像是在守护什么。'),
        },
        {
          id: 'bed', x: 50, y: 72, label: '雕花床榻',
          action: (_g, ui) => ui.say('雕花床榻', '锦被叠得整整齐齐。你伸手一探——被褥凉得像井里的月光。这里三十年没有人睡过了。'),
        },
      ],
      garden: [
        {
          id: 'stoneGate', x: 50, y: 44, label: '八卦石门',
          action: (_g, ui) => {
            if (!game.state.p6Solved) ui.open({ kind: 'wuxing' });
            else ui.say('八卦石门', '石门已经开启，门外的天光近在眼前。');
          },
        },
        {
          id: 'stele', x: 84, y: 62, label: '苔痕石碑',
          action: (_g, ui) =>
            ui.say('苔痕石碑', '石碑爬满青苔，依稀可辨「墨府」二字，下面一行小字被凿去了，只留下几道凌乱的凿痕。'),
        },
        {
          id: 'plum', x: 14, y: 40, label: '老梅',
          action: (_g, ui) => ui.say('老梅', '一株老梅斜倚墙头，花开如雪。三十年的寂寞，也只开成了一树的花。'),
        },
      ],
    }),
    [game]
  );

  /* ── 谜题通关处理 ── */
  const solveBooks = () => {
    audio.play('success');
    patch({ p1Solved: true });
    addItem('brassKey');
    addClue('clue1');
    setDialog({
      kind: 'text',
      title: '机关发动',
      body: '四卷书依次沉下，书卷匣底部弹开一个暗格——一把黄铜钥匙，和一页残破的信笺：「……墨郎生于壬辰年中秋，满宅悬灯，贺者盈门……」\n\n（获得：黄铜钥匙；残页已记入笔记）',
    });
  };

  const solveZodiac = () => {
    audio.play('success');
    patch({ p2Solved: true });
    addItem('mirror');
    addClue('clue2');
    setDialog({
      kind: 'text',
      title: '鎏金抽屉开启',
      body: '转盘停在「龙」位，机簧轻响，抽屉缓缓滑出。里面端端正正放着一面青铜镜，镜下压着一页字：「……月上中天之时，持镜临窗对月，可见中庭之秘……」\n\n（获得：青铜镜；残页已记入笔记）',
    });
  };

  const solveAbacus = () => {
    audio.play('success');
    patch({ p3Solved: true });
    addItem('inkstick');
    addClue('clue3');
    setDialog({
      kind: 'text',
      title: '账房机关',
      body: '数字落定，算盘珠自己跳动起来，格出一声脆响——桌下的暗屉弹开了：一锭松烟老墨，和一页残纸：「……启石门者，不在锁钥，在五行相生之序……」\n\n（获得：墨锭；残页已记入笔记）',
    });
  };

  const solveWuxing = () => {
    audio.play('stone', 0.9);
    patch({ p6Solved: true });
    setDialog({
      kind: 'text',
      title: '石门开启',
      body: '五行归位，石腹中传出沉闷的轰响，八卦盘徐徐旋开——门缝里，透进了三十年来第一缕天光。',
    });
    setTimeout(() => {
      setDialog(null);
      game.toEnding();
    }, 2600);
  };

  /* ── 当前提示谜题 ── */
  const currentPuzzleId = !state.p1Solved
    ? 'p1_books'
    : !state.studyUnlocked
      ? 'p1_books'
      : !state.p2Solved
        ? 'p2_zodiac'
        : !state.p3Solved
          ? 'p3_abacus'
          : !state.mirrorUsed
            ? 'p4_mirror'
            : !state.inkGround && state.inventory.includes('blankPage')
              ? 'p5_ink'
              : state.inventory.includes('blankPage')
                ? 'p5_ink'
                : 'p6_wuxing';

  /* ── 场景切换 ── */
  const goScene = (id: (typeof SCENE_ORDER)[number]) => {
    countClick();
    if (state.unlocked[id]) {
      patch({ scene: id });
      return;
    }
    if (id === 'study' && state.inventory.includes('brassKey')) {
      patch({ scene: id, unlocked: { ...state.unlocked, study: true } });
      audio.play('door');
      ui.toast('黄铜钥匙插入锁孔，轻轻一转——书房的门开了。');
      return;
    }
    if (id === 'garden' && state.inventory.includes('gateKey')) {
      patch({ scene: id, unlocked: { ...state.unlocked, garden: true } });
      audio.play('door');
      ui.toast('石门钥匙转动，月洞门的锁落了。');
      return;
    }
    ui.toast(SCENES[id].lockedText ?? '此处尚不能进入。');
  };

  const elapsed = now - state.startAt;
  const scene = SCENES[state.scene];
  const list = hotspots[state.scene] ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d13] relative overflow-hidden">
      {/* 雨与雾 */}
      <div className="fixed inset-0 rain-layer pointer-events-none opacity-40 z-10" />
      <div className="fixed inset-0 mist-layer pointer-events-none z-10" />

      {/* 顶栏 */}
      <header className="relative z-30 flex items-center justify-between px-4 md:px-8 py-3 border-b border-[#c9a45c]/20 bg-[#0a0d13]/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="seal w-10 h-10 rounded flex items-center justify-center text-lg leading-none">墨斋</span>
          <div>
            <h1 className="font-brush text-xl md:text-2xl text-[#e8d9ae] tracking-widest">墨斋谜局</h1>
            <p className="text-[10px] text-[#8a7a5a] tracking-[0.3em]">INK MANSION ESCAPE</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#c9a45c]/30 text-[#c9a45c] text-sm tabular-nums">
            <span className="inline-block w-2 h-2 rounded-full bg-[#c9a45c] lantern-glow" />
            {fmtTime(elapsed)}
          </div>
          {state.mode === 'hard' && (
            <span className="px-2.5 py-1 rounded bg-[#9e2b25]/80 text-[#f4e9d0] text-xs font-brush tracking-widest" title="雨夜难度：无求签提示，答错将触发惊雷锁定">
              🌧 雨夜
            </span>
          )}
          {state.mode !== 'hard' && (
          <button
            onClick={() => {
              audio.play('hint');
              setDialog({ kind: 'hints' });
            }}
            className="px-3 py-1.5 rounded border border-[#c9a45c]/40 text-[#c9a45c] text-sm hover:bg-[#c9a45c]/15 transition"
          >
            求签提示
          </button>
          )}
          <button
            onClick={() => {
              audio.play('paper', 0.6);
              setDialog({ kind: 'notebook' });
            }}
            className="relative px-3 py-1.5 rounded border border-[#c9a45c]/40 text-[#c9a45c] text-sm hover:bg-[#c9a45c]/15 transition"
          >
            笔记
            {state.clues.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full seal text-[11px] flex items-center justify-center">
                {state.clues.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setMuted(audio.toggleMute())}
            title={muted ? '开启声音' : '静音'}
            className="px-3 py-1.5 rounded border border-[#c9a45c]/40 text-[#c9a45c] text-sm hover:bg-[#c9a45c]/15 transition"
          >
            {muted ? '🔇' : '🔊'}
          </button>
          {confirmReset ? (
            <button
              onClick={() => {
                setConfirmReset(false);
                game.newGame();
              }}
              onMouseLeave={() => setConfirmReset(false)}
              className="px-3 py-1.5 rounded bg-[#9e2b25] text-[#f4e9d0] text-sm"
            >
              确认重开？
            </button>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="px-3 py-1.5 rounded border border-[#8a7a5a]/40 text-[#8a7a5a] text-sm hover:bg-[#8a7a5a]/15 transition"
            >
              重开
            </button>
          )}
        </div>
      </header>

      {/* 场景画面 */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-3 md:px-8 py-4">
        <div className="relative w-full max-w-5xl rounded-lg overflow-hidden border border-[#c9a45c]/25 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
          <div key={state.scene} className="scene-in relative">
            <img src={scene.image} alt={scene.name} className="w-full block select-none" draggable={false} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d13]/70 via-transparent to-[#0a0d13]/30 pointer-events-none" />
            {/* 场景竖排名 */}
            <div className="absolute right-3 top-3 flex flex-col items-center gap-2 bg-black/35 backdrop-blur-sm rounded px-2 py-3 border border-[#c9a45c]/25">
              <span className="vertical-text font-brush text-lg text-[#e8d9ae]">{scene.name}</span>
              <span className="w-px h-6 bg-[#c9a45c]/40" />
              <span className="text-[9px] text-[#8a7a5a] tracking-widest" style={{ writingMode: 'vertical-rl' }}>
                {scene.sub}
              </span>
            </div>
            {/* 热点 */}
            {list
              .filter((h) => !h.visible || h.visible(state))
              .map((h) => (
                <div key={h.id}>
                  <button
                    className="hotspot-dot"
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    onClick={() => {
                      countClick();
                      audio.play('click', 0.45);
                      h.action(game, ui);
                    }}
                    aria-label={h.label}
                  />
                  <span
                    className="hotspot-label left-1/2 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[#e8d9ae] text-xs border border-[#c9a45c]/30"
                    style={{ top: `calc(${h.y}% + 16px)`, marginLeft: `${h.x - 50}%` }}
                  >
                    {h.label}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* 底部：场景导航 + 背包 */}
        <div className="w-full max-w-5xl mt-4 flex flex-col md:flex-row gap-3">
          <div className="flex gap-2 md:gap-3 flex-wrap justify-center">
            {SCENE_ORDER.map((id) => {
              const sc = SCENES[id];
              const locked = !state.unlocked[id];
              const active = state.scene === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    audio.play('click', 0.4);
                    goScene(id);
                  }}
                  className={`px-4 py-2 rounded border transition font-brush tracking-widest ${
                    active
                      ? 'bg-[#c9a45c] text-[#2c2210] border-[#c9a45c] shadow-[0_0_16px_rgba(201,164,92,0.4)]'
                      : locked
                        ? 'border-[#8a7a5a]/30 text-[#8a7a5a]/70 hover:bg-[#8a7a5a]/10'
                        : 'border-[#c9a45c]/40 text-[#c9a45c] hover:bg-[#c9a45c]/15'
                  }`}
                >
                  {locked ? '🔒 ' : ''}
                  {sc.name}
                </button>
              );
            })}
          </div>
          <div className="flex-1 flex items-center justify-center md:justify-end">
            <div className="flex items-center gap-2 min-h-[44px] px-3 py-1.5 rounded border border-[#c9a45c]/20 bg-[#0d1117]/70">
              <span className="text-xs text-[#8a7a5a] mr-1">行囊</span>
              {state.inventory.length === 0 && <span className="text-xs text-[#8a7a5a]/60">（空空如也）</span>}
              {state.inventory.map((id) => (
                <button
                  key={id}
                  onClick={() => setDialog({ kind: 'item', itemId: id })}
                  title={ITEMS[id].name}
                  className="w-9 h-9 rounded bg-[#1a2130] border border-[#c9a45c]/30 hover:border-[#c9a45c] hover:scale-105 transition text-lg flex items-center justify-center"
                >
                  {ITEMS[id].icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div key={toast.id} className="toast-anim fixed bottom-24 left-1/2 z-50 px-5 py-2.5 rounded bg-[#1a2130]/95 border border-[#c9a45c]/50 text-[#e8d9ae] text-sm shadow-2xl whitespace-nowrap">
          {toast.msg}
        </div>
      )}

      {/* ── 弹窗 ── */}
      {dialog && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => dialog.kind !== 'wuxing' && setDialog(null)}
        >
          <div
            className={`modal-in relative w-full rounded-lg shadow-2xl border ${
              dialog.kind === 'text' ? 'max-w-md paper' : 'max-w-lg bg-[#12161f] border-[#c9a45c]/30 p-6'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {dialog.kind === 'text' && (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-brush text-2xl text-[#5a2a1a]">{dialog.title}</h3>
                  <span className="seal w-8 h-8 rounded text-[13px] flex items-center justify-center">墨斋</span>
                </div>
                <p className="text-[15px] leading-7 text-[#3a3226] whitespace-pre-line">{dialog.body}</p>
                <button
                  onClick={() => setDialog(null)}
                  className="mt-5 w-full py-2 rounded bg-[#5a2a1a] text-[#f4e9d0] hover:brightness-110 transition"
                >
                  继续
                </button>
              </div>
            )}

            {(dialog.kind === 'books' || dialog.kind === 'zodiac' || dialog.kind === 'abacus' || dialog.kind === 'wuxing') && (
              <>
                <h3 className="font-brush text-xl text-[#e8d9ae] text-center mb-4 tracking-widest">
                  {dialog.kind === 'books' && '四 卷 藏 书'}
                  {dialog.kind === 'zodiac' && '生 肖 转 盘'}
                  {dialog.kind === 'abacus' && '账 房 机 关'}
                  {dialog.kind === 'wuxing' && '五 行 石 门'}
                </h3>
                {dialog.kind === 'books' && <BooksPuzzle hard={state.mode === 'hard'} onSuccess={solveBooks} />}
                {dialog.kind === 'zodiac' && <ZodiacPuzzle hard={state.mode === 'hard'} onSuccess={solveZodiac} />}
                {dialog.kind === 'abacus' && <AbacusPuzzle hard={state.mode === 'hard'} onSuccess={solveAbacus} />}
                {dialog.kind === 'wuxing' && <WuxingPuzzle hard={state.mode === 'hard'} onSuccess={solveWuxing} />}
                <button
                  onClick={() => setDialog(null)}
                  className="absolute top-3 right-4 text-[#8a7a5a] hover:text-[#c9a45c] text-lg"
                >
                  ✕
                </button>
              </>
            )}

            {dialog.kind === 'hints' && (
              <>
                <h3 className="font-brush text-xl text-[#e8d9ae] text-center mb-4 tracking-widest">求 签 问 卜</h3>
                {(() => {
                  const pid = currentPuzzleId;
                  const level = hintCount(pid);
                  const all = HINTS[pid];
                  return (
                    <div className="space-y-3">
                      <div className="paper rounded p-4 min-h-[96px]">
                        <p className="text-xs text-[#8a6a30] mb-2 font-brush">
                          第 {Math.min(level + 1, all.length)} 签 / 共三签
                        </p>
                        <p className="text-[#3a3226] leading-7 text-[15px]">{level === 0 ? '心中默念所困之局，再点「求签」。' : all[level - 1]}</p>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => {
                            audio.play('hint');
                            useHint(pid, 3);
                          }}
                          disabled={level >= 3}
                          className="px-5 py-2 rounded bg-[#9e2b25] text-[#f4e9d0] hover:brightness-110 transition disabled:opacity-40"
                        >
                          {level >= 3 ? '签已求尽' : '求 签'}
                        </button>
                        <button
                          onClick={() => setDialog(null)}
                          className="px-5 py-2 rounded border border-[#8a7a5a]/50 text-[#8a7a5a] hover:bg-[#8a7a5a]/10"
                        >
                          离开
                        </button>
                      </div>
                      <p className="text-center text-xs text-[#8a7a5a]/60">已求签 {game.totalHints} 次</p>
                    </div>
                  );
                })()}
                <button onClick={() => setDialog(null)} className="absolute top-3 right-4 text-[#8a7a5a] hover:text-[#c9a45c] text-lg">✕</button>
              </>
            )}

            {dialog.kind === 'notebook' && (
              <>
                <h3 className="font-brush text-xl text-[#e8d9ae] text-center mb-4 tracking-widest">行 囊 笔 记</h3>
                <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
                  {state.clues.length === 0 && (
                    <p className="text-center text-sm text-[#8a7a5a] py-8">尚未记下任何线索。多看看宅子里的器物书画。</p>
                  )}
                  {state.clues.map((id) => (
                    <div key={id} className="paper rounded p-4">
                      <p className="font-brush text-[#5a2a1a] mb-1">{CLUES[id].title}</p>
                      <p className="text-sm leading-6 text-[#3a3226]">{CLUES[id].text}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setDialog(null)} className="absolute top-3 right-4 text-[#8a7a5a] hover:text-[#c9a45c] text-lg">✕</button>
              </>
            )}

            {dialog.kind === 'item' && (
              <>
                <h3 className="font-brush text-xl text-[#e8d9ae] text-center mb-4 tracking-widest">物 品</h3>
                <div className="paper rounded p-5">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-4xl">{ITEMS[dialog.itemId].icon}</span>
                    <div>
                      <p className="font-brush text-xl text-[#5a2a1a]">{ITEMS[dialog.itemId].name}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-[#3a3226] mb-4">{ITEMS[dialog.itemId].desc}</p>
                  {dialog.itemId === 'blankPage' && (
                    <button
                      disabled={!state.inkGround}
                      onClick={() => {
                        audio.play('paper');
                        removeItem('blankPage');
                        addItem('revealedPage');
                        addClue('clueTruth');
                        setDialog({
                          kind: 'text',
                          title: '墨迹浮现',
                          body: '你将研好的墨轻轻涂过纸面，笔画渐渐显出——「木生火，火生土，土生金，金生水，水生木。」\n\n五行相生之序！（已记入笔记）',
                        });
                      }}
                      className="w-full py-2 rounded bg-[#5a2a1a] text-[#f4e9d0] hover:brightness-110 transition disabled:opacity-40"
                    >
                      {state.inkGround ? '以墨显影' : '需先在书房研墨'}
                    </button>
                  )}
                </div>
                <button onClick={() => setDialog(null)} className="absolute top-3 right-4 text-[#8a7a5a] hover:text-[#c9a45c] text-lg">✕</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
