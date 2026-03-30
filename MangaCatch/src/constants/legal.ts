export const LEGAL_TEXT = "©せきやてつじ／小学館 ©関谷ひさし ©萩岩睦美 ©畑中純 ©文月今日子 ©北条司／コアミックス 1985 ©陸奥A子 ©山田圭子";

/**
 * キャラクター画像クレジット（右下）
 */
export function getArtistCredit(artist: string): string {
    if (artist === "北条司") return "©北条司／コアミックス 1985";
    if (artist === "せきやてつじ") return "©せきやてつじ／小学館";
    return `©${artist}`;
}

/**
 * 表紙画像クレジット（左下）
 * 版元が異なる作家のみ版元名を併記。
 * getArtistCredit と同じ値の場合は表紙側に別クレジット不要。
 */
export function getCoverCredit(artist: string): string {
    if (artist === "北条司") return "©北条司／コアミックス 1985";
    if (artist === "せきやてつじ") return "©せきやてつじ／小学館";
    if (artist === "萩岩睦美") return "©萩岩睦美／平凡社";
    if (artist === "陸奥A子") return "©陸奥A子／集英社";
    return `©${artist}`;
}