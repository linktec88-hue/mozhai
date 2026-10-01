import { useEffect, useState } from 'react';
import { GameScreen } from '@/components/Game';
import { ENDING_TEXT, INTRO_TEXT } from '@/game/data';
import { audio } from '@/game/audio';
import { fmtTime, useGame } from '@/game/store';

export default function App() {
  const game = useGame();
  const { state } = game;
  const [introStep, setIntroStep] = useState(0);

  useEffect(() => {
    document.title = '墨斋谜局 · 古风密室逃脱';
  }, []);

  // 结局：切出背景乐，播放晨间氛围；回到游戏则恢复背景乐
  useEffect(() => {
    if (state.screen === 'ending') {
      audio.stopBgm();
      audio.playDawn();
      return () => audio.stopDawn();
    }
    audio.stopDawn();
    if (state.screen === 'play') audio.startBgm();
  }, [state.screen]);

  /* ── 开场 ── */
  if (state.screen === 'intro') {
    const done = introStep >= INTRO_TEXT.length;
    return (
      <div
        className="min-h-screen relative flex items-center justify-center bg-[#0a0d13] overflow-hidden"
        onPointerDown={() => audio.unlock()}
      >
        <div className="fixed inset-0 rain-layer pointer-events-none opacity-50" />
        <div className="fixed inset-0 mist-layer pointer-events-none" />
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}scenes/hall.jpg)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d13]/60 via-[#0a0d13]/80 to-[#0a0d13]" />

        <div className="relative z-10 max-w-xl w-full mx-4 text-center fade-up">
          <div className="flex justify-center mb-6">
            <span className="seal w-20 h-20 rounded-md flex items-center justify-center text-4xl shadow-2xl">墨斋</span>
          </div>
          <h1 className="font-brush text-6xl md:text-7xl text-[#e8d9ae] tracking-[0.2em] mb-2 drop-shadow-[0_0_24px_rgba(201,164,92,0.35)]">
            墨斋谜局
          </h1>
          <p className="text-[#8a7a5a] tracking-[0.5em] text-sm mb-10">古 风 密 室 逃 脱</p>

          <div className="min-h-[120px] mb-8">
            {!done ? (
              <button onClick={() => setIntroStep((s) => s + 1)} className="text-left w-full group">
                {INTRO_TEXT.slice(0, introStep + 1).map((t, i) => (
                  <p key={i} className={`fade-up text-[#d8cba8] leading-8 mb-1 ${i === introStep ? 'text-lg' : 'text-sm opacity-50'}`}>
                    {t}
                  </p>
                ))}
                <p className="mt-4 text-xs text-[#8a7a5a] animate-pulse">点击继续 ▸</p>
              </button>
            ) : (
              <div className="fade-up">
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-5">
                  <button
                    onClick={() => game.newGame('normal')}
                    className="px-8 py-3 rounded bg-[#9e2b25] text-[#f4e9d0] font-brush text-lg tracking-[0.3em] hover:brightness-110 transition shadow-[0_0_24px_rgba(158,43,37,0.4)]"
                  >
                    寻 常 入 宅
                  </button>
                  <button
                    onClick={() => game.newGame('hard')}
                    title="无求签提示；答错触发惊雷，机关锁定片刻"
                    className="px-8 py-3 rounded border border-[#c9a45c]/50 text-[#c9a45c] font-brush text-lg tracking-[0.3em] hover:bg-[#c9a45c]/15 transition"
                  >
                    🌧 雨 夜 困 厄
                  </button>
                  {game.hasSave && (
                    <button
                      onClick={game.continueGame}
                      className="px-8 py-3 rounded border border-[#8a7a5a]/40 text-[#8a7a5a] font-brush text-lg tracking-[0.3em] hover:bg-[#8a7a5a]/10 transition"
                    >
                      续 缘
                    </button>
                  )}
                </div>
                <p className="text-xs text-[#8a7a5a]/70">雨夜困厄：不可求签提示，答错一道机关，惊雷便将机关震归原位</p>
              </div>
            )}
          </div>
          <p className="text-xs text-[#8a7a5a]/60">点击场景中的金色光点调查 · 收集线索 · 解开机关 · 逃出墨府</p>
        </div>
      </div>
    );
  }

  /* ── 结局 ── */
  if (state.screen === 'ending') {
    return (
      <div className="min-h-screen relative flex items-center justify-center bg-[#0d1016] overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}scenes/garden.jpg)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1016]/70 via-[#0d1016]/85 to-[#0d1016]" />
        <div className="relative z-10 max-w-xl w-full mx-4 fade-up">
          <div className="paper rounded-lg p-8 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <h2 className="font-brush text-4xl text-[#5a2a1a] tracking-widest">晨光熹微</h2>
              <span className="seal w-10 h-10 rounded flex items-center justify-center text-sm">脱出</span>
            </div>
            <div className="space-y-4 mb-8">
              {ENDING_TEXT.map((t, i) => (
                <p key={i} className="text-[15px] leading-7 text-[#3a3226] fade-up" style={{ animationDelay: `${i * 0.4}s` }}>
                  {t}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3 mb-6 text-center">
              <div className="rounded bg-[#5a2a1a]/10 py-3">
                <p className="text-xs text-[#8a6a30] mb-1">难度</p>
                <p className="font-brush text-xl text-[#5a2a1a]">{state.mode === 'hard' ? '雨夜' : '寻常'}</p>
              </div>
              <div className="rounded bg-[#5a2a1a]/10 py-3">
                <p className="text-xs text-[#8a6a30] mb-1">逃出用时</p>
                <p className="font-brush text-xl text-[#5a2a1a]">{fmtTime(state.finishedIn)}</p>
              </div>
              <div className="rounded bg-[#5a2a1a]/10 py-3">
                <p className="text-xs text-[#8a6a30] mb-1">求签次数</p>
                <p className="font-brush text-xl text-[#5a2a1a]">{game.totalHints}</p>
              </div>
              <div className="rounded bg-[#5a2a1a]/10 py-3">
                <p className="text-xs text-[#8a6a30] mb-1">调查次数</p>
                <p className="font-brush text-xl text-[#5a2a1a]">{state.clicks}</p>
              </div>
            </div>
            <button
              onClick={() => game.newGame()}
              className="w-full py-3 rounded bg-[#5a2a1a] text-[#f4e9d0] font-brush text-lg tracking-[0.3em] hover:brightness-110 transition"
            >
              再 入 墨 斋
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <GameScreen game={game} />;
}
