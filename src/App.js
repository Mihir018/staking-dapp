import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import StakingContractABI from './StakingContractABI.json';
import './App.css'; // Import the CSS file

const contractAddress = '0x2DC30696313315D3b8CB77726BE340e307468544'; // Replace with your actual contract address

function StakingApp() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [stakedAmount, setStakedAmount] = useState(0);
  const [rewards, setRewards] = useState(0);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [unstakeAmount, setUnstakeAmount] = useState(0);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize the contract
    async function initialize() {
      try {
        // Check if the wallet is connected
        if (window.ethereum && window.ethereum.selectedAddress) {
          await loadContract(window.ethereum);
        }
        // Add an event listener for wallet connection change
        window.ethereum.on('accountsChanged', async (accounts) => {
          if (accounts.length === 0) {
            setContract(null);
            setAccount(null);
          } else {
            await loadContract(window.ethereum);
          }
        });
      } catch (error) {
        setError(error.message);
      }
    }

    initialize();
  }, []);

  const loadContract = async (ethereum) => {
    await ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setAccount(address);
    const contract = new ethers.Contract(contractAddress, StakingContractABI, signer);
    setContract(contract);
    const balance = await contract.balanceOf(address);
    const stakedAmount = await contract.stakedAmount(address);
    const rewards = await contract.totalRewards(address);
    const name = await contract.name();
    const symbol = await contract.symbol();
    setBalance(balance.toNumber());
    setStakedAmount(stakedAmount.toNumber());
    setRewards(rewards.toNumber());
    setName(name);
    setSymbol(symbol);
  };
  

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        await loadContract(window.ethereum);
      } else {
        throw new Error('Please install MetaMask or use a Web3-enabled browser');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleStake = async () => {
    try {
      setLoading(true);
      console.log(stakeAmount);
      // Call the stake function
      const tx = await contract.stake(stakeAmount);
      await tx.wait();

      // Refresh the account balance, staked amount, and rewards
      const balance = await contract.balanceOf(account);
      const stakedAmount = await contract.stakedAmount(account);
      const rewards = await contract.totalRewards(account);
      setBalance(balance.toNumber());
      setStakedAmount(stakedAmount.toNumber());
      setRewards(rewards.toNumber());

      // Reset the stake amount input field
      setStakeAmount(0);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    try {
      setLoading(true);

      // Call the claimRewards function
      const tx = await contract.claimRewards();
      await tx.wait();

      // Refresh the account balance, staked amount, and rewards
      const balance = await contract.balanceOf(account);
      const stakedAmount = await contract.stakedAmount(account);
      const rewards = await contract.totalRewards(account);
      setBalance(balance.toNumber());
      setStakedAmount(stakedAmount.toNumber());
      setRewards(rewards.toNumber());
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    try {
      setLoading(true);

      // Call the unstake function
      const tx = await contract.unstake(unstakeAmount);
      await tx.wait();

      // Refresh the account balance, staked amount, and rewards
      const balance = await contract.balanceOf(account);
      const stakedAmount = await contract.stakedAmount(account);
      const rewards = await contract.totalRewards(account);
      setBalance(balance.toNumber());
      setStakedAmount(stakedAmount.toNumber());
      setRewards(rewards.toNumber());

      // Reset the unstake amount input field
      setUnstakeAmount(0);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staking-app">
      <h1>Staking App</h1>
      {error && <p className="error-message">Error: {error}</p>}
      {!account ? (
        <button className="connect-button" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div className="account-details">
          <p>Account: {account}</p>
          <p>Balance: {balance} {symbol}</p>
          <p>Staked Amount: {stakedAmount} {symbol}</p>
          <p>Rewards: {rewards}</p>
          <div className="staking-section">
            <input
              type="number"
              className="stake-input"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
            />
            <button
              className="action-button stake-button"
              onClick={handleStake}
              disabled={loading}
            >
              Stake
            </button>
            <input
              type="number"
              className="unstake-input"
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)}
            />
            <button
              className="action-button unstake-button"
              onClick={handleUnstake}
              disabled={loading}
            >
              Unstake
            </button>
            <button
              className="action-button claim-button"
              onClick={handleClaimRewards}
              disabled={loading}
            >
              Claim Rewards
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StakingApp;
