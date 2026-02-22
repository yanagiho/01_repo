// MangaCatch/src/constants/master.ts

export interface CharacterData {
  id: string;            // 例: "chara_001"（主キー）
  no: number;            // 例: 1（管理番号・表示/ソート用）
  artist: string;        // 作家名
  work: string;          // 作品名
  name: string;          // キャラクター名
  credit: string;        // クレジット表記
  score: number;         // 点数
  rarity: number;        // レア度
  weight: number;        // 出現重み

  // 既存：書影（カバー）ファイル名
  workImage?: string;    // 例: "cover_001.png"

  // 追加：キャラ画像ファイル名（ズレ防止のため明示）
  characterImage?: string;   // 例: "chara_001.png"（デフォは `${id}.png`）

  // 追加：添付ファイル（PDF等）のファイル名（必要なら使う）
  attachmentFile?: string;   // 例: "attach_001.pdf"
}

/** 拡張子除去 */
const stripExt = (filename: string) => filename.replace(/\.[^.]+$/, '');

/**
 * いろんな命名から "no" を推定する:
 * - cover_001.png / chara_001.png / attach_001.pdf -> 1
 * - type01.png -> 1
 * - chara_010 -> 10
 */
export const extractNoFromFilename = (filename: string): number | null => {
  const base = stripExt(filename);

  // 3桁末尾（_001 など）
  const m3 = base.match(/(\d{3})$/);
  if (m3) return Number(m3[1]);

  // type01 / type1
  const mt = base.match(/type\s*0*(\d{1,3})$/i);
  if (mt) return Number(mt[1]);

  // 最後の連続数字（保険）
  const mAny = base.match(/(\d+)(?!.*\d)/);
  return mAny ? Number(mAny[1]) : null;
};

// CSVデータに基づく正式マスタ定義
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
    // キャラ画像が未確定なら placeholder にする（ズレよりマシ）
    characterImage: "placeholder.png",
    attachmentFile: "attach_005.pdf",
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
  },
];

const byId = new Map(CHARACTER_MASTER.map((c) => [c.id, c] as const));
const byNo = new Map(CHARACTER_MASTER.map((c) => [c.no, c] as const));

/** id でルックアップするMap（O(1)アクセス用）。互換エクスポート名。 */
export const CHARACTER_MAP: Map<string, CharacterData> = byId;

export const getCharacterById = (id: string): CharacterData | undefined => byId.get(id);
export const getCharacterByNo = (no: number): CharacterData | undefined => byNo.get(no);

/**
 * キャラ画像の公開パス。characterImage が未指定なら `${id}.png` を使う。
 * これにより「推測」ではなく「master 定義値優先」になる。
 */
export const getCharacterImagePath = (char: CharacterData): string => {
  const filename = char.characterImage ?? `${char.id}.png`;
  return `/assets/characters/${filename}`;
};

/**
 * 書影画像の公開パス。workImage が未指定なら placeholder を返す。
 */
export const getCoverImagePath = (char: CharacterData): string => {
  if (!char.workImage) return '/assets/ui/placeholder_cover.png';
  return `/assets/covers/${char.workImage}`;
};

/**
 * filename が
 * - "chara_001.png"（キャラ画像）
 * - "cover_001.png"（書影）
 * - "attach_001.pdf"（添付）
 * - "type01.png"（旧命名）
 * のどれでも、正しい CharacterData に解決する（＝ズレを根本で止める）
 */
export const getCharacterDataByFilename = (filename: string): CharacterData | undefined => {
  const base = stripExt(filename);

  // まず id 直引き（chara_001.png など）
  const direct = byId.get(base);
  if (direct) return direct;

  // 次に no 推定（cover_001 / attach_001 / type01 など）
  const no = extractNoFromFilename(filename);
  if (no != null) return byNo.get(no);

  return undefined;
};

/**
 * 互換用：従来名のまま残す（中身は強化版へ）
 */
export const getCharacterData = (filename: string): CharacterData | undefined => {
  return getCharacterDataByFilename(filename);
};

/**
 * （任意）デバッグ用：命名と master の整合をチェック
 */
export const assertMasterIntegrity = (): void => {
  for (const c of CHARACTER_MASTER) {
    const idNo = extractNoFromFilename(c.id);
    if (idNo != null && idNo !== c.no) {
      console.warn("[MASTER] id-no mismatch:", c);
    }
    if (c.workImage) {
      const coverNo = extractNoFromFilename(c.workImage);
      if (coverNo != null && coverNo !== c.no) {
        console.warn("[MASTER] cover-no mismatch:", c);
      }
    }
    if (c.attachmentFile) {
      const attNo = extractNoFromFilename(c.attachmentFile);
      if (attNo != null && attNo !== c.no) {
        console.warn("[MASTER] attachment-no mismatch:", c);
      }
    }
    // characterImage が未指定なら `${id}.png` を想定
    const charImg = c.characterImage ?? `${c.id}.png`;
    const charNo = extractNoFromFilename(charImg);
    if (charNo != null && charNo !== c.no) {
      console.warn("[MASTER] character-no mismatch:", c);
    }
  }
};