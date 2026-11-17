#!/usr/bin/env python3
"""
Build the app's Hadith & Du'a datasets from verified public sources.

Sources — all text is reproduced verbatim, nothing is paraphrased or written by hand:

  • Riyad as-Salihin (Arabic + English, chapter titles)
        github.com/AhmedBaset/hadith-json @1.2.0  (scraped from sunnah.com)
  • Sahih al-Bukhari · Sahih Muslim · 40 Hadith Nawawi · Tirmidhi · Abu Dawud ·
    an-Nasa'i · Ibn Majah  (Arabic + English, sunnah.com numbering & sections)
        github.com/fawazahmed0/hadith-api @1
  • Du'as & adhkar — Hisn al-Muslim / Fortress of the Muslim (132 chapters)
        github.com/wafaaelmaandy/Hisn-Muslim-Json
  • Quranic du'as — api.alquran.cloud (quran-uthmani + en.sahih)

Output (public/data):
  hadiths.json             ~150 authentic hadiths
  duas-0.json 1 2          >1000 authentic du'as & adhkar, split into 3 shards

Run:  python3 scripts/build-data.py      (downloads are cached in scripts/.cache)
"""

import json
import os
import re
import urllib.request
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".cache")
OUT = os.path.join(HERE, "..", "public", "data")

AHMED = "https://cdn.jsdelivr.net/gh/AhmedBaset/hadith-json@1.2.0/db"
FAWAZ = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions"
HISN = "https://cdn.jsdelivr.net/gh/wafaaelmaandy/Hisn-Muslim-Json@master/husn_en.json"
QURAN = "https://api.alquran.cloud/v1/quran"

DIA = re.compile(r"[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u200E\u200F\uFEFF]")


def norm_ar(text):
    return DIA.sub("", text or "")


def clean(text):
    text = (text or "").replace("\uFEFF", "")
    text = re.sub(r"[ \t]*\n[ \t]*", "\n", text)
    text = re.sub(r"\n{2,}", "\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def fetch(url, name):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, name)
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        with open(path, encoding="utf-8-sig") as fh:
            return json.load(fh)
    print(f"  ↓ {name}")
    req = urllib.request.Request(url, headers={"User-Agent": "quran-app-data-builder"})
    with urllib.request.urlopen(req, timeout=300) as resp:
        raw = resp.read()
    with open(path, "wb") as fh:
        fh.write(raw)
    return json.loads(raw.decode("utf-8-sig"))


# --------------------------------------------------------------------------
#  Category rules  (UI metadata only — the texts themselves are untouched)
# --------------------------------------------------------------------------
DUA_RULES = [
    ("Morning & Evening", ("morning", "evening", "nightfall", "dawn", "dusk"),
     ("أمسينا", "أصبحنا", "أمسى ", "أصبح ", "الضحى")),
    ("Anxiety & Grief", ("anxiety", "sorrow", "grief", "distress", "worry", "sadness",
                         "depress", "hardship", "calamity", "overwhelmed"),
     ("الحزن", "الهم ", "الكرب", "الغم", "الضيق", "الجزع")),
    ("Forgiveness & Repentance", ("forgive", "pardon", "repent", "absolve"),
     ("اغفر", "استغفر", "الذنوب", "الذنب")),
    ("Protection & Refuge", ("refuge", "protect", "envy", "magic", "shaytan", "satan",
                             "evil eye", "harm", "evil", "trial", "fitnah"),
     ("أعوذ", "الشيطان", "الحسد", "السحر", "الشر ", "العين", "الظالم", "الفتن")),
    ("Sleep & Night", ("sleep", "bed", "dream", "wake"),
     ("النوم", "أنام", "الفراش", "المنام", "استيقظ")),
    ("Travel", ("travel", "journey", "riding", "mount", "vehicle", "boat", "sea"),
     ("السفر", "سفر", "ركوب", "السفينة", "المركب")),
    ("Health & Illness", ("illness", "sick", "pain", "cure", "heal", "disease", "ailment", "medicine"),
     ("المرض", "شفاء", "ألم", "السقم", "اشف", "المريض")),
    ("Family & Children", ("parents", "father", "mother", "children", "offspring", "wife",
                           "son", "daughter", "family", "spouse", "brother", "sister"),
     ("الوالدين", "الذرية", "الأهل", "الولد", "أهلي", "الزوجة", "الأخ ")),
    ("Provision & Rizq", ("provision", "sustenance", "rizq", "livelihood", "debt", "wealth",
                          "poverty", "rich"),
     ("الرزق", "المال", "الدين", "الفقر", "الغنى", "الكسب")),
    ("Knowledge & Guidance", ("knowledge", "guidance", "guided", "straight path", "wisdom",
                              "understanding", "teach"),
     ("العلم", "الهداية", "الصراط", "الحكمة", "الفقه")),
    ("Gratitude & Praise", ("praise", "thank", "grateful", "gratitude", "glory", "blessing"),
     ("الحمد", "الشكر", "سبحان", "أشكرك", "النعمة")),
    ("Hereafter & Death", ("death", "grave", "paradise", "hell", "hereafter", "resurrection",
                           "judgment", "funeral"),
     ("الموت", "القبر", "الجنة", "النار", "الآخرة", "القيامة", "الميت", "الجنازة")),
    ("Prayer & Worship", ("prayer", "salah", "worship", "mosque", "fasting", "hajj", "wudu",
                          "prostration", "qur'an", "adhan"),
     ("الصلاة", "المسجد", "الصوم", "الوضوء", "السجود", "الحج", "الأذان")),
    ("Food & Daily Life", ("food", "eat", "drink", "house", "clothes", "market", "marriage",
                           "guest", "greeting", "sneeze"),
     ("الطعام", "الشراب", "البيت", "اللباس", "السوق", "النكاح", "السلام")),
]

HADITH_RULES = [
    ("Faith & Belief", ("faith", "belief", "iman", "revelation", "tawhid", "islam is")),
    ("Du'a & Dhikr", ("invocation", "supplication", "remembrance", "dhikr", "du'a", "glorif")),
    ("Knowledge", ("knowledge", "learn", "teach", "scholar", "qur'an", "recit")),
    ("Worship", ("prayer", "salat", "fasting", "zakat", "hajj", "purification", "ablution",
                 "mosque", "witr", "ramadan")),
    ("Character & Manners", ("manner", "etiquette", "adab", "kindness", "truthful", "lying",
                             "anger", "modesty", "neighbour", "neighbor", "generous", "respect",
                             "patience", "mercy")),
    ("Charity & Wealth", ("charity", "spend", "wealth", "poor", "beggar", "debt", "trade", "provision")),
    ("Patience & Trials", ("trials", "calamity", "hardship", "illness", "endure")),
    ("Family & Community", ("parents", "mother", "father", "children", "wife", "family",
                            "brother", "kinship", "orphan")),
    ("Repentance", ("repent", "forgive", "sin", "pardon")),
    ("Hereafter", ("paradise", "hell", "grave", "hereafter", "resurrection", "judgment", "death")),
    ("Daily Life", ("eating", "drink", "sleep", "travel", "clothes", "dress", "market",
                    "greeting", "sneez")),
]

PURPOSE_BY_CATEGORY = {
    "Morning & Evening": "Morning & evening remembrance",
    "Anxiety & Grief": "Relief from anxiety, grief & distress",
    "Forgiveness & Repentance": "Seeking forgiveness & repentance",
    "Protection & Refuge": "Protection & seeking refuge",
    "Sleep & Night": "Sleep, night & waking",
    "Travel": "Travel & journeys",
    "Health & Illness": "Health, illness & healing",
    "Family & Children": "Family, parents & children",
    "Provision & Rizq": "Provision, wealth & debt",
    "Knowledge & Guidance": "Knowledge & guidance",
    "Gratitude & Praise": "Gratitude & praise of Allah",
    "Hereafter & Death": "The hereafter, death & the grave",
    "Prayer & Worship": "Prayer & worship",
    "Food & Daily Life": "Daily life, food & the home",
    "Sunnah Supplications": "Prophetic supplication",
}


def classify(text_en, text_ar, title, rules):
    hay_en = f"{title} {text_en}".lower()
    hay_ar = norm_ar(f"{text_ar}")
    for entry in rules:
        cat, en_keys = entry[0], entry[1]
        ar_keys = entry[2] if len(entry) > 2 else ()
        for key in en_keys:
            if key in hay_en:
                return cat
        for key in ar_keys:
            if key in hay_ar:
                return cat
    return None


# --------------------------------------------------------------------------
#  1. Hadiths — Bukhari · Muslim · Riyad as-Salihin · Nawawi 40
# --------------------------------------------------------------------------
BUHARI_BOOKS = {1: 2, 2: 4, 3: 4, 8: 3, 78: 6, 80: 4, 81: 5}
MUSLIM_BOOKS = {1: 3, 2: 2, 38: 4, 43: 4, 45: 5, 48: 4, 50: 3, 55: 5}
RIYAD_BOOKS = {
    "The Book of Du'a (Supplications)": 6,
    "The Book of the Remembrance of Allah": 6,
    "The Book of Forgiveness": 4,
    "The Book of the Etiquette of Sleeping": 3,
    "The Book of Visiting the Sick": 3,
    "The Book of Etiquette of Traveling": 3,
    "The Book of Good Manners": 4,
    "The Book of Knowledge": 3,
    "The Book of Virtues": 5,
    "The Book of Praise and Gratitude to Allah": 2,
    "The Book About the Etiquette of Eating": 3,
    "The Book of Dress": 2,
    "The Book of Greetings": 3,
    "The Book of the Prohibited actions": 4,
    "The Book of Jihad": 3,
    "The Book of Miscellaneous ahadith of Significant Values": 3,
    "The Book of Supplicating Allah to Exalt the Mention of the Prophet": 1,
    "The Book of I'tikaf": 1,
}
SHORT_EN = (90, 620)


def riyad_number_map():
    """Map diacritic-free Arabic prefix -> Riyad as-Salihin hadith number as
    published on sunnah.com (the by_book file carries the continuous ids)."""
    try:
        whole = fetch(f"{AHMED}/by_book/other_books/riyad_assalihin.json", "riyad.json")
    except Exception:
        return {}
    rows = whole["hadiths"]
    base = min(h["id"] for h in rows)  # AhmedBaset numbers globally across the 9 books
    return {norm_ar(h["arabic"])[:120]: h["id"] - base + 1 for h in rows}


def pick_evenly(items, count, key="english"):
    items = [h for h in items if SHORT_EN[0] <= len(h[key]) <= SHORT_EN[1]]
    if len(items) <= count:
        return items
    step = len(items) / count
    return [items[int(i * step)] for i in range(count)]


def build_hadiths():
    out, seen = [], set()
    riyad_ids = riyad_number_map()

    def add(collection, reference, grade, arabic, english, narrator, section):
        key = norm_ar(arabic)[:160]
        if key in seen or not arabic or not english:
            return
        seen.add(key)
        english_full = (f"{narrator} " if narrator else "") + english
        out.append(
            {
                "id": "",
                "arb": clean(arabic),
                "en": clean(english_full),
                "src": collection,
                "ref": reference,
                "grade": grade,
                "sec": section,
                "cat": classify(english_full, arabic, section, HADITH_RULES) or "Faith & Belief",
            }
        )

    # Riyad as-Salihin
    for i in range(1, 21):
        try:
            d = fetch(f"{AHMED}/by_chapter/other_books/riyad_assalihin/{i}.json", f"riyad_book_{i}.json")
        except Exception:
            continue
        title = d["metadata"]["english"]["introduction"].strip()
        wanted = next((n for name, n in RIYAD_BOOKS.items() if title.startswith(name[:38])), None)
        if not wanted:
            continue
        pool = [{"english": (h["english"].get("narrator", "") + " " + h["english"]["text"]), "h": h}
                for h in d["hadiths"]]
        for row in pick_evenly(pool, wanted):
            h = row["h"]
            number = riyad_ids.get(norm_ar(h["arabic"])[:120], h["idInBook"])
            add("Riyad as-Salihin", f"Riyad as-Salihin #{number}", "",
                h["arabic"], h["english"]["text"], h["english"].get("narrator", ""), title)

    # Bukhari + Muslim (sunnah.com numbering)
    for name, label, books in (("bukhari", "Sahih al-Bukhari", BUHARI_BOOKS),
                               ("muslim", "Sahih Muslim", MUSLIM_BOOKS)):
        eng = fetch(f"{FAWAZ}/eng-{name}.json", f"eng-{name}.json")
        ara = fetch(f"{FAWAZ}/ara-{name}.json", f"ara-{name}.json")
        ara_by = {h["hadithnumber"]: h["text"] for h in ara["hadiths"]}
        sections = eng["metadata"]["sections"]
        by_book = {}
        for h in eng["hadiths"]:
            by_book.setdefault(str(h["reference"]["book"]), []).append(h)
        for book_no, count in books.items():
            section = sections.get(str(book_no), "")
            for h in pick_evenly(by_book.get(str(book_no), []), count, key="text"):
                text, narrator = h["text"], ""
                m = re.match(r"^(Narrated [^:]{2,80}):\s*", text)
                if m:
                    narrator, text = m.group(1) + ":", text[m.end():]
                add(label, f"{label} #{h['hadithnumber']}", "Sahih",
                    ara_by.get(h["hadithnumber"], ""), text, narrator, section)

    # 40 Hadith Nawawi (complete)
    eng = fetch(f"{FAWAZ}/eng-nawawi.json", "eng-nawawi.json")
    ara = fetch(f"{FAWAZ}/ara-nawawi.json", "ara-nawawi.json")
    ara_by = {h["hadithnumber"]: h["text"] for h in ara["hadiths"]}
    for h in eng["hadiths"]:
        text, narrator = h["text"], ""
        m = re.match(r"^(Narrated [^:]{2,80}):\s*", text)
        if m:
            narrator, text = m.group(1) + ":", text[m.end():]
        add("40 Hadith Nawawi", f"40 Hadith Nawawi #{h['hadithnumber']}", "Sahih",
            ara_by.get(h["hadithnumber"], ""), text, narrator, "An-Nawawi's Forty")

    for i, item in enumerate(out):
        item["id"] = f"h{i + 1}"
    return out


# --------------------------------------------------------------------------
#  2. Du'as — Hisn al-Muslim · Qur'anic · Sunnah
# --------------------------------------------------------------------------
MARKERS = ("اللهم", "ربنا", "أعوذ", "نعوذ", "سبحانك", "أستغفر", "لا إله إلا أنت")
DUA_BOOKS = {"bukhari": {"80", "78"}, "muslim": {"48", "45"}, "tirmidhi": {"48"},
             "nasai": {"50"}, "ibnmajah": {"34"}}
DUA_COLLECTIONS = ["bukhari", "muslim", "tirmidhi", "abudawud", "nasai", "ibnmajah"]
MIN_MARKERS = 6

# A verse is treated as a du'a only when it actually contains a supplication:
# "rabbanā", "Allāhumma", or "rabbi + imperative request", or a stand-alone request.
QURAN_DUA_PATTERNS = [
    r"ربنا", r"اللهم",
    r"رب(ي|ِّ|ِ)?[\s\u064B-\u0652]*(اغفر|ارحم|هب|اجعل|زدني|زدنى|انصرني|نجني|لا تذر|أوزعني|ءاتني|آتني|اشرح|لا تزغ|أرني|أنزل|عافني|تب علي|اهدني|أغثني|فاغفر|لك)", 
    r"(^|[\s\u064B-\u0652])(اهدنا|ءاتنا|آتنا|ارزقنا|اغفر لنا|تب علينا|لا تؤاخذنا|أجرنا|قنا عذاب|أنت مولانا|فانصرنا|انصرنا|استجب لنا|تقبل منا|وتب علينا|أصلح|أغثنا|لا تجعل)",
]


def quran_is_dua(verse_ar):
    text = norm_ar(verse_ar)
    return any(re.search(p, text) for p in QURAN_DUA_PATTERNS)


def build_duas():
    duas, seen = [], set()
    riyad_ids = riyad_number_map()

    def add(arabic, english, category, purpose, source, reference, detail, grade="", order=9):
        a, e = clean(arabic), clean(english)
        if not a or not e:
            return
        key = norm_ar(a)[:120]
        if key in seen:
            return
        seen.add(key)
        duas.append({
            "id": "",
            "arb": a,
            "en": e,
            "cat": category,
            "purpose": purpose or PURPOSE_BY_CATEGORY.get(category, "Supplication"),
            "src": source,
            "ref": reference,
            "det": detail,
            "grade": grade,
            "_order": order,
        })

    # ---- Hisn al-Muslim (Fortress of the Muslim) -------------------------
    hisn = fetch(HISN, "husn_en.json")
    chapters = hisn["English"] if isinstance(hisn, dict) else hisn
    for ch in chapters:
        title = (ch.get("TITLE") or "").strip()
        for item in ch.get("TEXT") or []:
            arabic = item.get("ARABIC_TEXT") or item.get("Text") or ""
            english = item.get("TRANSLATED_TEXT") or ""
            if not arabic or not english:
                continue
            cat = classify(english, arabic, title, DUA_RULES) or "Sunnah Supplications"
            add(arabic, english, cat, title, "Hisn al-Muslim", "Hisn al-Muslim", title, order=1)

    # ---- Qur'anic du'as --------------------------------------------------
    q_ar = fetch(f"{QURAN}/quran-uthmani", "quran-uthmani.json")["data"]["surahs"]
    q_en = fetch(f"{QURAN}/en.sahih", "quran-en-sahih.json")["data"]["surahs"]
    for s_ar, s_en in zip(q_ar, q_en):
        for a_ar, a_en in zip(s_ar["ayahs"], s_en["ayahs"]):
            if not quran_is_dua(a_ar["text"]):
                continue
            cat = classify(a_en["text"], a_ar["text"], "", DUA_RULES) or "Sunnah Supplications"
            add(a_ar["text"], a_en["text"], "Quranic Duas",
                PURPOSE_BY_CATEGORY.get(cat, "Qur'anic supplication").replace("Seeking ", ""),
                "The Noble Qur'an", f"Qur'an {s_ar['number']}:{a_ar['numberInSurah']}",
                f"{s_ar['englishName']} · {s_ar['englishNameTranslation']}", order=2)

    # ---- Prophetic supplications from the Sunnah ------------------------
    for book in DUA_COLLECTIONS:
        eng = fetch(f"{FAWAZ}/eng-{book}.json", f"eng-{book}.json")
        ara = fetch(f"{FAWAZ}/ara-{book}.json", f"ara-{book}.json")
        ara_by = {h["hadithnumber"]: h["text"] for h in ara["hadiths"]}
        titles = eng["metadata"]["sections"]
        label = eng["metadata"]["name"]
        wanted = set(DUA_BOOKS.get(book, set()))
        counts = Counter()
        for h in eng["hadiths"]:
            a = ara_by.get(h["hadithnumber"], "")
            na = norm_ar(a)
            if a and len(na) <= 600 and any(m in na for m in MARKERS):
                counts[str(h["reference"]["book"])] += 1
        for book_no, n in counts.items():
            if n >= MIN_MARKERS:
                wanted.add(book_no)

        for h in eng["hadiths"]:
            book_no = str(h["reference"]["book"])
            if book_no not in wanted:
                continue
            a = ara_by.get(h["hadithnumber"], "")
            na = norm_ar(a)
            if not a or len(na) > 600 or not any(m in na for m in MARKERS):
                continue
            e = h["text"]
            if len(e) > 800:
                continue
            section = titles.get(book_no, "")
            narrator = ""
            m = re.match(r"^(Narrated [^:]{2,80}):\s*", e)
            if m:
                narrator, e = m.group(1) + ":", e[m.end():]
            cat = classify(e, a, section, DUA_RULES) or "Sunnah Supplications"
            grade = ""
            if label not in ("Sahih al Bukhari", "Sahih Muslim"):
                g = (h.get("grades") or [])
                if g:
                    grade = f"{g[0]['grade']} — {g[0]['name']}"
            elif label in ("Sahih al Bukhari", "Sahih Muslim"):
                grade = "Sahih"
            add(a, (narrator + " " + e).strip(), cat,
                PURPOSE_BY_CATEGORY.get(cat, section or "Prophetic supplication"),
                label, f"{label} #{h['hadithnumber']}", section, grade, order=4)

    # ---- Riyad as-Salihin du'a / dhikr books ----------------------------
    for i in range(1, 21):
        try:
            d = fetch(f"{AHMED}/by_chapter/other_books/riyad_assalihin/{i}.json", f"riyad_book_{i}.json")
        except Exception:
            continue
        title = d["metadata"]["english"]["introduction"].strip()
        for h in d["hadiths"]:
            a = h["arabic"]
            e = (h["english"].get("narrator", "") + " " + h["english"]["text"]).strip()
            na = norm_ar(a)
            if len(na) > 700 or len(e) > 900:
                continue
            if not any(m in na for m in MARKERS):
                continue
            cat = classify(e, a, title, DUA_RULES) or "Sunnah Supplications"
            number = riyad_ids.get(norm_ar(a)[:120], h["idInBook"])
            add(a, e, cat, PURPOSE_BY_CATEGORY.get(cat, title),
                "Riyad as-Salihin", f"Riyad as-Salihin #{number}", title, order=3)

    duas.sort(key=lambda d: d["_order"])
    for item in duas:
        item.pop("_order", None)
    for i, item in enumerate(duas):
        item["id"] = f"d{i + 1}"
    return duas


def main():
    os.makedirs(OUT, exist_ok=True)
    print("Building hadiths …")
    hadiths = build_hadiths()
    print("Building du'as …")
    duas = build_duas()

    with open(os.path.join(OUT, "hadiths.json"), "w", encoding="utf-8") as fh:
        json.dump(hadiths, fh, ensure_ascii=False, separators=(",", ":"))
    print(f"  hadiths.json: {len(hadiths)} items  "
          f"{os.path.getsize(os.path.join(OUT, 'hadiths.json')) / 1024:.0f} KB")

    shards = 3
    size = (len(duas) + shards - 1) // shards
    for s in range(shards):
        chunk = duas[s * size:(s + 1) * size]
        path = os.path.join(OUT, f"duas-{s}.json")
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(chunk, fh, ensure_ascii=False, separators=(",", ":"))
        print(f"  duas-{s}.json: {len(chunk)} items  {os.path.getsize(path) / 1024:.0f} KB")

    print(f"\nHadiths by collection: {dict(Counter(h['src'] for h in hadiths))}")
    print(f"Hadith categories: {dict(Counter(h['cat'] for h in hadiths))}")
    print(f"\nTotal du'as: {len(duas)}")
    print(f"Dua categories: {dict(Counter(d['cat'] for d in duas))}")
    print(f"Dua sources: {dict(Counter(d['src'] for d in duas))}")


if __name__ == "__main__":
    main()
