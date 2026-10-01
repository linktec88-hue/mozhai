import { useCallback, useEffect, useRef, useState } from 'react';
import { CLUES } from './data';
import type { SceneId } from './data';

export interface GameState {
  screen: 'intro' | 'play' | 'ending';
  scene: SceneId;
  mode: 'normal' | 'hard';
  unlocked: Record<SceneId, boolean>;
  // 进度标记
  p1Solved: boolean; // 四君子书卷
  p2Solved: boolean; // 生肖转盘
  p3Solved: boolean; // 算盘
  mirrorUsed: boolean; // 铜镜对月
  gateKeyFound: boolean;
  inkGround: boolean; // 已研墨
  p6Solved: boolean; // 五行机关
  studyUnlocked: boolean;
  gardenUnlocked: boolean;
  // 收集
  inventory: string[];
  clues: string[];
  // 统计
  hintsUsed: Record<string, number>;
  clicks: number;
  startAt: number;
  finishedIn: number; // ms, 通关时定格
}

const SAVE_KEY = 'mozhai-save-v1';

const initialState = (mode: 'normal' | 'hard' = 'normal'): GameState => ({
  screen: 'intro',
  scene: 'hall',
  mode,
  unlocked: { hall: true, study: false, bedroom: true, garden: false },
  p1Solved: false,
  p2Solved: false,
  p3Solved: false,
  mirrorUsed: false,
  gateKeyFound: false,
  inkGround: false,
  p6Solved: false,
  studyUnlocked: false,
  gardenUnlocked: false,
  inventory: [],
  clues: [],
  hintsUsed: {},
  clicks: 0,
  startAt: Date.now(),
  finishedIn: 0,
});

export function useGame() {
  const [state, setState] = useState<GameState>(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return { ...(JSON.parse(raw) as GameState), screen: 'intro' };
    } catch {
      /* ignore */
    }
    return initialState();
  });

  const hasSave = useRef(false);
  useEffect(() => {
    try {
      hasSave.current = !!localStorage.getItem(SAVE_KEY);
    } catch {
      hasSave.current = false;
    }
  }, []);

  // 自动存档
  useEffect(() => {
    if (state.screen === 'play') {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      } catch {
        /* ignore */
      }
    }
  }, [state]);

  const patch = useCallback((p: Partial<GameState>) => {
    setState((s) => ({ ...s, ...p }));
  }, []);

  const addItem = useCallback((id: string) => {
    setState((s) => (s.inventory.includes(id) ? s : { ...s, inventory: [...s.inventory, id] }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setState((s) => ({ ...s, inventory: s.inventory.filter((i) => i !== id) }));
  }, []);

  const addClue = useCallback((id: string) => {
    setState((s) => {
      if (!CLUES[id] || s.clues.includes(id)) return s;
      return { ...s, clues: [...s.clues, id] };
    });
  }, []);

  const countClick = useCallback(() => {
    setState((s) => ({ ...s, clicks: s.clicks + 1 }));
  }, []);

  const useHint = useCallback((puzzleId: string, max: number) => {
    setState((s) => {
      const cur = s.hintsUsed[puzzleId] ?? 0;
      if (cur >= max) return s;
      return { ...s, hintsUsed: { ...s.hintsUsed, [puzzleId]: cur + 1 } };
    });
  }, []);

  const hintCount = (puzzleId: string) => state.hintsUsed[puzzleId] ?? 0;
  const totalHints = Object.values(state.hintsUsed).reduce((a, b) => a + b, 0);

  const newGame = useCallback((mode: 'normal' | 'hard' = 'normal') => {
    const fresh = initialState(mode);
    fresh.screen = 'play';
    setState(fresh);
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const continueGame = useCallback(() => {
    setState((s) => ({ ...s, screen: 'play' }));
  }, []);

  const toEnding = useCallback(() => {
    setState((s) => ({
      ...s,
      screen: 'ending',
      finishedIn: Date.now() - s.startAt,
      unlocked: { ...s.unlocked, garden: true },
    }));
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return {
    state,
    hasSave: hasSave.current,
    patch,
    addItem,
    removeItem,
    addClue,
    countClick,
    useHint,
    hintCount,
    totalHints,
    newGame,
    continueGame,
    toEnding,
  };
}

export type Game = ReturnType<typeof useGame>;

export function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m % 60)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
}
