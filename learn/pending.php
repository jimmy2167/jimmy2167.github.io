<?php
$conn = new mysqli("localhost", "dbuser", "dbpass", "dbname");
$result = $conn->query("SELECT * FROM submissions WHERE status = 'pending'");
$data = [];

while ($row = $result->fetch_assoc()) {
    $row['image'] = 'certificates/' . basename($row['image']);
    $data[] = $row;
}

header('Content-Type: application/json');
echo json_encode($data);
?>
