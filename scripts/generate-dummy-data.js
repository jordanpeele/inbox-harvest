import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const DUMMY_DIR = path.resolve("dummy-data");
const EXPORT_DIR = path.join(DUMMY_DIR, "facebook-export");
const INBOX_DIR = path.join(EXPORT_DIR, "your_facebook_activity", "messages", "inbox");

function encodeFB(str) {
  const bytes = new TextEncoder().encode(str);
  return Array.from(bytes).map(b => String.fromCharCode(b)).join("");
}

const conversations = [
  {
    name: "Sofia Reyes",
    folder: "SofiaReyes_abc123",
    messages: [
      { from: "fan", text: "Midnight drive is incredible!! Been on repeat all week" },
      { from: "owner", text: "Thank you so much!! Means everything" },
      { from: "fan", text: "Can I get the unreleased demos? My email is sofia.reyes92@gmail.com" },
      { from: "owner", text: "Sent! Check your inbox" },
    ],
  },
  {
    name: "James Park",
    folder: "JamesPark_def456",
    messages: [
      { from: "fan", text: "Your paper planes performance at the warehouse was insane" },
      { from: "fan", text: "Here's my email for the demos: jpark.music@outlook.com" },
    ],
  },
  {
    name: "Aïcha Koné",
    folder: "AichaKone_ghi789",
    messages: [
      { from: "fan", text: "Hey! Fellow artist here. Exit wounds really hit different" },
      { from: "owner", text: "That means so much coming from you!" },
      { from: "fan", text: "Would love to hear the unreleased stuff. Email: aicha.kone@protonmail.com" },
    ],
  },
  {
    name: "Tyler Chen",
    folder: "TylerChen_jkl012",
    messages: [
      { from: "fan", text: "Neon cathedral should have been a single honestly" },
      { from: "fan", text: "Can you send me demos? tyler.chen@yahoo.com" },
      { from: "owner", text: "Appreciate you! Sending now" },
    ],
  },
  {
    name: "Sophie O'Malley",
    folder: "SophieOMalley_mno345",
    messages: [
      { from: "fan", text: "Just discovered glass houses through a playlist and I'm obsessed" },
      { from: "fan", text: "Email for demos plsss: sophie.omalley@icloud.com" },
    ],
  },
  {
    name: "André Müller",
    folder: "AndreMuller_pqr678",
    messages: [
      { from: "fan", text: "Still water is my most played song this year no cap" },
      { from: "owner", text: "You're making my day! Want to hear some unreleased stuff?" },
      { from: "fan", text: "YES please! andre.m@gmail.com" },
    ],
  },
  {
    name: "Priya Nair",
    folder: "PriyaNair_stu901",
    messages: [
      { from: "fan", text: "The slow burn EP changed my life honestly" },
      { from: "fan", text: "priya.nair.music@gmail.com - would love the demos!" },
    ],
  },
  {
    name: "Dex Morales",
    folder: "DexMorales_vwx234",
    messages: [
      { from: "fan", text: "Yo ghost light is such a vibe. You need more recognition fr" },
      { from: "owner", text: "Working on it! Thanks for the support" },
      { from: "fan", text: "Hook me up with those demos! dex.morales@outlook.com" },
    ],
  },
  {
    name: "Émilie Lavoie",
    folder: "EmilieLavoie_yza567",
    messages: [
      { from: "fan", text: "Just saw your vid about DMing emails. Here's mine: emilie.lavoie@gmail.com" },
      { from: "fan", text: "Also rooftop static is straight fire" },
    ],
  },
  {
    name: "Marcus Webb",
    folder: "MarcusWebb_bcd890",
    messages: [
      { from: "fan", text: "Been following since the early days. Your growth is insane" },
      { from: "fan", text: "marcus.w.beats@yahoo.com for the demos please!" },
      { from: "owner", text: "OG fan!! Sending rn" },
    ],
  },
  {
    name: "Keiko Sato",
    folder: "KeikoSato_efg123",
    messages: [
      { from: "fan", text: "Your music helped me through a really tough time. Especially paper planes." },
      { from: "owner", text: "That's why I make music. Thank you for sharing that" },
      { from: "fan", text: "keiko.sato@protonmail.com would love to hear more" },
    ],
  },
  {
    name: "Roberto Vega",
    folder: "RobertoVega_hij456",
    messages: [
      { from: "fan", text: "Midnight drive on loop while studying. Perfection." },
      { from: "fan", text: "roberto.vega@gmail.com please send the demos!" },
    ],
  },
  {
    name: "Jordan Lee",
    folder: "JordanLee_klm789",
    messages: [
      { from: "fan", text: "Love your music so much!!" },
      { from: "owner", text: "Thank you!!" },
      { from: "fan", text: "When's the next show in LA?" },
    ],
  },
  {
    name: "Nina Okafor",
    folder: "NinaOkafor_nop012",
    messages: [
      { from: "fan", text: "Exit wounds is literally my anthem right now" },
      { from: "fan", text: "Would love the unreleased demos! My email is nina.okafor@icloud.com" },
      { from: "owner", text: "Sending them over now!" },
    ],
  },
  {
    name: "Sam Delgado",
    folder: "SamDelgado_tuv678",
    messages: [
      { from: "fan", text: "Neon cathedral is so good. My friend Nina is a huge fan too" },
      { from: "fan", text: "Hey my friend Nina wanted me to pass along her email too, it's nina.okafor@icloud.com" },
      { from: "fan", text: "And mine is sam.delgado99@gmail.com for the demos!" },
      { from: "owner", text: "Got it! Sending to both of you" },
    ],
  },
  {
    name: "Lena Bergström",
    folder: "LenaBergstrom_qrs345",
    messages: [
      { from: "fan", text: "Hi! I write for Indie Currents blog. Would love to do an interview about the new EP" },
      { from: "fan", text: "My editor email is lena.bergstrom@indie-currents.com" },
      { from: "owner", text: "That would be amazing! Let me check my schedule" },
    ],
  },
];

function buildMessageJson(conv, startTs) {
  const ownerName = "Alex Rivera";
  const messages = conv.messages.map((m, i) => ({
    sender_name: encodeFB(m.from === "owner" ? ownerName : conv.name),
    timestamp_ms: startTs + i * 3600000,
    content: encodeFB(m.text),
    type: "Generic",
  }));

  return {
    participants: [
      { name: encodeFB(ownerName) },
      { name: encodeFB(conv.name) },
    ],
    messages,
    title: encodeFB(conv.name),
    is_still_participant: true,
    thread_path: `inbox/${conv.folder}`,
  };
}

if (fs.existsSync(EXPORT_DIR)) {
  fs.rmSync(EXPORT_DIR, { recursive: true });
}

const baseTs = new Date("2024-06-01").getTime();

for (const conv of conversations) {
  const dir = path.join(INBOX_DIR, conv.folder);
  fs.mkdirSync(dir, { recursive: true });

  const data = buildMessageJson(conv, baseTs + Math.random() * 86400000 * 180);
  fs.writeFileSync(
    path.join(dir, "message_1.json"),
    JSON.stringify(data, null, 2)
  );
}

const zipPath = path.join(DUMMY_DIR, "test-export.zip");
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

execSync(`cd "${DUMMY_DIR}" && zip -r test-export.zip facebook-export/`);

fs.rmSync(EXPORT_DIR, { recursive: true });

console.log(`Created: ${zipPath}`);
console.log(`Contains ${conversations.length} conversations`);
console.log(`Expected: 15 unique emails, 1 merged (nina.okafor@icloud.com)`);
