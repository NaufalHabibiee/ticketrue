# Ticketrue

Concert tickets that are truly yours. Ticketrue is a ticketing dApp on **BOT Chain** where a ticket is recorded on-chain under your wallet, so anyone can check who owns it, and resale can never go above what the seller paid.

Built for **Build Week Hackathon Vol.2** (Girl Meets Tech x BOT Chain), **RWA track: Event / Ticket App**.

> All concerts, artists and venues in this project are **fictional**. Demo payments (QRIS, bank, e-wallet) are simulations and move no real money.

- **Live website:** https://ticketrue.web.id
- **Repository:** https://github.com/NaufalHabibiee/ticketrue

## What it does, in plain English

Buying a concert ticket online has three familiar problems: fake or duplicated tickets, scalpers who resell at huge markups, and no easy way to prove a ticket is real. Ticketrue fixes them with a smart contract:

1. **You buy a ticket with your wallet.** The contract issues it to your address. One wallet can hold one ticket per concert.
2. **Anyone can verify it.** Every ticket has a QR code that opens a public check page reading the contract. A "live pass" is signed by your wallet and expires in 5 minutes, so a screenshot is useless.
3. **Resale is fair.** You can resell a ticket only at or below what you paid. The buyer pays and receives the ticket in one transaction, and 5% goes to the organizer.
4. **Gate staff check tickets in.** A ticket can be admitted only once.

### Main features
- Browse six concerts, filter by type, venue and date, save favorites, join a waitlist for sold-out shows
- Seat map (seated shows) or ticket tiers, live availability read from the contract
- Wallet connect with MetaMask and one-click switch to BOT Chain (no login needed)
- My Tickets with QR pass, add to calendar, share, and download as an image
- Resell marketplace with a price cap
- Gate check-in page and a public ticket check page (`#/verify/<id>`)
- Organizer dashboard: sales, resale volume, check-ins, publish concerts on-chain, gate staff, withdraw
- A demo mode that works without a contract or wallet, so anyone can try the flow
- A built-in chat assistant that answers questions about the site (runs in the browser, no server)

## Try it in 2 minutes

**Demo mode (no wallet):** open the site, pick a concert, choose a seat or tier, go to checkout, use the **Demo** tab and press *Simulate payment success*, then issue the local demo ticket. Open **My Tickets** to see the QR pass, or **Resell** to list it.

**On-chain mode (BOT Chain Testnet):**
1. Install [MetaMask](https://metamask.io). Press **Connect wallet** on the site. It adds and switches to BOT Chain Testnet for you (Chain ID `968`, RPC `https://rpc.bohr.life`).
2. Get free test BOT at https://faucet.botchain.ai/basic.
3. Pick a concert, go to checkout on the **BOT Chain** tab, press **Buy on BOT Chain**, and confirm in MetaMask.
4. Open **My Tickets**, then **Verify on BOT Chain** or **Show live pass**.

## Smart contracts

| Version | File | Status |
|---|---|---|
| **v2** (used by the website) | [`contracts/Ticketrue.sol`](./contracts/Ticketrue.sol) | Compiled and tested locally. Deployment pending, see below. |
| **v1** (first prototype) | [`contracts/v1/TicketRue.sol`](./contracts/v1/TicketRue.sol) | Deployed and tested on BOT Chain Testnet. |

Solidity `0.8.20`, optimizer enabled with 200 runs. The contract has not been audited.

### v2 main functions

| Function | Who | What it does |
|---|---|---|
| `createEvent(id, seated, demoClaims, startsAt, prices[], capacities[])` | organizer | Opens a concert for sale. Seated concerts have three zone prices (back, sides, front/VIP); the zone and price come from the seat number. Free demo claims are refused on mainnet |
| `closeEvent(eventId)` | organizer | Stops new primary sales (for example after a wrong price or date) |
| `buyTicket(eventId, tier, seat)` | anyone | Buys a ticket at the on-chain price (one per wallet per concert) |
| `claimDemoTicket(eventId, tier, seat)` | anyone | Free claim, only for events created with `demoClaims=true` (testing) |
| `listForResale(ticketId, price)` | ticket holder | Lists a ticket. The price cannot exceed what the holder paid |
| `cancelResale(ticketId)` / `buyResale(ticketId)` | holder / anyone | Cancels a listing, or buys a listed ticket (5% fee to the organizer) |
| `setStaff(address, allowed)` | organizer | Adds or removes gate staff |
| `checkIn(ticketId)` | staff / organizer | Marks a ticket as used (once only) |
| `verifyTicket`, `admits`, `getWalletTickets`, `getOption` | anyone (view) | Ownership, admission and availability checks |
| `withdraw(recipient)` | organizer | Withdraws collected funds |
| `transferOrganizer(address)` / `acceptOrganizer()` | organizer / new organizer | Two-step handover of the admin role |

## Deployment

### BOT Chain Testnet (Chain ID `968`)

| Contract | Address | Explorer |
|---|---|---|
| v1 `TicketRue` | `0x80CB3e83478fddC62617EfDe390FD73C927808B1` | https://scan.bohr.life/address/0x80CB3e83478fddC62617EfDe390FD73C927808B1 |
| v2 `Ticketrue` | _TBD_ | _TBD_ |

> Note: an earlier cart-based revision of `Ticketrue` was deployed to testnet at `0x85164A4B377b26161365cfA371Fa0FE7D3b78b8a` (block 24295412). That interface does not match the contract currently in this repo, so the site runs in demo mode until this version is (re)deployed.

RPC: https://rpc.bohr.life

### BOT Chain Mainnet (Chain ID `677`)

| Contract | Address | Explorer |
|---|---|---|
| v2 `Ticketrue` | _TBD: pending mainnet BOT allocation_ | https://scan.botchain.ai |

RPC: https://rpc.botchain.ai

The website reads the active network and contract address from [`dist/config.js`](./dist/config.js). While no address is set, it runs in demo mode. Step-by-step deployment instructions are in [`DEPLOY.md`](./DEPLOY.md).

## Run it locally

Requires Node.js 20+ and Python 3.

```bash
npm install
npm start
```

Then open http://localhost:8080. Do not open `index.html` directly: the site uses ES modules and needs HTTP.

- `npm run build` copies Three.js, the QR library and the UI font into `dist/` (they are generated, not committed).
- `npm run compile:contract` compiles `contracts/Ticketrue.sol` and refreshes `contracts/abi.json`, `contracts/bytecode.txt` and `dist/abi.js`.

## Hosting

The site is static (`dist/`) and uses URL hashes for routing, so it needs no server rewrites. A GitHub Actions workflow ([`.github/workflows/pages.yml`](./.github/workflows/pages.yml)) builds it and publishes it to GitHub Pages on every push to `main`.

## Security notes

- Ticketrue never asks for your seed phrase. Only connect MetaMask and approve transactions you have read.
- Demo sign-in accepts sample details and stores no password. Data stays in your browser.
- Local organizer pages are a prototype and not an authorization boundary. Real administration is restricted on-chain to the organizer wallet.
- The contracts are unaudited hackathon code. Do not use them with real value.

## Project layout

```
contracts/      Solidity source (v2), ABI, bytecode, and the v1 prototype
dist/           The website (HTML, CSS, JS, images, 3D model)
docs/           Product requirements and design notes
scripts/        Build helpers (asset copy, contract compile)
.github/        GitHub Pages deployment workflow
```

## Team

1. Muhamad Agung Naufal Habibie
2. Raihan Ade Sulaiman
3. Muhammad Faris

## License

[MIT](./LICENSE)
