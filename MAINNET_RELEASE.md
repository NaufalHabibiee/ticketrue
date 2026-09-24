# Ticketrue Mainnet Release Record

Use this record only after `contracts/Ticketrue.sol` has been deployed from the organizer wallet on **BOT Chain Mainnet** (chain ID `677`). Do not describe the project as launched on mainnet before every required field below is complete.

## Before deployment

- [ ] MetaMask is on BOT Chain Mainnet: RPC `https://rpc.botchain.ai`, chain ID `677`.
- [ ] The organizer wallet has enough real BOT for gas.
- [ ] Remix is connected through Browser Extension / MetaMask.
- [ ] The selected compiled contract is **Ticketrue** from `contracts/Ticketrue.sol`, compiler `0.8.20`, optimizer enabled with 200 runs.
- [ ] The wallet shown in Remix is the intended Ticketrue organizer wallet.

## Deployment evidence

Fill these values immediately after MetaMask confirms the deployment:

| Field | Value |
| --- | --- |
| Mainnet contract address | `TBD` |
| Deployment transaction hash | `TBD` |
| Deployment block number | `TBD` |
| Explorer URL | `https://scan.botchain.ai/address/TBD` |
| Deployed by | `0xF0c7F07fF9b95ef974435B757b496146f7b10391` |

## Release sequence

1. Send the contract address and deployment block number to the project maintainer.
2. Update `dist/config.js` and the README deployment table, then publish the website.
3. Open `https://ticketrue.web.id/?network=mainnet#/dashboard`, connect the organizer wallet, and create at least one paid event on-chain. Leave demo claims off.
4. Buy one ticket from a separate mainnet wallet and save the explorer link.
5. Confirm the launch page at `https://ticketrue.web.id/#/launch` displays the mainnet address and explorer link.
6. Publish the launch announcement with the exact statement: **“Ticketrue is officially launched on BOT Chain Mainnet.”**

Never share a seed phrase or private key. Only the wallet owner approves the deployment and purchase transactions in MetaMask.
