<?php
header('Content-Type: application/json');

$pendingFile = __DIR__ . '/../pending.json';

if (!file_exists($pendingFile)) {
    echo json_encode([]);
    exit;
}

$submissions = json_decode(file_get_contents($pendingFile), true);
if (!is_array($submissions)) {
    echo json_encode([]);
    exit;
}

// Filter only pending submissions
$pending = array_filter($submissions, fn($s) => $s['status'] === 'pending');

echo json_encode(array_values($pending));
