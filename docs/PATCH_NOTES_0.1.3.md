# Paper City — Update 0.1.3 "The Row Is Open"

*Patch notes for r/PaperCityRPG · September 23, 2026*

---

0.1.2 gave Paper City a **population**. This one gives it **new ground to walk**. Foundry Row is the city's decommissioned printworks strip — a ninth district built as *neutral ground*, where all three factions bid for the same machines and the work comes before the politics.

## 🏭 Foundry Row — the ninth district

Between The Block and the Transit Hub (new east-side exit on The Block). Seven mapped venues across the strip: the **Foundry Press**, **Scrap & Sort**, **Block 8** (fight venue), the **All-Factions Counter**, and the **Council Hall** — plus the furnaces, stacks, and scrap heaps that make the Row read like the Row.

The district's whole premise is faction parity: every banner works the same machines, so every faction gets equal content in one place — a resident, a work action, a contract, and a vendor item each.

## 👥 Three new residents, on real schedules

- **Grip** (Angel) anchors the Row and lives on-site. Furnaces hot by six: *"A press doesn't care who owns it. It cares whether the operator shows up."*
- **Needle** (Ghost) does paper rounds on The Block in the morning, then holds the Row. *"Every machine on this Row was bought twice — once with money, once with favors. I keep the second ledger."*
- **Slide** (Demon) sleeps in Block 8 and sweeps from six. *"The Row's neutral because we keep it neutral. You're welcome. That courtesy has a maintenance fee."*

All three carry full morning/afternoon/evening/night dialogue written against their actual schedules, and their services **travel with them**. Arc endings still matter: Coalition Steward unlocks Grip's **press maintenance waiver**, The Open Channel unlocks Needle's **scrap futures sheet**, The Enforcer unlocks Slide's **pit-weight certification**.

## ⚖️ Built for balance — and enforced by CI

- **Parity items**, one per playstyle, all **45 credits** from the All-Factions Counter: **Pressed Crest** (Charisma), **Counterfeit Ledger** (Intelligence), **Weighted Knuckles** (damage-7 weapon)
- **Parity actions**, same energy/time band, faction-flavored stat payouts: Press Work, Scrap Sort, Council Hearing
- **Three new daily contracts** — Foundry Press Run (Angel), Scrap Audit (Ghost), Block Eight Collection (Demon)
- A new **faction-parity validator** runs on every push: contract pools must stay within 2× across factions, every faction needs a gated vendor, service counts within band, and any drift from the faction content matrix fails CI. It caught a real bug on its first run — the All-Factions Counter was accidentally gated to Angels only. Fixed: everyone can trade there now.

## 🗺️ Also new since 0.1.2

- **The Waterfront** — the eighth district: customs seals (Angel), manifest intel (Ghost), Pier 31's night rate (Demon), and residents Halyard, Condor, and Harrow. Full notes in its own post, coming soon.
- **City Map overview** — one screen showing every district, how they connect, and each district's faction flavor. Flavor is *derived from who actually walks the district right now*, so it shifts contested/leaning as NPCs follow their schedules.
- **Karma fix** — civic actions now award karma directly: sitting in on the **Foundry Council Hearing** or witnessing the **Customs Review** pays +1 Karma.
- **Fight audit** — every fight venue in the city now provably resolves to a real enemy (the audit caught Block 8 silently dead-clicking; it's been worth the click ever since).

## 🔜 Next

The Waterfront deep-dive post, then reputation-driven street behavior (a feared player gets *yielded to*), time-gated rumors tied to contracts and markets, and deeper nightlife rotations.

---

*Foundry Row ships in Update 0.1.3 — grab the Windows installer from the [Releases page](https://github.com/sgscrap/paper-city/releases). Existing saves carry over — new systems initialize safely on first load.*
