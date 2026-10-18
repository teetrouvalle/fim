/** Public manual crypto payment options; addresses are supplied by Fim Addis. */
export const cryptoWallets=[
 {id:"usdt_bep20",currency:"USDT",network:"BNB Smart Chain (BEP20)",address:"0x48839599Fe61C06FDca02cACC1E54a306ad5Dab3"},
 {id:"usdt_eth",currency:"USDT",network:"Ethereum",address:"0x48839599Fe61C06FDca02cACC1E54a306ad5Dab3"},
 {id:"usdt_arb",currency:"USDT",network:"Arbitrum",address:"0x48839599Fe61C06FDca02cACC1E54a306ad5Dab3"},
 {id:"usdt_op",currency:"USDT",network:"Optimism",address:"0x48839599Fe61C06FDca02cACC1E54a306ad5Dab3"},
 {id:"usdc_arb",currency:"USDC",network:"Arbitrum",address:"0x48839599Fe61C06FDca02cACC1E54a306ad5Dab3"},
 {id:"usdc_eth",currency:"USDC",network:"Ethereum",address:"0x48839599Fe61C06FDca02cACC1E54a306ad5Dab3"},
 {id:"usdc_base",currency:"USDC",network:"Base",address:"0x48839599Fe61C06FDca02cACC1E54a306ad5Dab3"},
 {id:"usdc_sol",currency:"USDC",network:"Solana",address:"9embAL4QMf3YzyQLJY2oxfoaDddKcNthviAuWJaiTu2Z"},
 {id:"usdt_sol",currency:"USDT",network:"Solana",address:"9embAL4QMf3YzyQLJY2oxfoaDddKcNthviAuWJaiTu2Z"},
 {id:"usdt_trc20",currency:"USDT",network:"Tron (TRC20)",address:"TLakkQZgq8JzedA17BrcVi2gUKoPcX2tdg"},
 {id:"btc",currency:"BTC",network:"Bitcoin",address:"bc1q8r4vgkh3ynzd65p2vhlf2f2l964xuk7fxfntv5"}
] as const;
export function findCryptoWallet(id:string){return cryptoWallets.find(w=>w.id===id);}
export function parseCryptoReference(reference:string){
 const match=/^CRYPTO:([a-z0-9_]+):([A-Za-z0-9]+)$/.exec(reference);
 if(!match)return null;
 const wallet=findCryptoWallet(match[1]);
 return wallet?{wallet,transaction:match[2]}:null;
}
/** Transaction hashes are case-sensitive on Solana; do not uppercase crypto references. */
export function isValidCryptoTransaction(networkId:string,hash:string){
 if(networkId==="btc"||networkId==="usdt_trc20")return /^[0-9a-fA-F]{64}$/.test(hash);
 if(networkId.endsWith("_sol"))return /^[1-9A-HJ-NP-Za-km-z]{80,100}$/.test(hash);
 return /^0x[0-9a-fA-F]{64}$/.test(hash);
}
