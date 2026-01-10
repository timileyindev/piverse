const express = require('express');
const router = express.Router();
const solanaConfig = require('../config/solana');

router.get('/', (req, res) => {
    res.json({
        network: solanaConfig.NETWORK,
        programId: solanaConfig.PROGRAM_ID.toString(),
        endpoint: solanaConfig.ENDPOINT,
        treasury: solanaConfig.TREASURY_WALLET.toString(),
        idl: solanaConfig.IDL
    });
});

module.exports = router;
