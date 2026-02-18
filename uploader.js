// Token loaded from config.local.js or manual entry
let TOKEN = window.GITHUB_TOKEN || "";

if (!TOKEN) {
  TOKEN = prompt("Enter GitHub token:");
}

const OWNER = "andrew-duong";
const REPO = "enel500-embodi-xr-webform";
const BRANCH = "main";

document.getElementById("uploadBtn").onclick = upload;

async function getNextID() {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/data`
  );

  if (!res.ok) return 0;

  const files = await res.json();

  const numbers = files
    .map(f => f.name.replace(".json", ""))
    .map(n => parseInt(n))
    .filter(n => !isNaN(n));

  if (numbers.length === 0) return 0;

  return Math.max(...numbers) + 1;
}

async function upload() {
  const file = document.getElementById("fileInput").files[0];
  const status = document.getElementById("status");
  const result = document.getElementById("result");

  if (!file) {
    status.innerText = "Select a JSON file.";
    return;
  }

  status.innerText = "Generating ID...";
  const id = await getNextID();
  const path = `data/${id}.json`;

  status.innerText = `Uploading as ${id}.json...`;

  const text = await file.text();
  const content = btoa(unescape(encodeURIComponent(text)));

  try {
    const res = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `token ${TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Upload ${id}.json`,
          content: content,
          branch: BRANCH
        })
      }
    );

    if (res.ok) {
      status.innerText = "✅ Upload successful!";
      result.innerText = `File ID: ${id}`;
    } else {
      const err = await res.text();
      status.innerText = "Upload failed";
      result.innerText = err;
    }
  } catch (err) {
    status.innerText = "Error:";
    result.innerText = err;
  }
}
