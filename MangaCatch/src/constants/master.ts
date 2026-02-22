export interface CharacterData {
  id: string;      // "chara_001"
  no: number;      // 1..10
  name: string;    // キャラ名（日本語）
  work: string;    // 作品名（日本語）
  artist: string;  // 作家名（日本語）

  nameEn: string;
  workEn: string;
  artistEn: string;

  credit: string;
  score: number;
  rarity: number;
  weight: number;

  characterImage: string; // chara_001.png
  workImage: string;      // cover_001.png

  enabled: boolean;
}

// Excel: マンガキャッチ！画像-作家名対照リスト_20260116 (1).xlsx
export const CHARACTER_MASTER: CharacterData[] = [
  {
    no: 1,
    id: 'chara_001',
    name: '七本樫夕芽',
    work: '粉雪ポルカ',
    artist: '陸奥A子',
    nameEn: 'NANAHONGASHI Yume',
    workEn: 'Konayuki Polka',
    artistEn: 'MUTSU Ako',
    credit: '©陸奥A子',
    score: 100,
    rarity: 1,
    weight: 10,
    characterImage: 'chara_001.png',
    workImage: 'cover_001.png',
    enabled: true,
  },
  {
    no: 2,
    id: 'chara_002',
    name: 'ポー',
    work: '銀曜日のおとぎばなし',
    artist: '萩岩睦美',
    nameEn: 'Poe',
    workEn: 'Ginyoubi no Otogibanashi',
    artistEn: 'HAGIIWA Mutsumi',
    credit: '©萩岩睦美',
    score: 150,
    rarity: 2,
    weight: 8,
    characterImage: 'chara_002.png',
    workImage: 'cover_002.png',
    enabled: true,
  },
  {
    no: 3,
    id: 'chara_003',
    name: 'アレクサンドラ',
    work: '金のアレクサンドラ',
    artist: '文月今日子',
    nameEn: 'Alexandra',
    workEn: 'Golden Alexandra',
    artistEn: 'FUMIZUKI Kyoko',
    credit: '©文月今日子',
    score: 120,
    rarity: 2,
    weight: 9,
    characterImage: 'chara_003.png',
    workImage: 'cover_003.png',
    enabled: true,
  },
  {
    no: 4,
    id: 'chara_004',
    name: '白蓮',
    work: '炭に白蓮',
    artist: '山田圭子',
    nameEn: 'Byakuren',
    workEn: 'Sumi ni Byakuren',
    artistEn: 'YAMADA Keiko',
    credit: '©山田圭子',
    score: 100,
    rarity: 1,
    weight: 10,
    characterImage: 'chara_004.png',
    workImage: 'cover_004.png',
    enabled: true,
  },
  {
    no: 5,
    id: 'chara_005',
    name: '冴羽獠＆槇村香',
    work: 'シティーハンター',
    artist: '北条司',
    nameEn: 'SAEBA Ryo & MAKIMURA Kaori',
    workEn: 'City Hunter',
    artistEn: 'HOJO Tsukasa',
    credit: '©北条司／コアミックス 1985',
    score: 300,
    rarity: 3,
    weight: 5,
    characterImage: 'chara_005.png',
    workImage: 'cover_005.png',
    enabled: true,
  },
  {
    no: 6,
    id: 'chara_006',
    name: '伴省吾',
    work: 'バンビ～ノ！',
    artist: 'せきやてつじ',
    nameEn: 'BAN Shogo',
    workEn: 'Bambino!',
    artistEn: 'SEKIYA Tetsuji',
    credit: '©せきやてつじ／小学館',
    score: 150,
    rarity: 2,
    weight: 8,
    characterImage: 'chara_006.png',
    workImage: 'cover_006.png',
    enabled: true,
  },
  {
    no: 7,
    id: 'chara_007',
    name: '大月良太',
    work: 'まんだら屋の良太',
    artist: '畑中純',
    nameEn: 'OTSUKI Ryota',
    workEn: 'Mandaraya no Ryota',
    artistEn: 'HATANAKTA Jun',
    credit: '©畑中純',
    score: 100,
    rarity: 1,
    weight: 10,
    characterImage: 'chara_007.png',
    workImage: 'cover_007.png',
    enabled: true,
  },
  {
    no: 8,
    id: 'chara_008',
    name: 'ガタロ',
    work: 'ガタロ',
    artist: '畑中純',
    nameEn: 'Gataro',
    workEn: 'Gataro',
    artistEn: 'HATANAKTA Jun',
    credit: '©畑中純',
    score: 100,
    rarity: 1,
    weight: 10,
    characterImage: 'chara_008.png',
    workImage: 'cover_008.png',
    enabled: true,
  },
  {
    no: 9,
    id: 'chara_009',
    name: '南郷勇一と賢二',
    work: 'ストップ！にいちゃん',
    artist: '関谷ひさし',
    nameEn: 'NANGOU Yuichi & Kenji',
    workEn: 'STOP! Niichan',
    artistEn: 'SEKIYA Hisashi',
    credit: '©関谷ひさし',
    score: 200,
    rarity: 2,
    weight: 7,
    characterImage: 'chara_009.png',
    workImage: 'cover_009.png',
    enabled: true,
  },
  {
    no: 10,
    id: 'chara_010',
    name: '高峰ルリ',
    work: 'スーパーおじょうさん',
    artist: '関谷ひさし',
    nameEn: 'TAKAMINE Ruri',
    workEn: 'Super Ojosan',
    artistEn: 'SEKIYA Hisashi',
    credit: '©関谷ひさし',
    score: 100,
    rarity: 1,
    weight: 10,
    characterImage: 'chara_010.png',
    workImage: 'cover_010.png',
    enabled: false, // chara_010.png が無い前提：壊れ防止
  },
];

export const CHARACTER_MAP = new Map(CHARACTER_MASTER.map((c) => [c.id, c] as const));

export const getEnabledCharacters = (): CharacterData[] => CHARACTER_MASTER.filter((c) => c.enabled);

export const getCharacterById = (id: string): CharacterData | undefined => CHARACTER_MAP.get(id);