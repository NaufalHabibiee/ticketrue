# TicketRue

On-chain concert ticketing dApp built for **Build Week Hackathon Vol.2** (Girl Meets Tech / BOT Chain track).

One wallet, one ticket per event — enforced directly by the smart contract, not by a backend server. Organizers create events on-chain; attendees connect their wallet and claim a ticket, which is recorded permanently on BOT Chain.

## Live Demo

- **Website:** _TBD — add live custom domain URL here_
- **Video/Screenshots:** _optional, add if available_

## Tech Stack

- **Smart contract:** Solidity `^0.8.20`
- **Chain:** BOT Chain (EVM-compatible)
- **Frontend:** HTML / CSS / vanilla JavaScript, [ethers.js](https://docs.ethers.org/v5/) v5
- **Wallet:** MetaMask (browser extension)

## How It Works

1. Organizer calls `createEvent(name, description, totalTickets)` to open a new event.
2. Attendee connects their wallet on the site.
3. Attendee calls `claimTicket(eventId)` — the contract checks the wallet hasn't already claimed and that tickets remain, then records the claim with a timestamp.
4. Anyone can verify a wallet's ticket via `hasTicket(eventId, wallet)`.

## Smart Contract

Source: [`contracts/TicketRue.sol`](./contracts/TicketRue.sol)

Key functions:

| Function | Access | Description |
|---|---|---|
| `createEvent(string name, string description, uint256 totalTickets)` | organizer only | Opens a new event |
| `closeEvent(uint256 eventId)` | organizer only | Closes an event to further claims |
| `claimTicket(uint256 eventId)` | anyone | Claims one ticket (one per wallet per event) |
| `hasTicket(uint256 eventId, address wallet)` | view | Checks whether a wallet holds a ticket |
| `getEvent(uint256 eventId)` | view | Returns full event details |
| `getAvailableTickets(uint256 eventId)` | view | Returns tickets remaining |

## Deployment

### Testnet — BOT Chain Testnet (Chain ID `968`)

| | |
|---|---|
| Contract Address | `0x80CB3e83478fddC62617EfDe390FD73C927808B1` |
| Explorer | https://scan.bohr.life/address/0x80CB3e83478fddC62617EfDe390FD73C927808B1 |
| RPC | https://rpc.bohr.life |

### Mainnet — BOT Chain Mainnet (Chain ID `677`)

| | |
|---|---|
| Contract Address | _TBD — pending mainnet BOT allocation from organizer_ |
| Explorer | https://scan.botchain.ai/address/TBD |
| RPC | https://rpc.botchain.ai |

## Running Locally

No build step required — it's a static page.

```bash
git clone https://github.com/<your-username>/ticketrue.git
cd ticketrue
# open index.html directly in a browser, or serve it:
npx serve .
```

MetaMask will prompt to add/switch to **BOT Chain Testnet** automatically if it isn't already configured.

## Team

Build Week Hackathon Vol.2 — Team _TicketRue_

- Naufal (Prof X) — [GitHub handle]
- _Teammate 2 — GitHub handle_
- _Teammate 3 — GitHub handle_

## Acknowledgements

Built on [BOT Chain](https://botchain.ai) · [scan.botchain.ai](https://scan.botchain.ai)

## License

MIT
