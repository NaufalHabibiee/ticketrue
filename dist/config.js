// Replace contractAddress only after deploying contracts/Ticketrue.sol and creating the six events.
export const chainConfig={chainId:'0x3c8',chainName:'BOT Chain Testnet',nativeCurrency:{name:'BOT',symbol:'BOT',decimals:18},rpcUrls:['https://rpc.bohr.life'],blockExplorerUrls:['https://scan.bohr.life']};
export const contractAddress='';
// ABI signatures are encoded centrally in web3.js; update together if the deployed interface differs.
// Footer social links. Point each url at the real Ticketrue profile once the accounts exist.
export const socials=[{name:'Instagram',url:'https://www.instagram.com/'},{name:'X',url:'https://x.com/'},{name:'TikTok',url:'https://www.tiktok.com/'},{name:'YouTube',url:'https://www.youtube.com/'}];
// BOT Chain links shown in the footer (required branding). Mainnet explorer is the final target; testnet kept for judges.
export const botLinks={site:'https://botchain.ai',explorer:'https://scan.botchain.ai',testnet:'https://scan.bohr.life',faucet:'https://faucet.botchain.ai/basic'};
// Block where the contract was deployed. Set after deploying so the live activity feed can read logs from that point.
export const deployBlock=0;
