import { dirname, resolve } from "path";
import { existsSync, readFileSync } from "fs";

let parsedDotEnv: Record<string, string> | null = null;

function isUsableValue(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  return !(
    lower === "undefined" ||
    lower === "null" ||
    lower.includes("cole_aqui") ||
    lower.includes("coloque_aqui") ||
    lower.includes("seu_token") ||
    lower.includes("your_token")
  );
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function loadDotEnv(): Record<string, string> {
  if (parsedDotEnv) return parsedDotEnv;

  parsedDotEnv = {};
  const cwd = process.cwd();
  const pwd = process.env.PWD;
  const argvDir = process.argv?.[1] ? dirname(process.argv[1]) : "";
  const candidates = [
    resolve(cwd, ".env"),
    ...(pwd ? [resolve(pwd, ".env")] : []),
    ...(argvDir
      ? [
          resolve(argvDir, ".env"),
          resolve(argvDir, "..", ".env"),
          resolve(argvDir, "..", "..", ".env"),
        ]
      : []),
  ];

  const envPath = candidates.find((path, index) => candidates.indexOf(path) === index && existsSync(path));
  if (!envPath) return parsedDotEnv;

  try {
    const content = readFileSync(envPath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const assignment = line.startsWith("export ") ? line.slice(7).trim() : line;
      const eq = assignment.indexOf("=");
      if (eq <= 0) continue;
      const key = assignment.slice(0, eq).trim();
      const value = unquote(assignment.slice(eq + 1));
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
        parsedDotEnv[key] = value;
      }
    }
  } catch (error) {
    console.error("[env] failed to read .env", error);
  }

  return parsedDotEnv;
}

export function getServerEnv(name: string, fallbackNames: string[] = []): string | undefined {
  const names = [name, ...fallbackNames];

  for (const key of names) {
    const value = process.env[key];
    if (isUsableValue(value)) return value.trim();
  }

  const dotenv = loadDotEnv();
  for (const key of names) {
    const value = dotenv[key];
    if (isUsableValue(value)) {
      process.env[key] = value.trim();
      if (!process.env[name]) process.env[name] = value.trim();
      return value.trim();
    }
  }

  return undefined;
}
