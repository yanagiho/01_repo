export interface CharacterData {
  id: string;            // "chara_001"
  no: number;            // 1..10
  artist: string;
  work: string;
  name: string;
  credit: string;
  score: number;
  rarity: number;
  weight: number;

  workImage?: string;         // cover_001.png
  characterImage?: string;    // chara_001.png
  attachmentFile?: string;

  enabled?: boolean;          // ★追加：出現させないものを明示
}

export const CHARACTER_MASTER: CharacterData[] = [
  {
    no: 1,
    id: "chara_001",
    artist: "陸奥A子",
    work: "粉雪ポルカ",
    name: "七本樫夕芽",
    credit: "©陸奥A子",
    score: 100,
    rarity: 1,
    weight: 10,
    workImage: "cover_001.png",
    characterImage: "chara_001.png",
    attachmentFile: "attach_001.pdf",
    enabled: true,
  },
  {
    no: 2,
    id: "chara_002",
    artist: "萩岩睦美",
    work: "銀曜日のおとぎばなし",
    name: "ポー",
    credit: "©萩岩睦美",
    score: 150,
    rarity: 2,
    weight: 8,
    workImage: "cover_002.png",
    characterImage: "chara_002.png",
    attachmentFile: "attach_002.pdf",
    enabled: true,
  },
  {
    no: 3,
    id: "chara_003",
    artist: "文月今日子",
    work: "金のアレクサンドラ",
    name: "アレクサンドラ",
    credit: "©文月今日子",
    score: 120,
    rarity: 2,
    weight: 9,
    workImage: "cover_003.png",
    characterImage: "chara_003.png",
    attachmentFile: "attach_003.pdf",
    enabled: true,
  },
  {
    no: 4,
    id: "chara_004",
    artist: "山田圭子",
    work: "炭に白蓮",
    name: "白蓮",
    credit: "©山田圭子",
    score: 100,
    rarity: 1,
    weight: 10,
    workImage: "cover_004.png",
    characterImage: "chara_004.png",
    attachmentFile: "attach_004.pdf",
    enabled: true,
  },
  {
    no: 5,
    id: "chara_005",
    artist: "北条司",
    work: "シティーハンター",
    name: "冴羽獠＆槇村香",
    credit: "©北条司／コアミックス 1985",
    score: 300,
    rarity: 3,
    weight: 5,
    workImage: "cover_005.png",
    characterImage: "chara_005.png",
    attachmentFile: "attach_005.pdf",
    enabled: true,
  },
  {
    no: 6,
    id: "chara_006",
    artist: "せきやてつじ",
    work: "バンビ～ノ！",
    name: "伴省吾",
    credit: "©せきやてつじ／小学館",
    score: 150,
    rarity: 2,
    weight: 8,
    workImage: "cover_006.png",
    characterImage: "chara_006.png",
    attachmentFile: "attach_006.pdf",
    enabled: true,
  },
  {
    no: 7,
    id: "chara_007",
    artist: "畑中純",
    work: "まんだら屋の良太",
    name: "大月良太",
    credit: "©畑中純",
    score: 100,
    rarity: 1,
    weight: 10,
    workImage: "cover_007.png",
    characterImage: "chara_007.png",
    attachmentFile: "attach_007.pdf",
    enabled: true,
  },
  {
    no: 8,
    id: "chara_008",
    artist: "畑中純",
    work: "ガタロ",
    name: "ガタロ",
    credit: "©畑中純",
    score: 100,
    rarity: 1,
    weight: 10,
    workImage: "cover_008.png",
    characterImage: "chara_008.png",
    attachmentFile: "attach_008.pdf",
    enabled: true,
  },
  {
    no: 9,
    id: "chara_009",
    artist: "関谷ひさし",
    work: "ストップ！にいちゃん",
    name: "南郷勇一と賢二",
    credit: "©関谷ひさし",
    score: 200,
    rarity: 2,
    weight: 7,
    workImage: "cover_009.png",
    characterImage: "chara_009.png",
    attachmentFile: "attach_009.pdf",
    enabled: true,
  },
  {
    no: 10,
    id: "chara_010",
    artist: "関谷ひさし",
    work: "スーパーおじょうさん",
    name: "高峰ルリ",
    credit: "©関谷ひさし",
    score: 100,
    rarity: 1,
    weight: 10,
    workImage: "cover_010.png",
    characterImage: "chara_010.png",
    attachmentFile: "attach_010.pdf",
    enabled: false, // ★あなたの characters に chara_010.png が無いので出現させない
  },
];

export const CHARACTER_MAP: Map<string, CharacterData> = new Map(
  CHARACTER_MASTER.map((c) => [c.id, c] as const)
);

export const getCharacterById = (id: string): CharacterData | undefined => {
  return CHARACTER_MAP.get(id);
};

/**
 * id / filename（拡張子ありなし）どちらでも引ける互換関数
 */
export const getCharacterData = (filenameOrId: string): CharacterData | undefined => {
  const key = filenameOrId.replace(".png", "");
  return CHARACTER_MASTER.find((c) => c.id === key);
};

export const getEnabledCharacters = (): CharacterData[] => {
  return CHARACTER_MASTER.filter((c) => c.enabled !== false);
};