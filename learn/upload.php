<?php
// Configuration
$uploadDir = __DIR__ . "/certificates/";
$maxFileSize = 5 * 1024 * 1024; // 5 MB max
$allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

// Create certificates folder if not exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Validate request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo "Method not allowed";
    exit;
}

// Validate wallet address
if (empty($_POST['wallet']) || !preg_match('/^0x[a-fA-F0-9]{40}$/', $_POST['wallet'])) {
    http_response_code(400);
    echo "Invalid or missing wallet address";
    exit;
}
$wallet = $_POST['wallet'];

// Validate and process file upload
if (!isset($_FILES['certificate'])) {
    http_response_code(400);
    echo "No file uploaded";
    exit;
}

$file = $_FILES['certificate'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo "File upload error code: " . $file['error'];
    exit;
}

if ($file['size'] > $maxFileSize) {
    http_response_code(400);
    echo "File too large. Max size is 5MB";
    exit;
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo "Unsupported file type. Only JPG, PNG, and PDF allowed.";
    exit;
}

// Sanitize filename and create unique name
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$basename = bin2hex(random_bytes(8)); // random filename
$filename = $basename . "." . $ext;
$targetPath = $uploadDir . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    http_response_code(500);
    echo "Failed to save uploaded file.";
    exit;
}

// Save submission record (simple JSON file queue)
$pendingFile = __DIR__ . "/pending.json";
$submissions = [];

if (file_exists($pendingFile)) {
    $json = file_get_contents($pendingFile);
    $submissions = json_decode($json, true);
    if (!is_array($submissions)) {
        $submissions = [];
    }
}

// Create submission entry
$submission = [
    'id' => time() . bin2hex(random_bytes(3)),
    'wallet' => $wallet,
    'image' => "certificates/" . $filename,
    'status' => 'pending',
    'submitted_at' => date('c')
];

$submissions[] = $submission;

// Save updated submissions
file_put_contents($pendingFile, json_encode($submissions, JSON_PRETTY_PRINT));

http_response_code(200);
echo "Upload successful! Submission is pending admin approval.";
?>
