# Deploying Ticketrue v2

This is the step-by-step for putting `contracts/Ticketrue.sol` on BOT Chain and switching the website from demo mode to on-chain mode. Do it on **testnet first**, test everything, then repeat on mainnet.

> Use the **v2 contract** (`Ticketrue`, lowercase "r"). The older prototype `TicketRue` (capital R) is a different contract and does not work with this site.

## 0. Before you start
- MetaMask installed, with the organizer wallet selected. **This wallet becomes the organizer**: it owns the admin rights and the money in the contract. Keep its recovery phrase offline.
- Testnet: BOT Chain Testnet in MetaMask (Chain ID `968`, RPC `https://rpc.bohr.life`), plus test BOT from https://faucet.botchain.ai/basic.
- Mainnet (later): BOT Chain Mainnet (Chain ID `677`, RPC `https://rpc.botchain.ai`), plus BOT allocated by the organizers.

## 1. Compile in Remix
1. Open https://remix.ethereum.org and create a file named `Ticketrue.sol`.
2. Paste the full contents of [`contracts/Ticketrue.sol`](./contracts/Ticketrue.sol).
3. Open the **Solidity compiler** tab: compiler `0.8.20` (or newer 0.8.x), open **Advanced Configurations**, enable **Optimization** with **200** runs.
4. Press **Compile Ticketrue.sol**. It should finish without errors.

## 2. Deploy
1. Open **Deploy & Run Transactions**.
2. Environment: **Browser Extension / Injected Provider, MetaMask**. Check that MetaMask shows the right network (BOT Chain Testnet first).
3. Contract: choose **`Ticketrue`** (double-check it is not the old `TicketRue`).
4. Press **Deploy**, then confirm in MetaMask.
5. Copy the **contract address** from *Deployed Contracts*.
6. Open the deploy transaction on the explorer (https://scan.bohr.life for testnet, https://scan.botchain.ai for mainnet) and note its **block number**.

## 3. Point the website at the contract
Edit [`dist/config.js`](./dist/config.js) and fill in the network you deployed to:

```js
export const activeNetwork='testnet'; // or 'mainnet'
// ...
testnet:{ ..., contractAddress:'0xYOUR_ADDRESS', deployBlock: 1234567 },
```

Commit and push. The GitHub Actions workflow redeploys the site in about two minutes. Until an address is set the site stays in demo mode.

## 4. Publish the concerts on-chain
1. Open the live site, press **Connect wallet**, and select the **organizer wallet**.
2. Open **Dashboard** (footer). You will see one form per concert that is not on-chain yet.
3. Seated concerts have **three zone prices** (back, sides, front/VIP, up to 20 seats each). Tier concerts have one price per tier. Prices are in BOT; the defaults keep the same proportions as the Rp prices.
4. On **testnet** you can leave *Allow free demo claims* ticked so judges without BOT can try a free claim. On **mainnet** the option is hidden and the contract refuses it.
5. Press **Create on-chain** for each concert and confirm in MetaMask.

## 5. Test end to end (testnet)
Use a second wallet as the buyer:
1. Buy a ticket (seat and tier), then open **My Tickets**.
2. Show a **live pass**, and open the QR link in another browser: it should say *Holder confirmed*.
3. **Resell** the ticket at or below the price you paid, and buy it with a third wallet.
4. In **Dashboard**, add gate staff, then use **Gate check-in** to mark a ticket as used.
5. Check that **Withdraw** moves the collected funds to the organizer wallet.

## 6. Mainnet
1. Get BOT on the organizer wallet (organizer allocation or B DEX).
2. Switch MetaMask to BOT Chain Mainnet and repeat steps 1 to 4 with `activeNetwork='mainnet'`.
3. Fill the mainnet contract address in the README **Deployment** table.
4. Only after the contract is live on mainnet, publish the "officially launched on BOT Chain Mainnet" announcement.

## Good to know
- Contracts cannot be changed after deployment. If a price or date is wrong, use `closeEvent` (Dashboard shows sold and remaining tickets) and create the concert again under a new ID.
- The organizer role can be handed over safely: `transferOrganizer(newAddress)`, then the new wallet calls `acceptOrganizer()`.
- Keep the deploy transaction hashes and explorer links. They are your proof for the submission.
