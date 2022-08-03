const {
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  StakeProgram,
  Authorized,
  Lockup,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
  PublicKey,
} = require("@solana/web3.js");

const main = async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "processed");
  const STAKE_PROGRAM_ID = new PublicKey(
    "Stake11111111111111111111111111111111111111"
  );

  //validator pubkey
  const VOTE_PUB_KEY = "CRCYwDpCUv2Uaqau934fquPNb3SXXUM4PKoaLRpVMTe5";

  //get delegates for specific validator
  const accounts = await connection.getParsedProgramAccounts(STAKE_PROGRAM_ID, {
    filters: [
      { dataSize: 200 },
      {
        memcmp: {
          offset: 124,
          bytes: VOTE_PUB_KEY,
        },
      },
    ],
  });
  console.log(
    `Total number of delegators found for ${VOTE_PUB_KEY} is: ${accounts.length}`
  );
  if (accounts.length) {
    console.log(`Sample delegator: ${JSON.stringify(accounts[0])}`);
  }
};

const runMain = async () => {
  try {
    await main();
  } catch (err) {
    console.error(error);
  }
};

runMain();
