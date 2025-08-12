let web3;
let userAccount;

async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      userAccount = accounts[0];
      document.getElementById("wallet-btn").innerText = `Connected: ${userAccount.slice(0, 6)}...`;
    } catch (err) {
      alert("Wallet connection failed");
    }
  } else {
    alert("MetaMask not found. Please install it.");
  }
}

async function buyTokens() {
  if (!web3 || !userAccount) {
    alert("Please connect wallet first.");
    return;
  }

  const contractAddress = "0xYOUR_CONTRACT_ADDRESS_HERE";
  const contractABI = []; // Add your ABI here

  const contract = new web3.eth.Contract(contractABI, contractAddress);
  const tokenPrice = web3.utils.toWei("0.01", "ether"); // Example: 0.01 ETH per token

  try {
    await contract.methods.buyTokens().send({ from: userAccount, value: tokenPrice });
    alert("Tokens purchased successfully!");
  } catch (err) {
    console.error(err);
    alert("Transaction failed.");
  }
}
