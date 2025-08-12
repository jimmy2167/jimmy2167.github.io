// Connect to MetaMask
let userAddress = null;

async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = accounts[0];
            document.getElementById("wallet-status").innerText = `Connected: ${userAddress}`;
        } catch (err) {
            alert("Wallet connection failed.");
            console.error(err);
        }
    } else {
        alert("MetaMask is not installed!");
    }
}

document.getElementById("connectWalletBtn").addEventListener("click", connectWallet);

// Handle Certificate Upload
document.getElementById("uploadForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!userAddress) {
        alert("Please connect your wallet first.");
        return;
    }

    const fileInput = document.getElementById("certificate");
    if (!fileInput.files[0]) {
        alert("Please select a certificate image.");
        return;
    }

    const formData = new FormData();
    formData.append("certificate", fileInput.files[0]);
    formData.append("wallet", userAddress);

    try {
        const res = await fetch("upload.php", {
            method: "POST",
            body: formData
        });

        const result = await res.text();
        if (res.ok) {
            alert("Upload successful! Awaiting admin approval.");
        } else {
            alert("Upload failed: " + result);
        }
    } catch (err) {
        alert("Error uploading certificate.");
        console.error(err);
    }
    
    
    // Connect to MetaMask and set up Web3
if (typeof window.ethereum !== 'undefined') {
  window.web3 = new Web3(window.ethereum);
  window.ethereum.request({ method: 'eth_requestAccounts' });
}

const contractAddress = '0x54036E5c8f96f85420dE27fBca3c6742b611109f'; // Replace this
const contractABI = [  // Minimal ERC20 ABI for sending
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  }
];

const tokenContract = new web3.eth.Contract(contractABI, contractAddress);

// Admin send function (called when clicking the "Send" button)
async function sendTokensAsAdmin() {
  const accounts = await web3.eth.getAccounts();
  const admin = accounts[0];

  const recipient = document.getElementById("recipient").value;
  const amount = document.getElementById("amount").value;

  if (!web3.utils.isAddress(recipient)) {
    alert("❌ Invalid recipient address.");
    return;
  }

  const amountInWei = web3.utils.toWei(amount, "ether");

  try {
    await tokenContract.methods.transfer(recipient, amountInWei).send({ from: admin });
    alert(`✅ Sent ${amount} tokens to ${recipient}`);
  } catch (error) {
    console.error(error);
    alert("❌ Token transfer failed. See console.");
  }
}

});
