// Pick the network the site talks to. After deploying contracts/Ticketrue.sol, paste its address and deploy block into that network's entry.
// Leave contractAddress empty to keep the site in demo mode.
// The live domain defaults to testnet. Open the same site with ?network=mainnet
// after the mainnet contract is deployed to use the production deployment.
const requestedNetwork=new URLSearchParams(window.location.search).get('network');
export const activeNetwork=requestedNetwork==='mainnet'?'mainnet':'testnet';
export const networks={
  testnet:{chainId:'0x3c8',chainName:'BOT Chain Testnet',nativeCurrency:{name:'BOT',symbol:'BOT',decimals:18},rpcUrls:['https://rpc.bohr.life'],blockExplorerUrls:['https://scan.bohr.life'],contractAddress:'0x324348D3f63850e77672da7e0E4A9806336eA210',deployBlock:24509734},
  mainnet:{chainId:'0x2a5',chainName:'BOT Chain Mainnet',nativeCurrency:{name:'BOT',symbol:'BOT',decimals:18},rpcUrls:['https://rpc.botchain.ai'],blockExplorerUrls:['https://scan.botchain.ai'],contractAddress:'0x80CB3e83478fddC62617EfDe390FD73C927808B1',deployBlock:24354955}
};
const net=networks[activeNetwork];
export const chainConfig={chainId:net.chainId,chainName:net.chainName,nativeCurrency:net.nativeCurrency,rpcUrls:net.rpcUrls,blockExplorerUrls:net.blockExplorerUrls};
export const contractAddress=net.contractAddress;
export const isMainnet=activeNetwork==='mainnet';
// ABI signatures are encoded centrally in web3.js; update together if the deployed interface differs.
// Footer social links. Point each url at the real Ticketrue profile once the accounts exist.
export const socials=[{name:'Instagram',url:'https://www.instagram.com/'},{name:'X',url:'https://x.com/tiketrue'},{name:'TikTok',url:'https://www.tiktok.com/'},{name:'YouTube',url:'https://www.youtube.com/'}];
// BOT Chain links shown in the footer (required branding). Mainnet explorer is the final target; testnet kept for judges.
export const botLinks={site:'https://botchain.ai',explorer:'https://scan.botchain.ai',testnet:'https://scan.bohr.life',faucet:'https://faucet.botchain.ai/basic'};
export const deployBlock=net.deployBlock;
