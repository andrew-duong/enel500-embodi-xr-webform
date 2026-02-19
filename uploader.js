let TOKEN = window.GITHUB_TOKEN || "";

if (!TOKEN) {
  TOKEN = prompt("Enter GitHub token:");
}

const OWNER = "andrew-duong";
const REPO = "enel500-embodi-xr-webform";
const BRANCH = "main";

document.getElementById("configForm").onsubmit = submitForm;

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

async function submitForm(e) {
  e.preventDefault();

  const status = document.getElementById("status");
  const result = document.getElementById("result");

  // build JSON from form
  const data = {
    name: document.getElementById("name").value,
    speed: parseInt(document.getElementById("speed").value),
    difficulty: document.getElementById("difficulty").value,
    enableSound: document.getElementById("enableSound").checked
  };

  const jsonString = JSON.stringify(data, null, 2);

  status.innerText = "Generating ID...";
  const id = await getNextID();
  const path = `data/${id}.json`;

  status.innerText = "Uploading...";

  const content = btoa(unescape(encodeURIComponent(jsonString)));

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
          message: `Create config ${id}`,
          content: content,
          branch: BRANCH
        })
      }
    );

    if (res.ok) {
      status.innerText = "✅ Submitted!";
      result.innerText = `Your ID: ${id}`;
      document.getElementById("configForm").reset();
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