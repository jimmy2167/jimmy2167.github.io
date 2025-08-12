// main.js

let web3;
let contract;
const contractAddress = "0x54036E5c8f96f85420dE27fBca3c6742b611109f"; // <-- Replace with your actual contract address

const contractABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  }
];

async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(window.ethereum);

      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      document.getElementById("wallet-btn").innerText = `Connected: ${account.slice(0,6)}...${account.slice(-4)}`;

      contract = new web3.eth.Contract(contractABI, contractAddress);
      updateTotalSupply();
    } catch (err) {
      alert("User denied wallet connection");
    }
  } else {
    alert("Please install MetaMask or a compatible wallet.");
  }
}

async function updateTotalSupply() {
  if (!contract) return;
  try {
    const supply = await contract.methods.totalSupply().call();
    // Assuming decimals = 18 (can also fetch dynamically with contract.methods.decimals().call())
    const decimals = 18;
    const formattedSupply = (supply / (10 ** decimals)).toLocaleString();
    document.getElementById("totalSupply").innerText = formattedSupply;
  } catch (err) {
    console.error("Failed to fetch total supply:", err);
    document.getElementById("totalSupply").innerText = "Error loading supply";
  }
}

window.addEventListener('load', async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(contractABI, contractAddress);
    updateTotalSupply();
  } else {
    document.getElementById("totalSupply").innerText = "Wallet required";
  }
});
