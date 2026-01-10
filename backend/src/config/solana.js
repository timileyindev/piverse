const { PublicKey } = require('@solana/web3.js');

// 1. Identify Network (Default to devnet)
const NETWORK = process.env.SOLANA_NETWORK || 'devnet';

// 2. Define Configuration Map
const CONFIG = {
    devnet: {
        programId: '6fuSCXdjP9wKi8GE8xXZkCERS1rrvFfuxSVK5sySazh6',
        endpoint: 'https://api.devnet.solana.com',
        treasury: '8c71AvjQeKKeWRe8izt8yJ5aFqH4r52656p475141646'
    },
    mainnet: {
        programId: '6fuSCXdjP9wKi8GE8xXZkCERS1rrvFfuxSVK5sySazh6', // TODO: Update on Mainnet Deploy
        endpoint: 'https://api.mainnet-beta.solana.com',
        treasury: '8c71AvjQeKKeWRe8izt8yJ5aFqH4r52656p475141646'
    }
};

const current = CONFIG[NETWORK];

module.exports = {
    NETWORK,
    ENDPOINT: current.endpoint,
    PROGRAM_ID: new PublicKey(current.programId),
    TREASURY_WALLET: new PublicKey(current.treasury),
    IDL: require('./idl.json')
};
