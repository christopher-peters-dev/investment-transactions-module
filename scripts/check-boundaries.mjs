import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
const root = path.resolve("src");
const failures = [];
const allowed = new Set(
  ["design-system", "di", "observability", "common"].map(
    (p) => "@christopher-peters-dev/investment-platform/" + p,
  ),
);
function filesIn(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? filesIn(path.join(dir, e.name))
        : /\.tsx?$/.test(e.name)
        ? [path.join(dir, e.name)]
        : [],
    );
}
for (const file of filesIn(root)) {
  const from = path.relative(root, file).replaceAll("\\", "/");
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  const domain = from.startsWith("domain/") || from.includes("/domain/");
  const presentation =
    from.startsWith("presentation/") || from.includes("/presentation/");
  const data = from.startsWith("data/") || from.includes("/data/");
  const report = (message) => failures.push(from + ": " + message);
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const s = node.moduleSpecifier.text;
      const to = s.startsWith(".")
        ? path
            .relative(root, path.resolve(path.dirname(file), s))
            .replaceAll("\\", "/")
        : s;
      if (
        (s.startsWith("@christopher-peters-dev/investment-platform") ||
          s.startsWith("@company/investment-platform")) &&
        !allowed.has(s)
      )
        report("Unsupported platform path " + s);
      if (s.startsWith("@company/investment-transactions/"))
        report("Use the public Transactions entry");
      if (
        s.includes("InvestmentReactNativeHost") ||
        s.includes("InvestmentTransactionsModule")
      )
        report("No sibling source imports");
      if (
        domain &&
        (to === "react" ||
          to === "react-native" ||
          to.includes("/data/") ||
          to.startsWith("data/") ||
          to.includes("/presentation/") ||
          to.startsWith("presentation/") ||
          to.includes("/di/") ||
          to.startsWith("di/") ||
          s === "@christopher-peters-dev/investment-platform/di" ||
          s === "@christopher-peters-dev/investment-platform/design-system")
      )
        report("Domain points outward: " + s);
      if (
        presentation &&
        (to.includes("/data/") ||
          to.startsWith("data/") ||
          to.includes("/di/") ||
          to.startsWith("di/") ||
          s === "@christopher-peters-dev/investment-platform/di")
      )
        report("Presentation points to data/DI: " + s);
      if (data && (to.includes("/presentation/") || to.includes("/di/")))
        report("Data points outward: " + s);
      if (from.startsWith("modules/") && to.startsWith("app/"))
        report("Feature imports host implementation");
      if (
        from.startsWith("app/") &&
        s.startsWith("@modules/") &&
        s !== "@modules/manage-investments"
      )
        report("Use Manage Investments public entry");
    }
    if (presentation && ts.isCallExpression(node)) {
      if (
        ts.isIdentifier(node.expression) &&
        ["fetch", "XMLHttpRequest"].includes(node.expression.text)
      )
        report("No direct transport in UI");
      if (
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.expression.getText(source) === "console"
      )
        report("No console logging in UI");
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
if (failures.length) throw Error(failures.join("\n"));
console.log(
  "Public package and architecture boundaries passed for " +
    filesIn(root).length +
    " source files.",
);
