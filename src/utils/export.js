import Papa from "papaparse";

export function exportCSV(contacts) {
  const data = contacts.map((c) => ({
    Name: c.name,
    Email: c.email,
    Date: new Date(c.timestamp).toLocaleDateString(),
    Conversation: c.conversation,
    Snippet: c.snippet,
    Source: c.source,
  }));

  const csv = Papa.unparse(data);
  downloadFile(csv, "inbox-harvest-emails.csv", "text/csv");
}

export function exportJSON(contacts) {
  const json = JSON.stringify(contacts, null, 2);
  downloadFile(json, "inbox-harvest-emails.json", "application/json");
}

export function copyEmails(contacts) {
  const emails = contacts.map((c) => c.email).join(", ");
  navigator.clipboard.writeText(emails);
  return emails.split(", ").length;
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
