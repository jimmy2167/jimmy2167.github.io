<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Web3\Web3;
use Web3\Contract;
use Web3\Utils;

header('Content-Type: text/plain');

// Config - UPDATE THESE!
$polygonRpc = 'https://polygon-mainnet.g.alchemy.com/v2/DpESNEochuL0OHhgkom69';  // Or your own node
$privateKey = '049e21c6f5ca8cc10b18dd593065e3fc7af59ee0e1177d0776a43c8cdd29c213';
$adminAddress = '0x4F5ad08db2a12Db731575abdfC88E516bA84A661';
$tokenContract = '0x54036E5c8f96f85420dE27fBca3c6742b611109f';
$tokenDecimals = 18;  // Usually 18

// Get POST data
$wallet = $_POST['wallet'] ?? '';
$id = $_POST['id'] ?? '';

if (!preg_match('/^0x[a-fA-F0-9]{40}$/', $wallet)) {
    http_response_code(400);
    echo "Invalid wallet address.";
    exit;
}

if (!$id) {
    http_response_code(400);
    echo "Missing submission ID.";
    exit;
}

// Load submissions
$pendingFile = __DIR__ . '/../pending.json';
$submissions = [];

if (file_exists($pendingFile)) {
    $submissions = json_decode(file_get_contents($pendingFile), true);
    if (!is_array($submissions)) {
        $submissions = [];
    }
} else {
    http_response_code(404);
    echo "No submissions found.";
    exit;
}

// Find submission by ID and check status
$foundIndex = null;
foreach ($submissions as $index => $sub) {
    if ($sub['id'] === $id && $sub['status'] === 'pending') {
        $foundIndex = $index;
        break;
    }
}

if ($foundIndex === null) {
    http_response_code(404);
    echo "Submission not found or already approved.";
    exit;
}

// Web3 setup
$web3 = new Web3($polygonRpc);

// ERC20 ABI (only transfer function)
$abi = '[{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"}]';

$contract = new Contract($web3->provider, $abi);
$contract->at($tokenContract);

// Amount to send (e.g. 10 tokens)
$amountTokens = 10;
$amountWei = Utils::toWei((string)$amountTokens, 'ether'); // Using ether for 18 decimals

// Prepare transaction data
$txData = $contract->getData('transfer', $wallet, $amountWei);

// Prepare nonce and gas price - you can customize this or get dynamically
$nonce = null;
$gasPrice = null;

$web3->eth->getTransactionCount($adminAddress, function ($err, $count) use (&$nonce) {
    if ($err !== null) {
        echo "Error fetching nonce: " . $err->getMessage();
        exit;
    }
    $nonce = $count;
});

$web3->eth->gasPrice(function ($err, $price) use (&$gasPrice) {
    if ($err !== null) {
        echo "Error fetching gas price: " . $err->getMessage();
        exit;
    }
    $gasPrice = $price;
});

// Wait a moment to let async calls finish
sleep(2);

if ($nonce === null || $gasPrice === null) {
    echo "Failed to get nonce or gas price.";
    exit;
}

// Build transaction array
$transaction = [
    'nonce' => Utils::toHex($nonce, true),
    'gasPrice' => Utils::toHex($gasPrice, true),
    'gas' => '0x' . dechex(60000),  // Gas limit, adjust if needed
    'to' => $tokenContract,
    'value' => '0x0',
    'data' => $txData,
    'chainId' => 137 // Polygon Mainnet chain ID
];

// Sign transaction
$tx = new \Web3p\EthereumTx\Transaction($transaction);
$signedTx = '0x' . $tx->sign(hex2bin(str_replace('0x', '', $privateKey)));

// Send raw transaction
$txHash = null;
$web3->eth->sendRawTransaction($signedTx, function ($err, $hash) use (&$txHash) {
    if ($err !== null) {
        echo "Error sending transaction: " . $err->getMessage();
        exit;
    }
    $txHash = $hash;
});

// Wait a moment to send
sleep(2);

if (!$txHash) {
    echo "Transaction failed.";
    exit;
}

// Update submission status
$submissions[$foundIndex]['status'] = 'approved';
$submissions[$foundIndex]['txHash'] = $txHash;
file_put_contents($pendingFile, json_encode($submissions, JSON_PRETTY_PRINT));

echo "Success! Tokens sent. TxHash: " . $txHash;
