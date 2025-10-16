import { cpSync, existsSync, mkdirSync, rmSync, statSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const filePath = fileURLToPath(import.meta.url);
const currentDir = dirname(filePath);
const projectRoot = resolve(currentDir, "..");
const distDir = resolve(projectRoot, "dist");
const assets = ["index.html", "styles.css", "script.js", "animation", "assets", "images"];

const ensureEmptyDir = (directory) => {
  if (existsSync(directory)) {
    rmSync(directory, { recursive: true, force: true });
  }
  mkdirSync(directory, { recursive: true });
};

ensureEmptyDir(distDir);

assets.forEach((entry) => {
  const source = resolve(projectRoot, entry);
  if (!existsSync(source)) {
    return;
  }
  const target = resolve(distDir, entry);
  const stats = statSync(source);
  if (stats.isDirectory()) {
    cpSync(source, target, { recursive: true });
  } else if (stats.isFile()) {
    cpSync(source, target);
  }
});

console.log(`Prepared static output in ${distDir}`);
