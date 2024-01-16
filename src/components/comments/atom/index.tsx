import {atom} from "recoil";

export type LanguageType = "en" | "ko";

export const languageState =atom<LanguageType>({
    key:"language",
    default: localStorage.getItem("language") as LanguageType || "en",
});