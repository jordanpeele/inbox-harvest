// Load JSZip from CDN
let JSZipPromise = null;

function loadJSZip() {
  if (JSZipPromise) return JSZipPromise;
  JSZipPromise = new Promise((resolve, reject) => {
    if (window.JSZip) {
      resolve(window.JSZip);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    script.onload = () => resolve(window.JSZip);
    script.onerror = () => reject(new Error("Failed to load JSZip"));
    document.head.appendChild(script);
  });
  return JSZipPromise;
}

function isMessageFile(path) {
  return /messages\/inbox\/[^/]+\/message_\d+\.json$/i.test(path);
}

export async function extractFilesFromZip(file, onProgress) {
  const JSZip = await loadJSZip();
  const zip = await JSZip.loadAsync(file);
  const files = [];
  const entries = Object.keys(zip.files).filter(
    (p) => !zip.files[p].dir && isMessageFile(p)
  );

  for (let i = 0; i < entries.length; i++) {
    const path = entries[i];
    const content = await zip.files[path].async("string");
    files.push({ path, content });
    if (onProgress && (i % 5 === 0 || i === entries.length - 1)) {
      onProgress({ phase: "extracting", current: i + 1, total: entries.length });
    }
  }

  return files;
}

export function extractFilesFromFileList(fileList) {
  const files = [];
  for (const file of fileList) {
    const path = file.webkitRelativePath || file.name;
    if (isMessageFile(path) || file.name.match(/^message_\d+\.json$/)) {
      files.push(
        file.text().then((content) => ({ path, content }))
      );
    }
  }
  return Promise.all(files);
}

export async function readJsonFiles(fileList, onProgress) {
  const files = [];
  const items = [...fileList];
  for (let i = 0; i < items.length; i++) {
    const file = items[i];
    if (file.name.endsWith(".json")) {
      const content = await file.text();
      files.push({ path: file.name, content });
    }
    if (onProgress && (i % 5 === 0 || i === items.length - 1)) {
      onProgress({ phase: "reading", current: i + 1, total: items.length });
    }
  }
  return files;
}
