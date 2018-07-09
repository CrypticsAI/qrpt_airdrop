const ethers = require('ethers');
const utils = ethers.utils;
const Wallet = ethers.Wallet;
const providers = ethers.providers;
const contract = ethers.contract;
const config = require('./config.js');
const balances = require('./balances.json').state;

const provider = new providers.JsonRpcProvider('https://rinkeby.infura.io/4buXiGufnubtu9g9fOjf', 'rinkeby')

const abi = config.abi;

const GAS_LIMIT = 6021054;
const GAS_PRICE = 1000000000; // 1 gwei
const WALLET_LIMIT = 300;
const AIRDROP_LIMIT = 10000;


let wallet = Wallet.fromMnemonic(config.seedKey);
wallet.provider = provider;

const tokenContract = new ethers.Contract(config.contractAddress, abi, wallet);
const walletAddress = wallet.getAddress();

mainStart();

let execute = true;
// main function call where airdrop takes place
async function mainStart()
{
  // send a tx with given amount every duration
  let counter = 0;
  /*balances.forEach((elem, index) => {
    if ((index + 1) % AIRDROP_LIMIT === 0){
      
      return address = [];
    }
    address.push(elem);
  });*/

  let interval = setInterval(() => {
        if (!execute){
          return console.log('wait for tx execution!');
        }
        console.log(' ============= counter ', counter);
        if (counter >= balances.length){
            return clearInterval(interval);
        }
        //console.log(counter, counter + WALLET_LIMIT ,balances.slice(counter, counter + WALLET_LIMIT).length)
        airdrop(counter, balances.slice(counter, counter + WALLET_LIMIT));
        counter += WALLET_LIMIT;
  }, 10000);
}


// function to generate airdrop transaction from wallet file, prints mined tx when complete
async function airdrop(index, addresses){
  console.log('======== Adresses ', addresses.length);
  execute = false;
  const options =
  {
    gasLimit: GAS_LIMIT,
    gasPrice: GAS_PRICE,
    nonce: 0,
  }

  let tx, minedTx;

  try
  {
    tx = await tokenContract.multisend(addresses, AIRDROP_LIMIT, options);
  }
  catch (e)
  {
    console.error(e);
  }

  try
  {
    minedTx = await provider.waitForTransaction(tx.hash);
  }
  catch (e)
  {
    console.error(e);
  }
  execute = true;
  console.log('tx mined at index:', index, 'with hash:', minedTx.hash, 'and balance:', AIRDROP_LIMIT);
}

