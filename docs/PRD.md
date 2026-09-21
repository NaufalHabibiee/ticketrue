# Ticketrue — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Ready for Build  
**Project:** Ticketrue  
**Product Type:** Premium concert ticketing DApp  
**Hackathon:** Build Week Hackathon Vol.2 — Girl Meets Tech / BOT Chain  
**Primary Build Model:** Astra 6  
**Document Language:** English for implementation clarity, with selected Indonesian UX copy where relevant  
**Last Updated:** 20 September 2026

---

## 1. Executive Summary

**Ticketrue** is a premium, interactive concert ticketing platform that combines a familiar Web2 ticket-buying experience with blockchain-based proof of ticket ownership on **BOT Chain**.

The product is designed for users who may have little or no blockchain experience. A user can discover concerts, select a seat or ticket tier, choose a payment method, complete checkout, and receive a verified digital ticket. The blockchain layer should feel helpful rather than intimidating.

The key experience is:

> **Discover → Choose ticket → Pay → Record ownership on BOT Chain → 3D ticket reveal → View verified ticket**

Ticketrue should feel like a polished premium concert brand, **not** a crypto dashboard and not a generic AI-generated SaaS template.

The signature interaction is a **cinematic 3D ticket vending machine** that appears after a successful transaction. The machine powers on, processes the ticket, and physically ejects a digital ticket before transitioning into the final ticket reveal.

For the hackathon:
- Indonesian payment methods are **simulated/dummy**.
- MetaMask + BOT Chain integration is **real**.
- Ticket ownership is recorded on-chain.
- The frontend must connect to the deployed BOT Chain smart contract.
- The website must be live on a custom domain for final submission.
- BOT Chain branding and explorer links must be visible on-site.

---

# 2. Product Vision

## 2.1 Vision Statement

Create a concert ticketing experience that feels as exciting as the event itself.

Ticketrue should make digital tickets feel:
- premium,
- memorable,
- verifiable,
- easy to understand,
- and visually distinctive.

Blockchain is used as infrastructure for ownership and verification, not as the visual identity of the entire product.

---

## 2.2 Product Positioning

**Ticketrue is a premium concert marketplace with on-chain ticket ownership.**

It is not:
- a crypto exchange,
- a wallet dashboard,
- an NFT marketplace,
- an overly futuristic cyberpunk website,
- or a generic ticket marketplace clone.

The experience should feel closer to:
- premium music platforms,
- modern festival websites,
- high-end editorial landing pages,
- cinematic entertainment products.

---

## 2.3 Core Product Principles

### 1. Premium Concert First
Concert content, imagery, artists, venues, and ticket experience are the center of the product.

### 2. Blockchain in the Background
Users should not need to understand blockchain terminology before browsing or buying a ticket.

### 3. Clear Ownership
A purchased ticket should have an obvious verified ownership state.

### 4. Memorable Checkout
The post-purchase 3D ticket machine should be one of the strongest moments in the entire experience.

### 5. Never Feel Like AI Slop
Avoid visual patterns commonly associated with generic AI-generated websites:
- excessive gradient blobs,
- random glowing cards,
- unnecessary glass on every element,
- floating pills everywhere,
- meaningless abstract copy,
- excessive rounded cards,
- random icons,
- fake statistics,
- identical repeated card grids,
- overuse of neon,
- overuse of animations.

### 6. Easy for First-Time Users
The platform includes a guided onboarding/tutorial system that explains the main features step-by-step.

---

# 3. Hackathon Requirements

The official guidebook states that the hackathon requires a working DApp on **BOT Chain**, with a smart contract deployed to BOT Chain and a frontend that connects to MetaMask.

The final submission must include:

1. **BOT Chain contract address**
2. **Live website on a custom domain**
3. **GitHub repository**
   - Solidity `.sol` file
   - README in plain English
   - Deployment section
   - Testnet contract address
   - Mainnet contract address
4. **X post**
   - Dedicated project account
   - Tag `@BOTChain_ai`
5. **Active X presence**
   - At least 5 valid posts within the required period
6. **Mainnet launch announcement**
7. **BOT Chain branding on website**
   - BOT Chain name/logo
   - BOT Chain website link
   - BOT Chain Explorer link

### Judging Priorities

Official scoring emphasizes:

| Criteria | Points |
|---|---:|
| Working contract deployed on BOT Chain | 35 |
| Wallet connects and main action works end-to-end | 30 |
| Use case clarity and originality | 20 |
| Project shared on X | 15 |
| **Total** | **100** |

### Product Implication

The UI should be impressive, but the build must prioritize one reliable end-to-end flow:

> **Connect wallet → choose ticket → complete transaction → write ownership on BOT Chain → show verified ticket**

This flow must never be sacrificed for extra visual features.

---

# 4. Target Users

## 4.1 Primary User — Concert Attendee

A user who:
- wants to discover concerts,
- wants a simple checkout,
- may not understand blockchain,
- wants confidence that their ticket is valid,
- may use Indonesian payment methods,
- may connect MetaMask only when required.

### Main goals
- Find a concert quickly
- Understand ticket options
- Buy a ticket
- Know the transaction succeeded
- Access the ticket later
- Verify ownership

---

## 4.2 Secondary User — Event Organizer

A demo organizer who:
- creates concert listings,
- configures ticket tiers or seats,
- sets supply,
- sets display pricing,
- publishes events,
- monitors ticket claims/sales.

For the hackathon MVP, organizer functions can be limited to a focused dashboard.

---

# 5. User Roles

## Guest

Can:
- view landing page,
- browse concerts,
- open concert details,
- view ticket availability.

Cannot:
- checkout,
- claim/buy tickets,
- access My Tickets.

---

## Registered User

Can:
- login,
- receive guided onboarding,
- browse concerts,
- select tickets,
- use dummy Indonesian payments,
- connect MetaMask,
- complete blockchain transaction,
- view My Tickets,
- verify ticket ownership.

---

## Organizer

Can:
- access organizer dashboard,
- create/edit demo events,
- configure ticket mode,
- configure ticket inventory,
- view purchase/claim activity.

---

# 6. Core Business Rules

## 6.1 One Wallet, One Ticket Per Event

For the MVP:

> **One wallet address may own a maximum of one ticket for a specific event.**

A user cannot purchase two tickets for the same concert using the same wallet.

This rule:
- aligns with the hackathon ticket use case,
- reduces duplicate claims,
- discourages simple scalping,
- makes ownership verification easy to demonstrate.

The UI must communicate this rule before checkout.

Example:

> “Each wallet can hold one Ticketrue ticket for this event.”

---

## 6.2 Ticket Ownership

Ticket ownership must be written on BOT Chain.

Conceptually:

```text
walletAddress
    ↓
eventId
    ↓
ticketId
    ↓
ticketType / seat
    ↓
issuedAt
    ↓
status
```

Minimum on-chain data should be enough to verify:
- who owns the ticket,
- which event it belongs to,
- ticket identifier,
- timestamp,
- validity.

Sensitive personal information must **not** be stored on-chain.

Do not put:
- full name,
- email,
- phone number,
- personal ID,
- payment details,
- private profile data

inside the smart contract.

---

# 7. Payment Model

Ticketrue supports two visual payment categories.

---

## 7.1 Indonesian Payment Methods — DEMO ONLY

These payment methods are simulated for the hackathon.

### Supported demo methods

**QRIS**
- Show QR-style payment screen
- Simulated timer
- “Payment detected” state
- No real money movement

**Bank / Virtual Account**
- BCA
- BNI
- BRI
- Mandiri

**E-Wallet**
- GoPay
- DANA
- OVO
- ShopeePay

### Important UI requirement

Every simulated method must be labeled clearly as:

> **Demo Payment**

or:

> **Hackathon Simulation — No real payment is processed**

This avoids misleading users.

---

## 7.2 Blockchain Payment

Blockchain payment is the real Web3 path.

### Flow

```text
Select Ticket
    ↓
Checkout
    ↓
Choose “Pay with BOT Chain”
    ↓
Connect MetaMask
    ↓
Verify Network
    ↓
User approves transaction
    ↓
Smart contract executes
    ↓
Wait for confirmation
    ↓
Ticket ownership recorded
    ↓
3D Ticket Machine
    ↓
Ticket Reveal
```

---

## 7.3 Dummy Fiat + Blockchain Ownership Flow

Even when Indonesian payment is simulated, the ticket ownership must still be recorded on-chain.

Recommended flow:

```text
Select Ticket
    ↓
Choose QRIS / Bank / E-Wallet
    ↓
Simulated payment succeeds
    ↓
Connect wallet if not connected
    ↓
Confirm ticket issuance transaction
    ↓
Smart contract checks:
    - valid event
    - available inventory
    - wallet does not already own ticket
    ↓
Ownership written on BOT Chain
    ↓
3D Ticket Machine
    ↓
Ticket Reveal
```

### UX Copy

The user should understand why MetaMask appears after a fiat-style payment:

> “Payment confirmed. One final step: verify your ticket ownership on BOT Chain.”

---

# 8. Smart Contract Functional Requirements

The exact Solidity implementation can evolve, but the frontend should be built around the following conceptual interface.

---

## 8.1 Ticket Data Structure

Example conceptual structure:

```solidity
struct Ticket {
    uint256 ticketId;
    uint256 eventId;
    address owner;
    uint256 issuedAt;
    bool valid;
    string ticketType;
    string seatId;
}
```

Avoid large strings if unnecessary.

---

## 8.2 Core Contract State

Conceptual mappings:

```solidity
mapping(uint256 => EventData) events;
mapping(uint256 => mapping(address => bool)) hasTicket;
mapping(uint256 => Ticket) tickets;
mapping(address => uint256[]) walletTickets;
```

---

## 8.3 Required Functions

Possible interface:

```solidity
createEvent(...)
buyTicket(...)
claimPaidTicket(...)
verifyTicket(...)
getTicket(...)
hasTicketForEvent(...)
getEvent(...)
```

The final contract naming can differ.

---

## 8.4 Required Smart Contract Rules

The smart contract should reject:
- duplicate ticket ownership for the same wallet/event,
- invalid event,
- sold-out event,
- unavailable seat,
- invalid tier,
- incorrect blockchain payment amount,
- unauthorized organizer action.

---

## 8.5 Contract Events

Recommended Solidity events:

```solidity
event EventCreated(...);
event TicketPurchased(...);
event TicketIssued(...);
event TicketVerified(...);
```

The frontend can listen for transaction completion and ticket issuance.

---

# 9. Six Demo Concerts

The final frontend must contain **6 fictional concerts**.

Do not use real artists unless assets and naming are intentionally licensed/cleared.

All artists, event names, and artwork can be fictional.

---

## 9.1 Seat Selection Events — 3 Concerts

### Event A — “NEON AFTER MIDNIGHT”
**Artist:** VELORA  
**Genre:** Alternative Pop / Electronic  
**Venue:** Astra Dome Jakarta  
**Ticket Mode:** Seat Selection

Visual direction:
- midnight blue
- icy blue lighting
- elegant stage beams
- high-contrast concert photography

---

### Event B — “ECHOES: LIVE ORCHESTRA”
**Artist:** NARA & THE ASTRALS  
**Genre:** Cinematic Pop  
**Venue:** Meridian Hall  
**Ticket Mode:** Seat Selection

Visual direction:
- deep navy
- silver-blue atmosphere
- warm yellow stage accents
- refined orchestral mood

---

### Event C — “CITY LIGHTS TOUR”
**Artist:** KAIRO  
**Genre:** R&B / Pop  
**Venue:** Skyline Arena  
**Ticket Mode:** Seat Selection

Visual direction:
- dark blue
- city lights
- selective yellow highlights
- premium nightlife look

---

## 9.2 Ticket Tier Events — 3 Concerts

### Event D — “PULSE FEST”
**Artists:** Multiple fictional acts  
**Venue:** Horizon Park  
**Ticket Mode:** Tier

Tiers:
- Festival
- CAT 1
- VIP

---

### Event E — “NOVA WORLD TOUR”
**Artist:** NOVA/SEVEN  
**Venue:** Eclipse Stadium  
**Ticket Mode:** Tier

Tiers:
- CAT 2
- CAT 1
- VIP
- VVIP

---

### Event F — “BLUE HOUR”
**Artist:** SORA VALE  
**Venue:** Lume Theatre  
**Ticket Mode:** Tier

Tiers:
- Regular
- Premium
- VIP

---

# 10. Information Architecture

```text
/
├── Landing / Home
├── Login
├── Sign Up
├── Discover
│   ├── Search
│   ├── Filters
│   └── Concert Cards
├── Event Detail
│   ├── Seat Selection Variant
│   └── Ticket Tier Variant
├── Checkout
│   ├── Order Summary
│   ├── Payment Selection
│   ├── Demo Payment
│   └── Blockchain Payment
├── Wallet Connection
├── Transaction Status
├── Ticket Machine Experience
├── My Tickets
│   └── Ticket Detail / Verification
├── Profile
│   └── Tutorial Settings
├── Organizer Dashboard
│   ├── Events
│   ├── Create Event
│   ├── Edit Event
│   └── Ticket Activity
└── About / BOT Chain References
```

---

# 11. Primary User Journey

## 11.1 First-Time User

```text
Landing
    ↓
Explore concert
    ↓
Login / Sign Up
    ↓
First-time onboarding starts
    ↓
Guided tour
    ↓
Discover page
    ↓
Open event
    ↓
Select seat/tier
    ↓
Checkout
    ↓
Choose payment
    ↓
Connect wallet
    ↓
Blockchain ownership transaction
    ↓
Transaction confirmed
    ↓
3D ticket vending machine
    ↓
Ticket reveal
    ↓
My Tickets
```

---

# 12. First-Time Onboarding / Tutorial System

This is a required feature.

The goal is to make Ticketrue understandable for users who have never used:
- Ticketrue,
- MetaMask,
- BOT Chain,
- blockchain ticket verification.

The onboarding must feel polished and concise.

---

## 12.1 Trigger

Trigger automatically after the user's **first successful login**.

Do not trigger on the public landing page.

---

## 12.2 Intro Modal

Title:

> **Welcome to Ticketrue**

Body:

> Discover concerts, choose your ticket, and keep your ownership verified on BOT Chain.

Actions:
- `Start quick tour`
- `Skip for now`

Secondary note:
> You can replay this tutorial anytime from Profile.

---

## 12.3 Guided Tour Style

Use:
- spotlight highlight,
- dimmed background,
- clean tooltip,
- step counter,
- Back / Next,
- Skip,
- Done.

Example:

```text
┌─────────────────────────────┐
│ 2 of 6                     │
│                             │
│ Find your next concert      │
│ Browse upcoming events here │
│ and filter by category.     │
│                             │
│ Back             Next →     │
└─────────────────────────────┘
```

### Visual rules

Tutorial UI should:
- use solid or lightly translucent navy surfaces,
- use yellow only for primary tutorial CTA,
- not overuse blur,
- keep copy short,
- never obscure critical navigation,
- work on desktop and mobile.

---

# 13. Tutorial Steps

## 13.1 Global First-Login Tour

### Step 1 — Navigation
Highlight top navigation.

Copy:
> “Everything starts here. Explore concerts, check your tickets, or open your profile.”

### Step 2 — Discover
Highlight Discover.

Copy:
> “Browse upcoming concerts and find the experience you want.”

### Step 3 — Tickets
Highlight My Tickets.

Copy:
> “Your purchased tickets and blockchain verification live here.”

### Step 4 — Wallet
Highlight wallet/connect area.

Copy:
> “Connect MetaMask when you are ready to verify or buy a ticket on BOT Chain.”

### Step 5 — Verification
Highlight small BOT Chain indicator.

Copy:
> “Ticketrue records ticket ownership on BOT Chain so ownership can be verified.”

### Step 6 — Finish
Copy:
> “That’s it. Pick a concert and Ticketrue will guide you through the rest.”

CTA:
`Explore concerts`

---

# 14. Contextual Tutorials

The platform should also show short one-time tutorials when a user enters an important feature for the first time.

---

## 14.1 Event Page Tutorial

Highlight:
1. event information
2. ticket selector
3. availability
4. BOT Chain ownership note

---

## 14.2 Seat Selection Tutorial

Steps:
1. Zoom/inspect seat map
2. Available vs selected vs unavailable seats
3. Click a seat to select
4. Continue to checkout

Keep it to maximum 4 steps.

---

## 14.3 Tier Selection Tutorial

Explain:
- tier differences,
- price,
- remaining availability,
- one-wallet-one-ticket rule.

Maximum 3 steps.

---

## 14.4 Checkout Tutorial

Explain:
- order summary,
- Indonesian demo payment,
- BOT Chain payment,
- blockchain verification.

Maximum 4 steps.

---

## 14.5 Wallet Tutorial

Do not teach the user to expose or share private wallet secrets.

Explain only:
- click Connect Wallet,
- approve connection in MetaMask,
- ensure BOT Chain network,
- approve transaction,
- return to Ticketrue.

Security note:

> “Ticketrue will never ask for your Secret Recovery Phrase.”

---

## 14.6 My Tickets Tutorial

Explain:
- ticket status,
- owner wallet,
- transaction hash,
- explorer link,
- QR/verification area.

---

# 15. Tutorial State

For hackathon MVP:

Store tutorial completion state in:
- `localStorage`

Example:

```text
ticketrue:onboarding:global = completed
ticketrue:onboarding:event = completed
ticketrue:onboarding:seat = completed
ticketrue:onboarding:checkout = completed
ticketrue:onboarding:wallet = completed
ticketrue:onboarding:tickets = completed
```

If user account persistence is available, optionally sync state to profile.

Profile settings must include:

- `Replay tutorial`
- `Reset all tutorials`

---

# 16. Landing Page

The landing page is the primary visual showcase.

Reference direction:
- fullscreen visual hero,
- minimal floating navigation,
- strong central headline,
- immersive background,
- restrained CTA,
- premium editorial spacing.

Do not copy the reference image directly.

---

## 16.1 Header / Navigation

Floating nav near top.

Desktop links:
- Home
- Concerts
- My Tickets
- About

Right side:
- `Login`
or, when authenticated:
- user avatar
- wallet status

Style:
- compact,
- premium,
- pill-like but not excessively rounded,
- liquid glass used subtly.

---

## 16.2 Hero

### Layout

Full viewport or approximately 90–100vh.

Background:
- cinematic concert stage,
- crowd silhouettes,
- spotlights,
- blue atmospheric lighting,
- very subtle yellow stage light,
- dark overlay for readability.

### Example copy

Eyebrow:
> `LIVE EXPERIENCES • VERIFIED OWNERSHIP`

Headline:
> **The night starts before the stage lights.**

Subheadline:
> Discover unforgettable concerts and keep your ticket ownership verified on BOT Chain.

Primary CTA:
> `Explore concerts`

Secondary CTA:
> `How Ticketrue works`

---

## 16.3 Hero Interaction

Allowed:
- subtle parallax,
- light movement,
- slow atmospheric gradient,
- tiny responsive movement to cursor.

Avoid:
- huge mouse-follow blobs,
- constant object floating,
- excessive particle systems,
- distracting autoplay animation.

---

# 17. Home Sections

Recommended section sequence:

1. Hero
2. Featured concerts
3. “How Ticketrue Works”
4. Highlighted event editorial section
5. Why ticket ownership matters
6. Ticket machine teaser
7. Upcoming concerts
8. BOT Chain integration
9. Footer

---

# 18. Concert Cards

Concert cards must not look like generic SaaS feature cards.

Use large photography/artwork.

Information:
- artist
- concert name
- city
- date
- venue
- starting price
- ticket mode

Possible subtle badge:
- `Seat Map`
- `Ticket Tier`

Hover behavior:
- artwork gently scales,
- date/location moves slightly,
- CTA appears,
- no excessive glow.

---

# 19. Discover Page

## Desktop

Top:
- title
- search
- compact filters

Filters:
- Date
- Venue
- Ticket mode
- Availability

Main content:
- expressive image-led event grid.

---

## Mobile

Filters open in bottom sheet.

Cards become vertically stacked with strong artwork.

---

# 20. Event Detail Page

Each event detail page should feel like a mini campaign page.

---

## 20.1 Event Hero

Include:
- large event artwork,
- title,
- artist,
- date,
- venue,
- city,
- status,
- CTA.

Use asymmetrical layout when appropriate.

---

## 20.2 Details

Sections:
- Event overview
- Venue
- Schedule
- Ticket options
- Ownership verification explanation

---

# 21. Seat Selection Experience

Used by 3 events.

The seat map should be visually clear, not hyper-realistic.

---

## 21.1 Seat States

### Available
Soft blue

### Selected
Yellow

### Unavailable
Muted dark/gray

### Premium / VIP
Can use a subtle special outline, not excessive glow.

---

## 21.2 Seat Interaction

User:
1. enters seat map
2. sees stage direction
3. clicks available seat
4. seat becomes selected
5. summary updates
6. continues checkout

---

## 21.3 Seat Summary

Show:
- Section
- Row
- Seat number
- Price
- Fees if applicable
- Total

Only one seat can be selected due to one-wallet-one-ticket rule.

---

# 22. Ticket Tier Selection

Used by 3 events.

Tier choices should be structured but not look like repetitive pricing SaaS cards.

Preferred:
- editorial vertical list,
- clear hierarchy,
- benefits,
- availability,
- price.

Example:

```text
VIP
Front viewing area
Priority entry
Exclusive digital ticket style

Rp 1.250.000
42 left
```

---

# 23. Authentication

Authentication uses a familiar Web2 entry point.

---

## 23.1 Login Layout

Reference:
- visual panel on left,
- login panel on right,
- adapted into Ticketrue palette.

Desktop:
- approximately 55% visual
- approximately 45% form

Mobile:
- form becomes primary,
- decorative visual compressed or moved to top.

---

## 23.2 Login Fields

- Email
- Password
- Remember me
- Forgot password
- Login CTA
- Create account

Optional:
- Google login only if implementation is reliable.

Do not add unnecessary social auth providers for the hackathon.

---

## 23.3 Login Visual

Replace Christmas reference with:
- concert crowd,
- ticket imagery,
- stage silhouette,
- subtle ticket-machine illustration.

Use palette:
- `#021024`
- `#052659`
- `#5483B3`
- `#7DA0CA`
- `#C1E8FF`
- yellow accent.

---

# 24. Visual Design System

## 24.1 Core Palette

| Token | Hex | Usage |
|---|---|---|
| Midnight | `#021024` | Main background |
| Deep Navy | `#052659` | Secondary background |
| Concert Blue | `#5483B3` | Secondary accents |
| Soft Blue | `#7DA0CA` | Borders / muted components |
| Ice Blue | `#C1E8FF` | Light surfaces / text accents |
| Action Yellow | `#F9A12B` | Primary CTA / selected states |
| White | `#FFFFFF` | Primary text |

The yellow value is based on the supplied CTA reference and should stay close to the warm orange-yellow tone.

---

## 24.2 Color Ratio

Recommended balance:

- 50–60% Midnight / Deep Navy
- 20–25% concert imagery
- 10–15% soft / ice blue
- 5–8% white
- maximum 3–5% yellow accents

Yellow should feel intentional.

Do not flood the site with yellow.

---

# 25. Liquid Glass System

Liquid glass is a supporting material, not the entire identity.

Use on:
- navbar,
- small overlays,
- ticket detail metadata,
- checkout summary,
- modal shell,
- selected contextual UI.

Avoid on:
- every card,
- every button,
- long content containers,
- seat map,
- all organizer tables.

---

## 25.1 Glass Recipe

Conceptual CSS:

```css
background: rgba(193, 232, 255, 0.08);
border: 1px solid rgba(193, 232, 255, 0.14);
backdrop-filter: blur(18px);
box-shadow:
  inset 0 1px 0 rgba(255,255,255,0.08),
  0 18px 60px rgba(2,16,36,0.22);
```

Adjust for readability and browser support.

---

# 26. Typography

Use a strong modern sans-serif.

Preferred characteristics:
- high readability,
- geometric but not sterile,
- editorial headline quality.

Suggested implementation:
- **Inter / Manrope / Geist** for UI
- optional contrasting display font only if it remains premium.

Do not use more than 2 font families.

---

# 27. Spacing and Shape Language

## Border radius

Avoid universal 24–32px cards.

Use:
- 10–14px for standard controls,
- 16–20px for featured surfaces,
- pill shapes only where functionally appropriate.

## Spacing

Use large editorial whitespace.

Desktop section vertical spacing:
- around 96–144px

Mobile:
- around 64–88px

---

# 28. Buttons

### Primary
Yellow background  
Dark text  
Medium radius  
Strong contrast

### Secondary
Transparent/glass
Light text
Thin border

### Tertiary
Text-only
Arrow interaction

Avoid:
- glowing buttons,
- huge pill CTA everywhere,
- multi-color gradients.

---

# 29. Motion Design

Motion should support hierarchy.

Use:
- fade + slight translate,
- controlled image scale,
- masked text reveal,
- smooth page transitions,
- seat selection state animation,
- ticket machine sequence.

Avoid:
- constant bouncing,
- random floating,
- excessive spring animation,
- scroll hijacking,
- overlong entrances.

---

# 30. Reduced Motion

Honor:

```css
@media (prefers-reduced-motion: reduce)
```

For reduced motion:
- remove parallax,
- shorten transitions,
- replace ticket machine cinematic sequence with a simpler crossfade ticket reveal.

---

# 31. Checkout

Checkout should feel secure and simple.

Desktop:
- left: payment flow
- right: sticky order summary

Mobile:
- order summary collapsible at top
- payment content below

---

## 31.1 Order Summary

Show:
- event artwork
- artist
- date
- venue
- selected tier / seat
- subtotal
- demo payment note where relevant
- total

---

# 32. Payment Selection

Tabs or segmented control:

- `Indonesia`
- `BOT Chain`

Indonesia:
- QRIS
- Bank
- E-Wallet

BOT Chain:
- MetaMask
- network status
- wallet address
- estimated BOT amount
- gas note

---

# 33. Dummy QRIS Flow

1. User selects QRIS
2. Show simulated QR code
3. Label as demo
4. Show 30–60 second visual timer
5. Provide `Simulate payment success` action for demo reliability
6. Transition to Payment Confirmed
7. Continue blockchain ownership step

Do not depend on a real QR payment service.

---

# 34. Dummy Bank Flow

User chooses bank.

Show:
- fake virtual account number,
- copy action,
- demo instructions,
- demo badge,
- `Simulate payment success`.

Do not use a real person's bank account.

---

# 35. Dummy E-Wallet Flow

User chooses provider.

Show:
- provider icon/name,
- demo phone placeholder,
- `Continue demo`,
- payment processing state,
- success state.

No real wallet/e-wallet API required.

---

# 36. MetaMask / Wallet UX

## Disconnected

Button:
> `Connect Wallet`

---

## Connected

Display:
- shortened address
- BOT Chain indicator

Example:

```text
BOT Chain
0x71A4...92F3
```

---

## Wrong Network

Show clear state:

> “Switch to BOT Chain to continue.”

CTA:
> `Switch Network`

---

## Connection Rejected

Message:

> “Wallet connection was cancelled. Your order is still saved.”

CTA:
> `Try again`

---

# 37. Transaction States

The blockchain experience needs explicit states.

### 1. Preparing
> Preparing your ticket...

### 2. Waiting for Wallet
> Confirm the transaction in MetaMask.

### 3. Submitted
> Transaction submitted to BOT Chain.

### 4. Confirming
> Verifying your ticket ownership...

### 5. Confirmed
> Your ticket is verified.

### 6. Failed
> The transaction was not completed.

Provide:
- retry,
- back to checkout,
- transaction link where available.

---

# 38. 3D Ticket Machine — Signature Experience

This is a core visual feature.

It runs **only after successful blockchain confirmation**.

---

## 38.1 Goal

Create a memorable reward moment without making the site heavy.

The sequence should feel:
- cinematic,
- physical,
- satisfying,
- premium,
- short.

---

# 39. 3D Ticket Machine Sequence

Target duration:
**4–7 seconds**

Sequence:

### 0.0–1.0 sec
Background dims.

Machine fades/slides into frame.

### 1.0–2.0 sec
Machine power indicator activates.

Small mechanical motion.

Text:
> `Printing your verified ticket`

### 2.0–4.0 sec
Internal ticket slot lights up.

Ticket begins sliding out.

### 4.0–5.5 sec
Ticket becomes readable.

### 5.5–6.5 sec
Camera subtly settles.

### Final
CTA appears:
- `Reveal my ticket`

Then transition to final ticket detail.

---

# 40. 3D Performance Requirements

The 3D sequence must be:
- lazy loaded,
- not included in initial critical bundle,
- optimized GLB/GLTF,
- compressed textures,
- low-to-medium polygon complexity,
- no real-time heavy reflections,
- no ray-traced effects,
- no user rotation,
- no inspect controls.

Target:
- smooth on a normal modern laptop,
- graceful fallback on low-power/mobile devices.

---

# 41. 3D Fallback

If WebGL is unavailable:
- show pre-rendered animated sequence,
- or CSS/video-like cinematic fallback,
- then reveal ticket.

The purchase flow must never fail because 3D failed.

---

# 42. Ticket Reveal

The final digital ticket should feel collectible but not like an NFT trading card.

Include:
- event name
- artist
- date
- venue
- ticket tier or seat
- ticket ID
- owner wallet short address
- status: Verified
- BOT Chain badge
- transaction hash
- explorer link

---

# 43. My Tickets

## Page Structure

Header:
> **Your nights, all in one place.**

Tabs:
- Upcoming
- Past

Ticket cards:
- event artwork
- date
- venue
- ticket status
- selected seat/tier

Clicking card opens detail.

---

# 44. Ticket Detail

Show:
- ticket visual
- event info
- seat/tier
- wallet owner
- ticket ID
- transaction status
- transaction hash
- verification state
- BOT Chain Explorer link

Possible verification badge:

> `Verified on BOT Chain`

---

# 45. Ticket QR / Verification Area

For the hackathon, QR can be demo-only.

QR payload can conceptually point to:

```text
/ticket/{ticketId}
```

The ticket verification page should retrieve/compare the on-chain ticket record.

The QR itself does not need to perform real venue access control.

---

# 46. Organizer Dashboard

Keep this intentionally simpler than the customer-facing site.

Visual language:
- functional,
- clean,
- same palette,
- less cinematic.

---

## 46.1 Organizer Overview

Metrics:
- Events
- Tickets issued
- Available inventory
- Verified purchases

Avoid fake business analytics unrelated to the demo.

---

## 46.2 Event Management

Table/list:
- Event
- Date
- Ticket mode
- Supply
- Issued
- Status
- Edit

---

## 46.3 Create Event

Fields:
- Event name
- Artist
- Description
- Date/time
- Venue
- City
- Hero image
- Ticket mode:
  - Seat Selection
  - Ticket Tier
- Supply
- Display pricing
- BOT price if applicable

---

# 47. Seat Configuration — Organizer

MVP:
- predefined seat map templates,
- not a full visual seat-map builder.

Organizer can configure:
- sections,
- rows,
- seat count,
- pricing group,
- unavailable seats.

This avoids unnecessary complexity.

---

# 48. Tier Configuration — Organizer

Organizer can create:
- tier name
- description
- price
- supply
- perks

Maximum recommended:
- 4 tiers per event for MVP.

---

# 49. Responsive Design

The full experience must work at:

- 1440px desktop
- 1280px laptop
- 1024px tablet landscape
- 768px tablet
- 390px mobile
- 360px mobile

---

# 50. Mobile Priorities

On mobile:
- simplify hero composition,
- reduce motion,
- use full-width cards,
- use bottom sheets for filters/payment,
- ticket machine can use simplified animation,
- wallet modal must remain readable,
- seat map must support pinch/zoom or clear pan controls.

---

# 51. Accessibility

Minimum:
- semantic HTML
- keyboard navigation
- focus states
- readable contrast
- alt text
- form labels
- status messages
- `aria-live` for transaction progress
- reduced motion support
- do not rely on color alone for seat state

Seat legend should include labels/symbols.

---

# 52. Error States

Required errors:

## Authentication
- incorrect credentials
- empty form
- expired session

## Event
- event unavailable
- event sold out
- seat became unavailable

## Wallet
- wallet not installed
- connection rejected
- wrong network
- insufficient BOT
- transaction rejected

## Blockchain
- RPC unavailable
- transaction failed
- contract error
- duplicate ticket
- transaction timeout

## 3D
- model failed to load

Every error should offer a next action.

---

# 53. Sold-Out Race Condition

If two users attempt the same seat:
- final availability must be checked before on-chain confirmation,
- contract should reject unavailable ownership,
- frontend must show a friendly recovery state.

Message:

> “That seat was just taken. Choose another one and we’ll keep your checkout ready.”

---

# 54. Loading States

Use purposeful loaders.

Avoid generic spinner everywhere.

Examples:
- concert grid skeleton,
- seat map initialization,
- wallet connection status,
- blockchain confirmation timeline,
- 3D machine preload progress.

---

# 55. Empty States

My Tickets empty state:

> **No tickets yet.**
> Your next unforgettable night can start here.

CTA:
> `Explore concerts`

---

# 56. Success States

Success should be visually rewarding.

Do not use huge confetti explosions.

Preferred:
- subtle light pulse,
- ticket machine cinematic,
- verified badge,
- clean success message.

---

# 57. Component Inventory

Core reusable components:

### Navigation
- Header
- MobileNav
- UserMenu
- WalletStatus

### Concert
- ConcertCard
- ConcertHero
- EventMetadata
- TicketModeBadge
- AvailabilityIndicator

### Tickets
- TierSelector
- SeatMap
- Seat
- SeatLegend
- TicketSummary
- DigitalTicket
- VerificationBadge

### Payment
- PaymentMethodTabs
- QRISDemoPanel
- BankDemoPanel
- EWalletDemoPanel
- BlockchainPaymentPanel

### Wallet
- ConnectWalletButton
- WalletModal
- NetworkStatus
- TransactionProgress

### Tutorial
- OnboardingModal
- GuidedTourOverlay
- Spotlight
- TutorialTooltip
- TutorialProgress

### 3D
- TicketMachineScene
- TicketEjectAnimation
- TicketMachineFallback

### Organizer
- OrganizerSidebar
- EventTable
- EventForm
- TierForm
- SeatTemplate

---

# 58. Suggested Frontend Stack

Recommended for fast hackathon implementation:

- React
- Vite or Next.js
- TypeScript
- Tailwind CSS or well-structured CSS modules
- Framer Motion for controlled UI animation
- Three.js / React Three Fiber for ticket machine only
- ethers.js or viem for BOT Chain integration
- MetaMask injected provider

Use whichever stack Astra 6 can implement most reliably.

Priority:
**reliability > framework novelty**

---

# 59. Suggested Data Strategy

For demo content:

Use static local data:

```text
/src/data/events.ts
```

or equivalent.

Do not add a database unless required.

Authentication can be:
- mock/local for prototype,
- or simple existing auth solution if already available.

The blockchain ticket state is the important persistent state for judging.

---

# 60. Suggested Event Data Model

```ts
type Event = {
  id: string
  slug: string
  title: string
  artist: string
  description: string
  date: string
  venue: string
  city: string
  heroImage: string
  cardImage: string
  ticketMode: "seat" | "tier"
  startingPriceIDR: number
  botPrice?: string
  status: "upcoming" | "sold-out" | "ended"
}
```

---

# 61. Suggested Ticket Model

```ts
type Ticket = {
  id: string
  eventId: string
  walletAddress: string
  mode: "seat" | "tier"
  seat?: {
    section: string
    row: string
    number: string
  }
  tier?: string
  status: "pending" | "verified" | "invalid"
  transactionHash?: string
  issuedAt?: string
}
```

---

# 62. BOT Chain Network Configuration

From the hackathon guidebook:

## Testnet

- Network: BOT Chain Testnet
- Chain ID: `968`
- Native token: `BOT`
- RPC: `https://rpc.bohr.life`
- Explorer: `https://scan.bohr.life/`

## Mainnet

- Network: BOT Chain Mainnet
- Chain ID: `677`
- Native token: `BOT`
- RPC: `https://rpc.botchain.ai`
- Explorer: `https://scan.botchain.ai`

Do not hardcode secrets.

Keep network config in a dedicated configuration file.

---

# 63. Environment Configuration

Suggested:

```env
VITE_BOT_CHAIN_ID=
VITE_BOT_RPC_URL=
VITE_CONTRACT_ADDRESS=
VITE_EXPLORER_URL=
```

or Next.js equivalent.

Contract address must be easy to replace after final deployment.

---

# 64. Contract Integration Layer

Create a dedicated module:

```text
/src/web3/
  botChain.ts
  contract.ts
  wallet.ts
  abi.ts
```

Do not scatter wallet calls throughout UI components.

Frontend components should consume clean actions such as:

```ts
connectWallet()
switchToBotChain()
buyTicket()
issueTicket()
verifyTicket()
getWalletTickets()
```

---

# 65. Smart Contract Integration Placeholder

Because the final project contract will be integrated after the website design is finalized, the frontend must be built with:

- mock contract state during UI development,
- isolated ABI/config,
- replaceable contract address,
- clear integration boundary.

The UI should be fully demoable before the final contract is connected.

---

# 66. Security UX

The UI must never:
- request seed phrase,
- request Secret Recovery Phrase,
- ask users to paste private keys,
- store wallet secrets,
- pretend a failed transaction succeeded.

Security copy:

> “Ticketrue will never ask for your Secret Recovery Phrase.”

---

# 67. Performance Targets

Aim for:
- fast first content render,
- compressed event imagery,
- lazy loading below fold,
- lazy load ticket machine,
- no large autoplay background video unless optimized,
- responsive images.

Target quality:
- Lighthouse Performance roughly 80+ where practical
- Accessibility 90+ where practical

Do not sacrifice critical UX to chase perfect scores during hackathon.

---

# 68. SEO / Metadata

Required:
- page title
- meta description
- Open Graph image
- favicon
- project social preview

Example:

**Title:**  
`Ticketrue — Concert Tickets, Verified On-Chain`

**Description:**  
`Discover premium concert experiences and keep your ticket ownership verified on BOT Chain.`

---

# 69. Footer

Footer must include:

- Ticketrue logo
- Concerts
- My Tickets
- About
- Privacy
- Terms

Hackathon-required section:

> **Built on BOT Chain**

Include links to:
- BOT Chain website
- BOT Chain Explorer

This requirement must not be forgotten.

---

# 70. Visual Anti-Patterns — Explicitly Forbidden

Astra 6 should avoid:

- generic purple-blue AI gradients
- random orb backgrounds
- floating glass rectangles everywhere
- huge rounded cards
- glowing borders on every component
- meaningless “AI-powered” labels
- fake dashboards
- random cryptocurrency illustrations
- Matrix/cyberpunk motif
- crypto candlestick imagery
- generic 3D floating coins
- unnecessary robot imagery
- excessive text centered in every section
- all sections using identical card grids
- overuse of badges/pills
- random emoji in professional UI
- default Tailwind-looking layouts without refinement

---

# 71. Premium Visual Direction

Preferred visual cues:

- cinematic concert photography
- deep navy space
- editorial typography
- dramatic cropping
- intentional asymmetry
- strong image hierarchy
- selective glass
- selective yellow
- subtle blue light
- real depth through shadow and layering
- motion used sparingly

---

# 72. Design Reference Mapping

## Reference 1 — Color Palette
Use:
- `#021024`
- `#052659`
- `#5483B3`
- `#7DA0CA`
- `#C1E8FF`

## Reference 2 — Yellow CTA
Use warm action yellow around:
- `#F9A12B`

## Reference 3 — Hero
Use composition ideas:
- immersive fullscreen image
- floating compact navigation
- central hierarchy
- cinematic visual dominance

Do not copy exact content.

## Reference 4 — Login
Use:
- large visual side
- clean form side
- strong compositional split

Replace original color scheme and artwork entirely.

---

# 73. Page-Level Acceptance Criteria

## Landing
- [ ] Premium concert hero
- [ ] Clear primary CTA
- [ ] 6 events visible somewhere in experience
- [ ] Responsive
- [ ] No generic AI visual language

## Login
- [ ] Split layout inspired by provided reference
- [ ] Ticketrue palette
- [ ] Successful login triggers tutorial if first login

## Tutorial
- [ ] Automatic first-login trigger
- [ ] Skip available
- [ ] Replay available
- [ ] Contextual tutorials
- [ ] Tutorial state remembered

## Event
- [ ] 3 seat events
- [ ] 3 tier events
- [ ] One-wallet-one-ticket rule displayed

## Checkout
- [ ] QRIS demo
- [ ] Bank demo
- [ ] E-wallet demo
- [ ] BOT Chain payment path
- [ ] Clear demo labels

## Wallet
- [ ] MetaMask connect
- [ ] Wrong network state
- [ ] BOT Chain switch
- [ ] Rejected transaction state

## Blockchain
- [ ] Real deployed contract
- [ ] Ownership recorded
- [ ] Duplicate ticket prevention
- [ ] Transaction hash surfaced

## 3D
- [ ] Trigger only after blockchain confirmation
- [ ] Cinematic ticket ejection
- [ ] Lazy loaded
- [ ] Fallback if 3D fails

## My Tickets
- [ ] Upcoming ticket list
- [ ] Ticket detail
- [ ] Verification status
- [ ] Wallet address
- [ ] Transaction hash
- [ ] Explorer link

## Footer
- [ ] BOT Chain branding
- [ ] BOT Chain website link
- [ ] Explorer link

---

# 74. MVP Priority

## P0 — Must Work

1. Landing page
2. Login
3. First-time tutorial
4. Six concert listings
5. Event details
6. Seat selection for 3 events
7. Tier selection for 3 events
8. Checkout
9. Dummy Indonesian payment flows
10. MetaMask connection
11. BOT Chain network handling
12. Real smart contract interaction
13. One wallet = one ticket per event
14. Ticket ownership verification
15. My Tickets
16. Transaction hash + explorer link
17. BOT Chain footer branding
18. Live domain
19. GitHub repo + README

---

# 75. P1 — Strong Differentiators

1. Cinematic 3D ticket machine
2. Liquid glass refinement
3. Contextual tutorials
4. Organizer dashboard
5. Smooth page motion
6. Mobile polish
7. Ticket QR demo

---

# 76. P2 — Only If Time Allows

1. Advanced event search
2. More organizer analytics
3. Account sync for tutorial completion
4. Advanced seat map zoom
5. Custom ticket appearance per event

Do not implement P2 before P0 is stable.

---

# 77. Main Demo Script

The hackathon demo should take approximately 2–4 minutes.

### Scene 1
Open Ticketrue landing page.

Explain:
> Ticketrue is a premium concert ticketing platform with ticket ownership recorded on BOT Chain.

### Scene 2
Login.

First-time tutorial appears.

Show that beginners are guided through the platform.

### Scene 3
Open one seat-selection concert.

Choose one seat.

### Scene 4
Checkout.

Briefly show Indonesian demo methods.

Then select BOT Chain payment or continue from demo payment into ownership verification.

### Scene 5
Connect MetaMask.

Confirm BOT Chain.

Approve transaction.

### Scene 6
Wait for contract confirmation.

Show transaction state.

### Scene 7
3D ticket machine appears.

Ticket ejects.

### Scene 8
Open ticket.

Show:
- owner wallet,
- ticket ID,
- Verified on BOT Chain,
- transaction hash,
- explorer.

### Scene 9
Open My Tickets.

Show persistent ownership record.

This demo directly proves the hackathon's main judging criteria.

---

# 78. Definition of Done

Ticketrue is considered hackathon-ready when:

- website is deployed on custom domain,
- six fictional concerts are available,
- three seat-selection events work,
- three tier-selection events work,
- authentication flow works,
- tutorial appears for first-time user,
- tutorials can be replayed,
- dummy QRIS/bank/e-wallet flow works,
- MetaMask connects,
- BOT Chain network is recognized,
- real smart contract is deployed,
- frontend calls smart contract,
- one wallet cannot own two tickets to the same event,
- successful ownership is visible on explorer,
- 3D ticket machine works or safely falls back,
- My Tickets reflects ownership,
- BOT Chain branding appears in footer,
- GitHub README contains deployment information,
- contract addresses are documented,
- main end-to-end flow works repeatedly without manual code changes.

---

# 79. Astra 6 Build Instructions

When implementing this PRD:

1. **Do not redesign the product concept.**
2. Build the visual system from the defined palette.
3. Preserve the premium concert art direction.
4. Avoid generic AI-generated UI patterns.
5. Do not overuse glassmorphism.
6. Keep yellow limited to meaningful action states.
7. Build responsive behavior from the beginning.
8. Treat blockchain states as real application states, not decorative UI.
9. Keep contract config modular so the final ABI/address can be inserted later.
10. Lazy-load all 3D assets.
11. Do not block ticket issuance on 3D rendering.
12. First-login tutorial is a required product feature.
13. Dummy Indonesian payment methods must be clearly labeled.
14. Never simulate blockchain success when a real transaction fails.
15. Optimize for a polished **end-to-end demo**, not maximum feature count.

---

# 80. Suggested Development Order

## Phase 1 — Foundation
- project setup
- typography
- palette
- global layout
- data model
- routing

## Phase 2 — Public Experience
- header
- hero
- home
- discover
- event cards
- event detail

## Phase 3 — Ticket Selection
- seat events
- tier events
- checkout summary

## Phase 4 — Authentication + Tutorials
- login
- first-time onboarding
- contextual tutorials
- persistence

## Phase 5 — Payment Demo
- QRIS
- bank
- e-wallet
- payment states

## Phase 6 — Web3
- wallet connection
- BOT Chain config
- wrong network handling
- contract integration
- transaction states

## Phase 7 — Ticket Ownership
- My Tickets
- ticket detail
- verification
- explorer links

## Phase 8 — Signature Interaction
- 3D ticket machine
- fallback
- performance optimization

## Phase 9 — Organizer
- event management
- create event
- ticket configuration

## Phase 10 — Final QA
- mobile
- accessibility
- performance
- Web3 failure states
- contract testing
- custom domain
- README
- submission checklist

---

# 81. Final Product Identity

Ticketrue should leave the user with three impressions:

> **“This feels like a real premium concert product.”**

> **“Buying and verifying a ticket was surprisingly easy.”**

> **“The ticket reveal was memorable.”**

The blockchain layer should strengthen trust without dominating the visual language.

The final experience should feel like a real ticketing brand that happens to use BOT Chain — not a blockchain demo that happens to sell tickets.

---

# 82. Source Reference

Official hackathon guidebook:

https://www.girlmeetstech.org/guidebook-build-week-hackathon-vol2

This PRD is based on the requirements available in the guidebook as reviewed on 20 September 2026.
