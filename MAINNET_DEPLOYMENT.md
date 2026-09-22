# Deploying Ticketrue v2 to BOT Chain Mainnet

Step-by-step guide to deploy the Ticketrue v2 contract to BOT Chain Mainnet and go live.

> **Prerequisites:** You must have completed testnet deployment first. See [DEPLOY.md](./DEPLOY.md).

## 0. Before you start

### Wallet & Funds
- **Organizer wallet:** Must hold sufficient BOT tokens to cover deployment gas + event creation transactions.
  - Deployment gas: ~500,000 gas (≈0.1-0.2 BOT at current rates)
  - Event creation: ~200,000 gas per event (≈0.04-0.08 BOT per concert)
  - Estimate: **0.5+ BOT** for 6 concerts + deployment
- **MetaMask:** Switch to **BOT Chain Mainnet** (Chain ID `677`, RPC `https://rpc.botchain.ai`)
- **Block Explorer:** https://scan.botchain.ai

### Contract
- v2 contract already compiled and tested on testnet: `contracts/Ticketrue.sol`
- ABI signatures in `dist/abi.js` (do NOT change between testnet and mainnet)

### Website
- Website code is ready and pointing to testnet
- Site will auto-switch to mainnet once contract address is configured

## 1. Compile in Remix (Mainnet)

Same as testnet, but verify Remix settings:

1. Open https://remix.ethereum.org
2. Upload / create file `Ticketrue.sol` from `contracts/Ticketrue.sol`
3. **Solidity Compiler** tab:
   - Compiler: `0.8.20`
   - Open **Advanced Configurations**
   - Enable **Optimization**: 200 runs
4. Click **Compile Ticketrue.sol**
5. Confirm: checkmark ✓ appears (no errors)

## 2. Deploy to Mainnet

1. Open **Deploy & Run Transactions** tab
2. **Environment:** `Browser Extension` (MetaMask)
3. **Network in MetaMask:** Switch to **BOT Chain Mainnet** (Chain ID `677`)
   - If not listed: Add network manually
     - RPC: `https://rpc.botchain.ai`
     - Chain ID: `677`
     - Currency: BOT
4. **Account:** Select organizer wallet (has BOT tokens)
5. **Contract:** Select `Ticketrue` (NOT the old `TicketRue`)
6. **Constructor params:** None (organizer is msg.sender, determined by wallet)
7. Click **Deploy** → Approve in MetaMask

> Wait for transaction to confirm (1-2 minutes). Block explorer: https://scan.botchain.ai

## 3. Copy Contract Address & Block Number

After deployment succeeds:

1. In Remix, open **Deployed Contracts** tab
2. Find `Ticketrue` instance
3. Copy the **contract address** (e.g., `0x1234...abcd`)
4. Go to https://scan.botchain.ai and search the address or transaction hash
5. Note the **block number** from the deployment transaction

**Save these:**
- Contract address: `0x...`
- Deploy block: `1234567`

## 4. Point the Website at Mainnet Contract

Edit `dist/config.js`:

```javascript
export const activeNetwork='mainnet';  // ← Change from 'testnet' to 'mainnet'
export const networks={
  testnet:{chainId:'0x3c8',...},
  mainnet:{
    chainId:'0x2a5',
    chainName:'BOT Chain Mainnet',
    nativeCurrency:{name:'BOT',symbol:'BOT',decimals:18},
    rpcUrls:['https://rpc.botchain.ai'],
    blockExplorerUrls:['https://scan.botchain.ai'],
    contractAddress:'0x...INSERT_MAINNET_ADDRESS_HERE...',  // ← Paste address
    deployBlock:1234567  // ← Paste block number
  }
};
```

Save and commit:

```bash
git add dist/config.js
git commit -m "config: switch to BOT Chain Mainnet contract"
git push origin main
```

> Site auto-deploys to ticketrue.web.id in ~2 minutes. Verify in browser.

## 5. Create Events On-Chain

1. Open https://ticketrue.web.id in browser
2. Click **Connect wallet** → MetaMask switches to mainnet
3. Open **Dashboard** (footer link)
4. You will see forms for each concert (1–6) not yet on mainnet

### For Each Concert

**Seated concerts** (e.g., concerts 1, 3, 5):
- Three zone prices: Back, Sides, Front/VIP
- Example prices (in BOT):
  - Back: 0.1 BOT
  - Sides: 0.2 BOT
  - VIP: 0.3 BOT
- Leave capacity unbounded (or set high: e.g., 1000)
- Toggle **Allow free demo claims** → OFF (mainnet only, no free claims)

**Tier concerts** (e.g., concerts 2, 4, 6):
- One price per tier (General, VIP, Premium)
- Example prices:
  - General: 0.1 BOT
  - VIP: 0.2 BOT
  - Premium: 0.3 BOT
- No demo claims on mainnet

5. For each concert, click **Create on-chain** → Approve in MetaMask
6. Wait for transaction to confirm (check Dashboard for success)

> **Cost estimate:** ~0.04–0.08 BOT per event × 6 = ~0.3 BOT total

## 6. End-to-End Test (Mainnet)

Use a **separate wallet** as the buyer (not the organizer):

### Buyer Wallet Setup
1. Create or use a second MetaMask account
2. Send it ~0.2 BOT from organizer wallet (for gas + ticket purchase)
3. Switch MetaMask to BOT Chain Mainnet

### Test Flow
1. **Browse & Buy:**
   - Open https://ticketrue.web.id
   - Pick a concert
   - Select seat/tier and quantity
   - Checkout → **BOT Chain** tab
   - Click **Buy on BOT Chain**
   - Confirm in MetaMask
   - Verify: ticket appears in **My Tickets**

2. **Verify Ownership:**
   - Click ticket → **Verify on BOT Chain**
   - Should show: "Holder confirmed" + on-chain data

3. **Live Pass (QR):**
   - In **My Tickets**, click **Show live pass**
   - Open QR link in new browser
   - Should say "Holder confirmed" + expiration timer

4. **Resell:**
   - Click **Resell** on ticket
   - List at price ≤ purchase price
   - Use organizer wallet to buy it back (or third wallet)
   - Verify: ticket transfers, fee splits correctly

5. **Gate Check-In:**
   - Switch to organizer wallet
   - Open **Dashboard**
   - Add buyer wallet as **Gate staff**
   - Open **Gate check-in** page
   - Scan ticket QR or enter ticket ID
   - Click **Check-in** → Confirm
   - Verify: ticket marked as used (cannot resell)

6. **Withdraw:**
   - In **Dashboard**, click **Withdraw**
   - Funds should transfer to organizer wallet
   - Verify on mainnet explorer

### Success Criteria
- ✓ All transactions confirmed on-chain
- ✓ Tickets show on explorer (`verifyTicket` returns true)
- ✓ Resale enforces price cap
- ✓ Check-in prevents re-admission
- ✓ Withdraw moves funds

## 7. Verify Deployment

### Contract Verification (Optional but Recommended)
1. Go to https://scan.botchain.ai
2. Search contract address
3. Click **Contract** tab
4. Click **Verify & Publish**
5. Upload `contracts/Ticketrue.sol`
6. Compiler: `0.8.20`, Optimization: `200 runs`
7. Submit

> Verified contracts show source code on explorer (builds trust)

### Update README

Edit `README.md` **Deployment** section:

```markdown
### BOT Chain Mainnet (Chain ID `677`)

| Contract | Address | Explorer |
|---|---|---|
| v2 `Ticketrue` | `0x...` | https://scan.botchain.ai/address/0x... |

RPC: https://rpc.botchain.ai
```

Commit & push:

```bash
git add README.md
git commit -m "docs: add mainnet contract address to README"
git push origin main
```

## 8. Go Live & Announce

Once verified:

1. **X Post (Build-in-Public):**
   - Tag @BOTChain_ai
   - Link to ticketrue.web.id
   - "🚀 Ticketrue is now live on BOT Chain Mainnet!"

2. **Launch Write-Up:**
   - Medium / Substack / own blog
   - Title: "Ticketrue Officially Launched on BOT Chain Mainnet"
   - Include contract address + explorer link
   - Explain features (buy, resale, gate check-in)
   - Call-to-action: "Try it now at ticketrue.web.id"

3. **Hackathon Submission:**
   - Contract address: ✓
   - Live domain: ✓
   - GitHub README: ✓
   - X post: ✓
   - Launch write-up link: ✓
   - BOT Chain branding: ✓

## Troubleshooting

**MetaMask rejects transaction:**
- Verify sufficient BOT for gas
- Check network is mainnet (Chain ID `677`)
- Increase gas limit manually

**Contract address not showing in Deployed Contracts:**
- Check MetaMask approval (should have popup)
- Wait 30 seconds, refresh Remix
- If still missing, check transaction on https://scan.botchain.ai

**Website says "Demo mode" after setting address:**
- Clear browser cache (Ctrl+Shift+Delete)
- Reload ticketrue.web.id
- Check dist/config.js `activeNetwork='mainnet'`

**Transactions take >2 min:**
- Normal on mainnet. Check status on https://scan.botchain.ai
- Do NOT re-submit transaction

## Timeline

| Step | Est. Time |
|---|---|
| Compile (Remix) | 2 min |
| Deploy contract | 2–3 min |
| Update config & push | 3 min |
| Create 6 events | 10–15 min |
| End-to-end test | 10 min |
| Write launch post | 15 min |
| **Total** | ~45 min |

---

**Next:** After mainnet is live and tested, write the [Launch Write-Up](./MAINNET_WRITEUP.md) and submit to hackathon.
