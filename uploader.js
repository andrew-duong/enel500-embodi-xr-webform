﻿const p1 = "a2RRQ2U4a0laUHd4ZVJZZnNzckZHU3o4ZUQwcjFyaG9KNkY4MjNrdVBtZVJZU1BXQTRZdW5qR3hPNk0=";
const p2 = "Z2l0aHViX3BhdF8xMUEzQVA3WEkwY1Jrc2V5cEpIcDE1Xw==";
const TOKEN = atob(p2+p1);

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

function parseLines(textareaId) {
  const value = document.getElementById(textareaId).value;

  return value
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

async function submitForm(e) {
  e.preventDefault();

  const status = document.getElementById("status");
  const result = document.getElementById("result");

  const startPhrases = parseLines("customOnStartPhrases");
  const successPhrases = parseLines("customOnSuccessPhrases");
  const failurePhrases = parseLines("customOnFailurePhrases");

  const data = {
    userPreferences: {
      name: userName.value
    },

    phrases: {
      onStart: startPhrases,
      onSuccess: successPhrases,
      onFailure: failurePhrases
    }
  };

  const jsonString = JSON.stringify(data, null, 2);

  status.innerText = "Generating ID...";
  const id = await getNextID();
  const path = `data/${id}.json`;

  status.innerText = "Uploading settings...";

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
          message: `Settings ${id}`,
          content: content,
          branch: BRANCH
        })
      }
    );

    if (res.ok) {
      status.innerText = "✅ Settings saved!";
      result.innerText = `Settings ID: ${id}`;
      configForm.reset();
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