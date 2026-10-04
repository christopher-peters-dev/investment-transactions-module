import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
const root = process.cwd();
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8")
);
const version = process.argv[2] || manifest.version;
if (
  !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(
    version
  )
)
  throw Error("Use a semantic version, e.g. 1.0.1");
const output = path.resolve(
  root,
  manifest.pocArtifactDirectory || "../artifacts"
);
const filename =
  manifest.name.replace("@", "").replace("/", "-") + "-" + version + ".tgz";
if (fs.existsSync(path.join(output, filename)))
  throw Error("Artifact version exists; choose a new version");
fs.mkdirSync(output, { recursive: true });
const stage = fs.mkdtempSync(path.join(os.tmpdir(), "investment-package-"));
for (const file of manifest.files) {
  const source = path.join(root, file);
  if (fs.existsSync(source))
    fs.cpSync(source, path.join(stage, file), { recursive: true });
}
const packaged = { ...manifest, version };
delete packaged.scripts;
delete packaged.devDependencies;
delete packaged.pocArtifactDirectory;
fs.writeFileSync(
  path.join(stage, "package.json"),
  JSON.stringify(packaged, null, 2)
);
const npmCLI = process.env.npm_execpath;
if (!npmCLI) throw Error("Use npm run package:module or package:platform");
const result = spawnSync(
  process.execPath,
  [npmCLI, "pack", "--json", "--pack-destination", output],
  { cwd: stage, encoding: "utf8" }
);
if (result.status !== 0) throw Error(result.stderr || "npm pack failed");
const archive = path.join(output, filename);
const checksum = crypto
  .createHash("sha256")
  .update(fs.readFileSync(archive))
  .digest("hex");
fs.writeFileSync(archive + ".sha256", checksum + "  " + filename + "\n");
console.log(
  JSON.stringify(
    {
      artifact: archive,
      version,
      sha256: checksum,
      peerDependencies: manifest.peerDependencies,
      files: JSON.parse(result.stdout)[0].files.map((f) => f.path),
    },
    null,
    2
  )
);
// The clean staging directory is an output copy; consumers install only the archive.
