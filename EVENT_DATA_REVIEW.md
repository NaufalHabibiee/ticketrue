# Event Data Review

Review of `dist/data.js` concert data against smart contract requirements.

## Contract Requirements

**Seated Events (mode: 'seat'):**
- Exactly 3 zone prices (tiers array length = 3)
- Zone 0 (back), Zone 1 (sides), Zone 2 (front/VIP)
- Prices in BOT (not Rp)
- Capacity per zone (unbounded if not set)

**Tier Events (mode: 'tier'):**
- Variable tier count (2-∞ tiers)
- Price per tier (in BOT)
- Capacity per tier (unbounded if not set)

---

## Current Events

### Seated Concerts

| Event | Artist | Tiers | Status |
|---|---|---|---|
| 1 | VELORA | Premium, CAT 1, CAT 2 | ✓ 3 tiers |
| 2 | NARA & THE ASTRALS | Premium, CAT 1, CAT 2 | ✓ 3 tiers |
| 3 | KAIRO | Premium, CAT 1, CAT 2 | ✓ 3 tiers |

**Issue:** Tier names don't match contract convention (should be back/sides/front). **Fix:** Not critical—contract uses tier INDEX, not name. Names are for UI display only. ✓ OK

---

### Tier Events

| Event | Artist | Tiers | Count | Status |
|---|---|---|---|---|
| 4 | THE FREQUENCY COLLECTIVE | Festival, CAT 1, VIP | 3 | ✓ OK |
| 5 | NOVA/SEVEN | CAT 2, CAT 1, VIP, VVIP | 4 | ✓ OK |
| 6 | SORA VALE | Regular, Premium, VIP | 3 | ✓ OK |

**Issue:** Event 5 has 4 tiers while others have 3. **Fix:** Contract supports variable tier count. No issue. ✓ OK

---

## Pricing: Rp → BOT Conversion

All prices in `data.js` are in **Rupiah (IDR)**. On-chain, they must be in **BOT**.

### Current Prices (IDR)

| Event | Title | Mode | Price (Rp) |
|---|---|---|---|
| 1 | Neon After Midnight | Seated | 450,000 |
| 2 | Echoes: Live Orchestra | Seated | 650,000 |
| 3 | City Lights Tour | Seated | 550,000 |
| 4 | Pulse Fest | Tier | 375,000 |
| 5 | Nova World Tour | Tier | 750,000 |
| 6 | Blue Hour | Tier | 275,000 |

### Suggested Conversion (Rp 50,000 = 1 BOT)

| Event | Price (Rp) | → BOT (÷50k) | Adjust | Suggested (BOT) |
|---|---|---|---|---|
| 1 | 450,000 | 9.0 | Standard | 0.1 |
| 2 | 650,000 | 13.0 | Premium | 0.2 |
| 3 | 550,000 | 11.0 | Standard | 0.15 |
| 4 | 375,000 | 7.5 | Budget | 0.05 |
| 5 | 750,000 | 15.0 | Top tier | 0.3 |
| 6 | 275,000 | 5.5 | Budget | 0.05 |

> **Rationale:** Keep proportions recognizable but use round decimals (0.05, 0.1, 0.15, 0.2, 0.3 BOT). Easier for users to understand.

---

## On-Chain Event Setup: Price Tiers

When creating events in organizer dashboard, **set prices per tier/zone**:

### Seated Events (3 zones)

**Event 1 — Neon After Midnight**
- Zone 0 (Premium/Front): 0.15 BOT
- Zone 1 (CAT 1/Sides): 0.1 BOT
- Zone 2 (CAT 2/Back): 0.05 BOT

**Event 2 — Echoes: Live Orchestra**
- Zone 0 (Premium/Front): 0.2 BOT
- Zone 1 (CAT 1/Sides): 0.15 BOT
- Zone 2 (CAT 2/Back): 0.1 BOT

**Event 3 — City Lights Tour**
- Zone 0 (Premium/Front): 0.15 BOT
- Zone 1 (CAT 1/Sides): 0.1 BOT
- Zone 2 (CAT 2/Back): 0.05 BOT

---

### Tier Events (Variable Tiers)

**Event 4 — Pulse Fest** (3 tiers)
- Tier 0 (Festival): 0.05 BOT
- Tier 1 (CAT 1): 0.075 BOT
- Tier 2 (VIP): 0.1 BOT

**Event 5 — Nova World Tour** (4 tiers)
- Tier 0 (CAT 2): 0.1 BOT
- Tier 1 (CAT 1): 0.15 BOT
- Tier 2 (VIP): 0.2 BOT
- Tier 3 (VVIP): 0.3 BOT

**Event 6 — Blue Hour** (3 tiers)
- Tier 0 (Regular): 0.05 BOT
- Tier 1 (Premium): 0.075 BOT
- Tier 2 (VIP): 0.1 BOT

---

## Dates & Schedule

All dates are in **2026-2027** (fictional, for demo). ✓ OK

- Earliest: 2026-11-14 (Event 1)
- Latest: 2027-01-09 (Event 6)

Dates are realistic and spaced out. ✓ OK

---

## Venue & Location Data

All venues, artists, and cities are **fictional**. ✓ OK for hackathon demo.

**Locations:**
- Jakarta (2 events)
- Bandung (1 event)
- Bali (1 event)
- Surabaya (1 event)
- Yogyakarta (1 event)

Good variety of Indonesian cities. ✓ OK

---

## Demo Stock

```javascript
export const demoStock={4:0,5:7};
```

- Event 4 (Pulse Fest): Sold out in demo mode
- Event 5 (Nova World Tour): 7 tickets left in demo mode
- Others: Unlimited in demo mode

This is for demo/testing only. ✓ OK (ignored once contract address is set)

---

## Summary

✅ **Structure:** Correct (3 tiers for seated, variable for tier-based)
✅ **Tier Names:** Acceptable (names for UI, indices for contract)
✅ **Dates:** Realistic, spaced out
✅ **Venues/Artists:** Fictional, good variety
⚠️ **Prices:** Need Rp → BOT conversion before on-chain setup

---

## Action Items

### Before Mainnet Deployment

**When creating events in organizer dashboard, use these BOT prices:**

| Event | Tier 0 | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|---|
| 1 (Seated) | 0.15 | 0.1 | 0.05 | — |
| 2 (Seated) | 0.2 | 0.15 | 0.1 | — |
| 3 (Seated) | 0.15 | 0.1 | 0.05 | — |
| 4 (Tier) | 0.05 | 0.075 | 0.1 | — |
| 5 (Tier) | 0.1 | 0.15 | 0.2 | 0.3 |
| 6 (Tier) | 0.05 | 0.075 | 0.1 | — |

**No changes needed to `dist/data.js`** — Rp prices stay for UI display. Only on-chain prices (contract) use BOT.

---

## Notes

- Tier capacity: Not set in `data.js`. Contract will allow unlimited capacity per tier unless specified during event creation.
- For testnet: Use current data as-is (prices in Rp for UI).
- For mainnet: Use BOT prices above when creating events via organizer dashboard.
