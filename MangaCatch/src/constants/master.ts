// src/constants/master.ts

export interface CharacterData {
  id: string;        // ファイル名
  no: number;        // 管理番号
  artist: string;    // 作家名
  work: string;      // 作品名
  name: string;      // キャラクター名
  credit: string;    // クレジット表記
  score: number;     // 点数
  rarity: number;    // レア度
  weight: number;    // 出現重み
  workImage?: string; // 書影画像のファイル名
}

// CSVデータに基づく正式マスタ定義
export const CHARACTER_MASTER: CharacterData[] = [
  { 
    no: 1, id: "chara_001", 
    artist: "陸奥A子", work: "粉雪ポルカ", name: "七本樫夕芽", 
    credit: "©陸奥A子", score: 100, rarity: 1, weight: 10,
    workImage: "cover_001.png" 
  },
  { 
    no: 2, id: "chara_002", 
    artist: "萩岩睦美", work: "銀曜日のおとぎばなし", name: "ポー", 
    credit: "©萩岩睦美", score: 150, rarity: 2, weight: 8,
    workImage: "cover_002.png"
  },
  { 
    no: 3, id: "chara_003", 
    artist: "文月今日子", work: "金のアレクサンドラ", name: "アレクサンドラ", 
    credit: "©文月今日子", score: 120, rarity: 2, weight: 9,
    workImage: "cover_003.png"
  },
  { 
    no: 4, id: "chara_004", 
    artist: "山田圭子", work: "炭に白蓮", name: "白蓮", 
    credit: "©山田圭子", score: 100, rarity: 1, weight: 10,
    workImage: "cover_004.png"
  },
  { 
    no: 5, id: "chara_005", 
    artist: "北条司", work: "シティーハンター", name: "冴羽獠＆槇村香", 
    credit: "©北条司／コアミックス 1985", score: 300, rarity: 3, weight: 5,
    workImage: "cover_005.png"
  },
  { 
    no: 6, id: "chara_006", 
    artist: "せきやてつじ", work: "バンビ～ノ！", name: "伴省吾", 
    credit: "©せきやてつじ／小学館", score: 150, rarity: 2, weight: 8,
    workImage: "cover_006.png"
  },
  { 
    no: 7, id: "chara_007", 
    artist: "畑中純", work: "まんだら屋の良太", name: "大月良太", 
    credit: "©畑中純", score: 100, rarity: 1, weight: 10,
    workImage: "cover_007.png"
  },
  { 
    no: 8, id: "chara_008", 
    artist: "畑中純", work: "ガタロ", name: "ガタロ", 
    credit: "©畑中純", score: 100, rarity: 1, weight: 10,
    workImage: "cover_008.png"
  },
  { 
    no: 9, id: "chara_009", 
    artist: "関谷ひさし", work: "ストップ！にいちゃん", name: "南郷勇一と賢二", 
    credit: "©関谷ひさし", score: 200, rarity: 2, weight: 7,
    workImage: "cover_009.png"
  },
  { 
    no: 10, id: "chara_010", 
    artist: "関谷ひさし", work: "スーパーおじょうさん", name: "高峰ルリ", 
    credit: "©関谷ひさし", score: 100, rarity: 1, weight: 10,
    workImage: "cover_010.png"
  },
];

export const getCharacterData = (filename: string): CharacterData | undefined => {
  const key = filename.replace('.png', '');
  return CHARACTER_MASTER.find(c => c.id === key);
};