export const LEGAL_TEXT = "©せきやてつじ／小学館 ©関谷ひさし ©萩岩睦美 ©畑中純 ©文月今日子 ©北条司／コアミックス 1985 ©陸奥A子 ©山田圭子";

/**
 * キャラ表示画面（オススメ・写真）の右下クレジット用
 * 北条司・せきやてつじのみ版元名を併記
 */
export function getArtistCredit(artist: string): string {
    if (artist === "北条司") return "©北条司／コアミックス 1985";
    if (artist === "せきやてつじ") return "©せきやてつじ／小学館";
    return `©${artist}`;
}