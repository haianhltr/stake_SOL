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
    const wallet = Keypair.generate();
    const airdropSignature = await connection.requestAirdrop(
      wallet.publicKey,
      1 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
    const balance = await connection.getBalance(wallet.publicKey);
    console.log(balance);
  
    //create stake account
    const stakeAccount = Keypair.generate();
    const minimumRent = await connection.getMinimumBalanceForRentExemption(
      StakeProgram.space
    );
    const amountUserWantsToStake = 0.5 * LAMPORTS_PER_SOL;
    const amountToStake = minimumRent + amountUserWantsToStake;
    const createStakeAccountTx = StakeProgram.createAccount({
      authorized: new Authorized(wallet.publicKey, wallet.publicKey),
      fromPubkey: wallet.publicKey,
      lamports: amountToStake,
      lockup: new Lockup(0, 0, wallet.publicKey),
      stakePubkey: stakeAccount.publicKey,
    });
    const createStakeAccountTxId = await sendAndConfirmTransaction(
      connection,
      createStakeAccountTx,
      [wallet, stakeAccount]
    );
    console.log(`Stake Account created. Tx id: ${createStakeAccountTxId}`);
    let stakeBalance = await connection.getBalance(stakeAccount.publicKey);
    console.log(`Stake Account balance: ${stakeBalance / LAMPORTS_PER_SOL} SOL`);
  
    let stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
    console.log(`Stake Account status: ${stakeStatus.state}`);
  
    const validators = await connection.getVoteAccounts();
    const selectedValidator = validators.current[0];
    const selectedValidatorPublickey = new PublicKey(
      selectedValidator.votePubkey
    );
    const delegateTx = StakeProgram.delegate({
      stakePubkey: stakeAccount.publicKey,
      authorizedPubkey: wallet.publicKey,
      votePubkey: selectedValidatorPublickey,
    });
  
    const delegateTxId = await sendAndConfirmTransaction(connection, delegateTx, [
      wallet,
    ]);
    console.log(
      `Stake account delegated to ${selectedValidatorPublickey}. Tx Id: ${delegateTxId}`
    );
  
    stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
    console.log(`Stake Account status: ${stakeStatus.state}`);



    //deactivate stake
    const deactivateTx = StakeProgram.deactivate({stakePubkey: stakeAccount.publicKey, authorizedPubkey: wallet.publicKey})
    const deactivateTxId = await sendAndConfirmTransaction(connection, deactivateTx, [wallet]);
    console.log(`Stake accounnt deactivated. Tx id:${deactivateTxId}`);

    stakeStatus = await connection.getStakeActivation(stakeAccount.publicKey);
    console.log(`Stake account status: ${stakeStatus.state}`);


    //withdraw stake
    const withdrawTx = StakeProgram.withdraw({stakePubkey: stakeAccount.publicKey, authorizedPubkey: wallet.publicKey, toPubkey: wallet.publicKey, lamports:stakeBalance});
    const withdrawTxId = await sendAndConfirmTransaction(connection, withdrawTx, [wallet]);
    console.log(`Stake account withdrew. Tx id: ${withdrawTxId}`);
    stakeBalance = await connection.getBalance(stakeAccount.publicKey);
    console.log(`Stake account balance: ${stakeBalance / LAMPORTS_PER_SOL}`);
};
  
  const runMain = async () => {
    try {
      await main();
    } catch (err) {
      console.error(error);
    }
  };
  
  runMain();
  