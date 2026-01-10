import { PublicKey } from '@solana/web3.js';
import idl from './idl.json';

// 1. Identify Network
// Change this string to 'mainnet' to switch the entire frontend
export const NETWORK = 'devnet'; 

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

export const CURRENT_CONFIG = current;
export const ENDPOINT = current.endpoint;
export const PROGRAM_ID = new PublicKey(current.programId);
export const TREASURY_WALLET = new PublicKey(current.treasury);
export const IDL = idl;
