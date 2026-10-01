// ─────────────────────────────────────────────────────────────
// 墨斋谜局 · 游戏数据定义
// ─────────────────────────────────────────────────────────────

export type SceneId = 'hall' | 'study' | 'bedroom' | 'garden';

// 部署到 GitHub Pages 子路径时，静态资源需带 BASE_URL 前缀
const BASE = import.meta.env.BASE_URL;

export interface SceneDef {
  id: SceneId;
  name: string;
  sub: string;
  image: string;
  lockedText: string | null;
}

export const SCENES: Record<SceneId, SceneDef> = {
  hall: {
    id: 'hall',
    name: '前厅',
    sub: 'MAIN HALL',
    image: `${BASE}scenes/hall.jpg`,
    lockedText: null,
  },
  study: {
    id: 'study',
    name: '书房',
    sub: 'STUDY',
    image: `${BASE}scenes/study.jpg`,
    lockedText: '书房门上挂着一把黄铜锁，看来需要钥匙。',
  },
  bedroom: {
    id: 'bedroom',
    name: '卧房',
    sub: 'BEDROOM',
    image: `${BASE}scenes/bedroom.jpg`,
    lockedText: null,
  },
  garden: {
    id: 'garden',
    name: '后院',
    sub: 'GARDEN',
    image: `${BASE}scenes/garden.jpg`,
    lockedText: '月洞门上着锁，需要一把钥匙。',
  },
};

export const SCENE_ORDER: SceneId[] = ['hall', 'study', 'bedroom', 'garden'];

export interface ItemDef {
  id: string;
  name: string;
  icon: string; // emoji/字符
  desc: string;
}

export const ITEMS: Record<string, ItemDef> = {
  brassKey: {
    id: 'brassKey',
    name: '黄铜钥匙',
    icon: '🗝️',
    desc: '一把沉甸甸的黄铜钥匙，齿纹古旧，应能打开书房的锁。',
  },
  mirror: {
    id: 'mirror',
    name: '青铜镜',
    icon: '🪞',
    desc: '背面铸着缠枝纹的青铜镜，镜面幽亮，纤毫毕现。',
  },
  inkstick: {
    id: 'inkstick',
    name: '墨锭',
    icon: '🖋️',
    desc: '一锭松烟老墨，乌黑油亮。古人常用墨汁显影密写之字。',
  },
  gateKey: {
    id: 'gateKey',
    name: '石门钥匙',
    icon: '🔑',
    desc: '从卧房暗格中取得的铁钥匙，匙柄刻着一座小小的石门。',
  },
  blankPage: {
    id: 'blankPage',
    name: '无字残页',
    icon: '📜',
    desc: '一张看似空白的宣纸，对着灯火细看，隐约有不平的痕迹。',
  },
  revealedPage: {
    id: 'revealedPage',
    name: '显影残页',
    icon: '📃',
    desc: '墨汁涂抹后，字迹浮现：「木生火，火生土，土生金，金生水，水生木。」',
  },
};

export interface ClueDef {
  id: string;
  title: string;
  text: string;
}

export const CLUES: Record<string, ClueDef> = {
  clue1: {
    id: 'clue1',
    title: '残页一 · 生辰',
    text: '「……墨郎生于壬辰年中秋，满宅悬灯，贺者盈门……」',
  },
  clue2: {
    id: 'clue2',
    title: '残页二 · 镜语',
    text: '「……月上中天之时，持镜临窗对月，可见中庭之秘……」',
  },
  clue3: {
    id: 'clue3',
    title: '残页三 · 石门',
    text: '「……启石门者，不在锁钥，在五行相生之序……」',
  },
  clueCouplet: {
    id: 'clueCouplet',
    title: '中堂对联',
    text: '「梅兰竹菊四时景，琴棋书画一室春。」——四君子的顺序，古人早有定序。',
  },
  clueLedger: {
    id: 'clueLedger',
    title: '账本',
    text: '「春借米一石二斗，秋后归还八斗，尚欠米——斗。」账目下方的数字机关等着一个答案。',
  },
  clueTruth: {
    id: 'clueTruth',
    title: '显影残页',
    text: '「木生火，火生土，土生金，金生水，水生木。」这是开启石门的顺序。',
  },
};

// 提示系统：每个谜题三级提示
export const HINTS: Record<string, string[]> = {
  p1_books: [
    '前厅里似乎藏着机关，先仔细看看中堂的两边。',
    '中堂两侧的卷轴上写着「梅兰竹菊」。留意厅内摆放着同样四卷书的地方。',
    '按照古人定下的「四君子」顺序——梅、兰、竹、菊，依次点击那四卷书。',
  ],
  p2_zodiac: [
    '书房抽屉上的生肖转盘，需要一个生肖。',
    '你得到的残页上写着墨郎的生辰年份——天干地支纪年里的「辰」，对应哪个生肖？',
    '辰对应龙。把转盘拨到「龙」。',
  ],
  p3_abacus: [
    '算盘旁摊着一本账本，账目里藏着一个数字。',
    '一石等于十斗。春借一石二斗，秋还八斗，尚欠多少斗？',
    '12 减 8 等于 4。在数字机关上拨出「四」。',
  ],
  p4_mirror: [
    '残页二提到的「持镜临窗对月」，这宅中哪里能见到月亮？',
    '卧房的窗外月色正好。既然身上有了一面青铜镜……',
    '在卧房点击窗边的月光，使用青铜镜。',
  ],
  p5_ink: [
    '那张无字残页上隐约有痕迹，墨锭也许能派上用场。',
    '古人以墨显影：先在书房的案上研墨。',
    '在书房点击书案研墨，再对无字残页使用显影后的墨。',
  ],
  p6_wuxing: [
    '后院的石门上刻着五行——金、木、水、火、土。',
    '残页上说「启石门者，在五行相生之序」。你显影出的残页上有完整的相生顺序。',
    '按 木 → 火 → 土 → 金 → 水 的顺序按下五行机关。',
  ],
};

export const INTRO_TEXT = [
  '那夜，你本是赴京赶考的书生，途经江南水乡，忽遇暴雨。',
  '你叩开一座大宅的门环避雨。门无声地开了，宅内灯火昏黄，却不见一个人影。',
  '当你回头欲谢过主人，身后的大门已悄然合拢，门闩自落。',
  '正厅高悬的灯笼轻轻摇晃，仿佛有人在暗处注视着你——',
  '『墨府』三十年前的一桩旧案，正等着一个外人来揭开。',
].map((t) => t.trim());

export const ENDING_TEXT = [
  '五行归位，石门轰然而开。',
  '晨光刺破雨后的雾气，你走出墨府，深深吸了一口自由的空气。',
  '怀中的残页拼出了真相：三十年前，墨老爷并非暴病而亡，而是被构陷入狱、屈死牢中；这座宅子自此被冤魂缠绕，再无生人敢近。',
  '你将残页与显影的证据收好，决定赴县衙为墨府一门鸣冤。',
  '『多谢公子。』晨风里，你仿佛听见一声悠长的叹息，灯笼的光，温柔地熄灭了。',
];

export const ZODIACS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
export const ELEMENTS = ['金', '木', '水', '火', '土'];
