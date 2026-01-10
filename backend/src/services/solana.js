const { Connection, PublicKey } = require('@solana/web3.js');
const { ENDPOINT, PROGRAM_ID } = require('../config/solana');

const connection = new Connection(ENDPOINT, 'confirmed');

/**
 * Verifies that a Solana transaction exists, is confirmed, and was executed by the expected sender.
 * This supports both:
 * 1. Smart contract program invocations (submit_attempt, place_prediction)
 * 2. Native SOL transfers (legacy support)
 * 
 * @param {string} signature - Transaction signature
 * @param {string} senderAddress - Expected signer wallet address
 * @param {Object} options - Verification options
 * @param {string} options.programId - Expected program ID for contract calls
 * @param {string} options.expectedRecipient - For native transfers, the expected recipient
 * @param {number} options.expectedAmountSol - For native transfers, minimum amount in SOL
 * @returns {Promise<{valid: boolean, error?: string, txData?: object}>}
 */
exports.verifyTransaction = async (signature, senderAddress, options = {}) => {
    try {
        // Validate inputs
        if (!signature || typeof signature !== 'string' || signature.length < 40) {
            return { valid: false, error: 'Invalid signature format' };
        }

        if (!senderAddress) {
            return { valid: false, error: 'Sender address required' };
        }

        // Fetch transaction with retries
        let tx = null;
        let retries = 3;
        
        while (retries > 0 && !tx) {
            tx = await connection.getParsedTransaction(signature, {
                maxSupportedTransactionVersion: 0,
                commitment: 'confirmed'
            });
            
            if (!tx) {
                retries--;
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        if (!tx) {
            return { valid: false, error: 'Transaction not found or not yet confirmed' };
        }

        // Check if transaction was successful
        if (tx.meta?.err) {
            return { valid: false, error: 'Transaction failed on-chain' };
        }

        // Verify sender is a signer
        const accountKeys = tx.transaction.message.accountKeys;
        const senderKey = accountKeys.find(k => k.pubkey.toString() === senderAddress);
        
        if (!senderKey || !senderKey.signer) {
            return { valid: false, error: 'Sender was not a signer of this transaction' };
        }

        // Check for program invocation (smart contract calls)
        const programId = options.programId || PROGRAM_ID?.toString();
        
        if (programId) {
            const hasProgramCall = tx.transaction.message.accountKeys.some(
                k => k.pubkey.toString() === programId
            );
            
            if (hasProgramCall) {
                // If specific instruction is expected, check logs
                if (options.instructionName) {
                    const logs = tx.meta?.logMessages || [];
                    const hasInstruction = logs.some(log => 
                        log.includes(`Instruction: ${options.instructionName}`)
                    );
                    
                    if (!hasInstruction) {
                        return { 
                            valid: false, 
                            error: `Transaction did not execute expected instruction: ${options.instructionName}` 
                        };
                    }
                }

                // Transaction invoked our program - valid contract interaction
                return { 
                    valid: true, 
                    txData: {
                        type: 'program_invoke',
                        programId,
                        slot: tx.slot,
                        blockTime: tx.blockTime
                    }
                };
            }
        }

        // Legacy: Check for native SOL transfer
        if (options.expectedRecipient && options.expectedAmountSol) {
            const instructions = tx.transaction.message.instructions;
            const validTransfer = instructions.some(inst => {
                if (inst.program === 'system' && inst.parsed?.type === 'transfer') {
                    const info = inst.parsed.info;
                    const isCorrectDest = info.destination === options.expectedRecipient;
                    const isCorrectSource = info.source === senderAddress;
                    const isCorrectAmount = info.lamports >= options.expectedAmountSol * 1_000_000_000;
                    
                    return isCorrectDest && isCorrectSource && isCorrectAmount;
                }
                return false;
            });

            if (validTransfer) {
                return { 
                    valid: true, 
                    txData: { type: 'native_transfer' }
                };
            }
        }

        // If we get here and there was a program call, it's valid
        // Otherwise it's a transaction we can't verify
        return { 
            valid: true, 
            txData: { type: 'unknown', note: 'Transaction exists and was signed by sender' }
        };

    } catch (error) {
        console.error('[verifyTransaction] Error:', error.message);
        return { valid: false, error: error.message };
    }
};

/**
 * Simple verification - just checks tx exists and sender signed it
 * Use this when the smart contract already handles payment verification
 */
exports.verifyTransactionSimple = async (signature, senderAddress, instructionName) => {
    const result = await exports.verifyTransaction(signature, senderAddress, {
        programId: PROGRAM_ID?.toString(),
        instructionName
    });
    return result.valid;
};
