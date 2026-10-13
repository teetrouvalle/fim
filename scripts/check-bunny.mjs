// Read-only, build-time Bunny Stream credentials verification.
// No video content is fetched, played, uploaded, or published.
// Enabled only if FIM_CHECK_BUNNY_AT_BUILD=1 on a trusted build worker.
if (process.env.FIM_CHECK_BUNNY_AT_BUILD !== "1") {
  console.log("Bunny connectivity verification skipped.");
  process.exit(0);
}
const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
const apiKey = process.env.BUNNY_STREAM_API_KEY;
const hostname = process.env.BUNNY_STREAM_CDN_HOSTNAME;
if (!libraryId || !/^\d+$/.test(libraryId) || !apiKey || !hostname || !/^[-a-zA-Z0-9.]+\.b-cdn\.net$/.test(hostname)) {
  console.error("Bunny configuration incomplete or invalid (no secret values shown).");
  process.exit(1);
}
try {
  const url = `https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=1`;
  const response = await fetch(url, {
    method: "GET",
    headers: { AccessKey: apiKey, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    console.error(`Bunny authenticated read failed (HTTP ${response.status}). No credentials printed.`);
    process.exit(1);
  }
  console.log("Bunny Stream library authenticated successfully (read-only). No videos were exposed.");
} catch {
  console.error("Bunny authenticated read did not complete. No credentials printed.");
  process.exit(1);
}
