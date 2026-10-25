import { Instrument_Serif } from "next/font/google";

/** Serif italic khusus untuk kata aksen di headline (contoh: "heart risk"). Teks lain tetap Figtree. */
export const accentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", display: "swap" });
