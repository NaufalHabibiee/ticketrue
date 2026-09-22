// Pick the network the site talks to. After deploying contracts/Ticketrue.sol, paste its address and deploy block into that network's entry.
// Leave contractAddress empty to keep the site in demo mode.
export const activeNetwork='testnet'; // 'testnet' | 'mainnet'
export const networks={
  testnet:{chainId:'0x3c8',chainName:'BOT Chain Testnet',nativeCurrency:{name:'BOT',symbol:'BOT',decimals:18},rpcUrls:['https://rpc.bohr.life'],blockExplorerUrls:['https://scan.bohr.life'],contractAddress:'0x85164A4B377b26161365cfA371Fa0FE7D3b78b8a',deployBlock:24295412},
  mainnet:{chainId:'0x2a5',chainName:'BOT Chain Mainnet',nativeCurrency:{name:'BOT',symbol:'BOT',decimals:18},rpcUrls:['https://rpc.botchain.ai'],blockExplorerUrls:['https://scan.botchain.ai'],contractAddress:'',deployBlock:0}
};
const net=networks[activeNetwork];
export const chainConfig={chainId:net.chainId,chainName:net.chainName,nativeCurrency:net.nativeCurrency,rpcUrls:net.rpcUrls,blockExplorerUrls:net.blockExplorerUrls};
export const contractAddress=net.contractAddress;
export const isMainnet=activeNetwork==='mainnet';
// ABI signatures are encoded centrally in web3.js; update together if the deployed interface differs.
// Footer social links. Point each url at the real Ticketrue profile once the accounts exist.
export const socials=[{name:'Instagram',url:'https://www.instagram.com/'},{name:'X',url:'https://x.com/'},{name:'TikTok',url:'https://www.tiktok.com/'},{name:'YouTube',url:'https://www.youtube.com/'}];
// BOT Chain links shown in the footer (required branding). Mainnet explorer is the final target; testnet kept for judges.
export const botLinks={site:'https://botchain.ai',explorer:'https://scan.botchain.ai',testnet:'https://scan.bohr.life',faucet:'https://faucet.botchain.ai/basic'};
export const deployBlock=net.deployBlock;
