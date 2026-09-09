import { cp, mkdir, rm } from "node:fs/promises";

const output = new URL("./dist/", import.meta.url);
const files = [
  "index.html",
  "styles.css",
  "script.js",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of files) {
  await cp(new URL(file, import.meta.url), new URL(file, output));
}

await cp(new URL("assets/", import.meta.url), new URL("assets/", output), {
  recursive: true,
});

console.log("Static site built in dist/");
