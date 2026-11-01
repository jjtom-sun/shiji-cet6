# Data sources and method

## Real CET-6 listening library

- **Source:** CET-6 Listening Resources & Analysis v1.0.0, Leif / Ysoseri1224, mirrored by `getfine333-ux/cet6-listening-study`.
- **Upstream licence declaration for resource files:** CC BY 4.0.
- **Corpus scope:** 2016.12–2025.12, 39 sets, 6,081 sentence units, 25 questions per complete set.
- **Selection for playable quiz sets:** 33 sets, 825 questions, 5,196 sentence units. Excluded:
  - 2016.12 set 1/2 and 2017.06 set 1/2 — upstream warns audio and transcript correspondence is unreliable;
  - 2019.12 set 3 — no question file;
  - 2022.06 — only part of the answer key is standard.
- **What is generated:**
  - sentence-level English + machine Chinese translation;
  - evidence question numbers were aligned to the `[n]` markers in the upstream transcript; 778 of 825 questions have a reliable aligned sentence, the other 47 are shown without a claimed evidence sentence;
  - transcripts and printed options received only targeted fixes (`foreignservice` → `foreign service`, `ambassadorto` → `ambassador to`, `ofwellbeing` → `of wellbeing`, `his.country's` → `his country's`, `$15\%$` → `15%`, `missing inaction` → `missing in action`); valid compounds, abbreviations (`U.S.`, `D.C.`, `p.m.`) and URLs were left intact — no dictionary-based word splitting;
  - section boundaries and audio start/end times;
  - per-set key words for pre-listening;
  - 10 key words are selected from CET6-level vocabulary appearing in that set, not the most frequent basic words.
- **Question stems:** CET-6 listening does not print the spoken question stem in the paper; it is part of the audio. The site therefore shows only A–D options and requires the real audio (or a local audio file) for quiz mode. This is deliberate, not missing data.
- **Audio:** streamed from the mirror's public Git LFS URLs; not redistributed with the site. Audio rights remain with their holders. See `THIRD_PARTY_NOTICES.md`.

## Listening word-frequency list

- **Corpus:** all 39 upstream listening transcripts (2016.12–2025.12), 6,081 sentence units; about 41,400 content-word tokens were counted after function words and names were removed.
- **Filtering and lemmatisation** (`tools/frequency.mjs`):
  - lower-cased word tokens; contractions and possessives are skipped;
  - capitalised tokens inside a sentence, all-caps acronyms and hyphenated proper names (e.g. `Jean-Claude`) are treated as names and skipped; a sentence-initial capital is kept only when the same lowercase form occurs elsewhere or it is a known lower-level word;
  - function words are removed;
  - regular inflections are folded to a dictionary headword (`hoped` → `hope`, `running` → `run`), while lexicalised forms with their own noun/adjective entry (`processing`, `intriguing`, `justified`) stay separate;
  - common irregular past forms are folded to their base (`fell` → `fall`); ambiguous homographs are not counted as CET6 vocabulary;
  - a dictionary entry from the KyleBing data is required.
- **Examples:** a word only gets an example sentence when that sentence actually contains the lemma or an observed inflected form. No substring or “similar word” examples.
- **Ranking:** primary key = number of **sets** in which the word appears (`覆盖套数`), secondary = total occurrences; ties broken alphabetically.
- **Labels:**
  - **高频核心:** CET6-only word appearing in at least 3 of 39 sets → 119 words;
  - **六级进阶:** 624 CET6-only words in the corpus (including 1–2-set supplements);
  - **全部实词:** top 600 content words including CET4/high-school basics, for listening recognition rather than CET6-only memorisation.
- **Counts:** every row shows `df / 39` and total occurrences. “df” means the word appeared in that many sets, not necessarily that many times.
- **Manual exclusions and sense audit:** `hop` occurs only in “hip hop” and `renewable` only inside “non-renewable”; neither has an independent example matching the dictionary sense, so both are excluded from the frequency table (they remain in the 3,991-word lookup). Thirteen high-frequency words whose corpus use differed from the dictionary’s primary sense (`intent`, `aesthetic`, `correlate`, `duplicate`, `array`, `alternate`, `widely`, `positively`, `bias`, `tactics`, `bust`, `texture`, `stun`) were manually given the corpus-relevant senses.
- **Important caveat:** this is frequency in **this specific corpus**, not an official frequency table, not a prediction of the next exam, and not a guarantee that a word is “必考”. A word appearing in one set is a supplementary word, not a high-frequency core word. The UI labels it accordingly.
- **Source code for this analysis:** `tools/build-content.mjs` and `tools/frequency.mjs`; input files are not shipped because they are third-party datasets. The generated compact files are in `assets/js/data/vocab-listening.data.js` and `listening-real.data.js`.

## Full CET-6 vocabulary table

- **Source:** KyleBing/english-vocabulary, CET6 list plus CET4/high-school lists for level classification (BSD-3-Clause).
- **Count:** 3,991 unique CET-6 headwords.
- **Fields:** headword, phonetic, part of speech, core Chinese meaning, base/advanced level, listening coverage if present.
- **Limitation:** this is a lookup table, not a hand-written teaching entry; it does not replace a dictionary. Only the 134 rich entries and the 624 listening-frequency words are wired into the memory-box trainer (13 of the listening words are also among the 134 rich entries, so the combined memory box has 745 unique words).

## Original simulated content

The six original listening sets, reading passages, writing prompts, model essays, reference translations, grammar annotations and 134 rich vocabulary entries are original CET-6-style educational content. They are not official past papers and should not be cited as such.
