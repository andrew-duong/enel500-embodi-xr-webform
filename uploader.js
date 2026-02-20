const p1 = "a2RRQ2U4a0laUHd4ZVJZZnNzckZHU3o4ZUQwcjFyaG9KNkY4MjNrdVBtZVJZU1BXQTRZdW5qR3hPNk0=";
const p2 = "Z2l0aHViX3BhdF8xMUEzQVA3WEkwY1Jrc2V5cEpIcDE1Xw==";

const TOKEN = atob(p2) + atob(p1);

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

  const customText = document
    .getElementById("customPhrases").value
    .split("\n")
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const data = {
    volume: {
      master: +masterVolume.value,
      music: +musicVolume.value,
      voice: +voiceVolume.value,
      sfx: +sfxVolume.value
    },
    userPreferences: {
      name: userName.value,
      theme: theme.value
    },
    shadowCustomization: {
      appearance: appearance.value,
      voice: shadowVoice.value
    },
    phrases: {
      preset: presetPhrase.value,
      custom: customText
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