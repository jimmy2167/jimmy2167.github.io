async function loadSubmissions() {
  const res = await fetch("pending.php");
  const data = await res.json();
  const container = document.getElementById("submissions");
  container.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <p><strong>Wallet:</strong> ${item.wallet}</p>
      <p><strong>Uploaded:</strong> <a href="${item.image}" target="_blank">View File</a></p>
      <button onclick="approve('${item.wallet}', ${item.id})">Approve & Send Token</button>
    `;
    container.appendChild(div);
  });
}

async function approve(wallet, id) {
  const form = new FormData();
  form.append("wallet", wallet);
  form.append("id", id);

  const res = await fetch("approve.php", {
    method: "POST",
    body: form
  });

  const txt = await res.text();
  alert(txt);
  loadSubmissions(); // refresh list
}

loadSubmissions();
