// Web Worker for parsing Facebook export data

function decodeFBString(s) {
  if (!s) return s;
  try {
    return decodeURIComponent(
      s.split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
  } catch {
    return s;
  }
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

function extractEmails(content) {
  if (!content) return [];
  const matches = content.match(EMAIL_REGEX);
  return matches ? [...new Set(matches.map(e => e.toLowerCase()))] : [];
}

function getSnippet(content, email) {
  if (!content) return "";
  const idx = content.toLowerCase().indexOf(email.toLowerCase());
  if (idx === -1) return content.slice(0, 60);
  const start = Math.max(0, idx - 30);
  const end = Math.min(content.length, idx + email.length + 30);
  let snippet = content.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < content.length) snippet = snippet + "...";
  return snippet;
}

function isMessageFile(path) {
  return /messages\/inbox\/[^/]+\/message_\d+\.json$/i.test(path);
}

function parseMessageFile(json, ownerName) {
  const contacts = [];
  const title = decodeFBString(json.title || "Unknown");

  if (!json.messages || !Array.isArray(json.messages)) return contacts;

  for (const msg of json.messages) {
    const senderName = decodeFBString(msg.sender_name || "");
    if (ownerName && senderName.toLowerCase() === ownerName.toLowerCase()) continue;

    const content = decodeFBString(msg.content || "");
    const emails = extractEmails(content);

    for (const email of emails) {
      contacts.push({
        name: senderName,
        email,
        snippet: getSnippet(content, email),
        timestamp: msg.timestamp_ms || Date.now(),
        date: new Date(msg.timestamp_ms || Date.now()).toISOString(),
        conversation: title,
        source: "facebook",
      });
    }
  }

  return contacts;
}

async function processFiles(files, ownerName) {
  const allContacts = [];
  let conversationsScanned = 0;
  let totalFound = 0;
  const conversationSet = new Set();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const json = JSON.parse(file.content);
      const contacts = parseMessageFile(json, ownerName);
      totalFound += contacts.length;
      allContacts.push(...contacts);

      const threadPath = json.thread_path || file.path;
      if (!conversationSet.has(threadPath)) {
        conversationSet.add(threadPath);
        conversationsScanned++;
      }
    } catch {
      // Skip malformed JSON
    }

    if (i % 10 === 0 || i === files.length - 1) {
      self.postMessage({
        type: "progress",
        phase: "parsing",
        current: i + 1,
        total: files.length,
      });
    }
  }

  // Deduplicate by email - keep earliest, track conversations per email
  self.postMessage({ type: "progress", phase: "deduplicating", current: 0, total: 1 });

  const emailMap = new Map();       // email -> contact (earliest)
  const emailConvos = new Map();    // email -> Set of conversation names

  for (const contact of allContacts) {
    // Track all conversations this email appeared in
    if (!emailConvos.has(contact.email)) {
      emailConvos.set(contact.email, new Set());
    }
    emailConvos.get(contact.email).add(contact.conversation);

    const existing = emailMap.get(contact.email);
    if (!existing || contact.timestamp < existing.timestamp) {
      emailMap.set(contact.email, contact);
    }
  }

  // merged = true only when the email appeared in 2+ different conversations
  const deduplicated = [...emailMap.values()].map((c, i) => ({
    ...c,
    merged: emailConvos.get(c.email).size > 1,
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${i}`,
    importedAt: new Date().toISOString(),
  }));

  const duplicatesMerged = deduplicated.filter(c => c.merged).length;

  self.postMessage({
    type: "result",
    contacts: deduplicated,
    stats: {
      conversationsScanned,
      uniqueEmails: deduplicated.length,
      totalFound,
      duplicatesMerged,
    },
  });
}

self.onmessage = async (e) => {
  const { files, ownerName } = e.data;
  await processFiles(files, ownerName);
};
