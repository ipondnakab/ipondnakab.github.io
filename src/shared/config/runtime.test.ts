import { readFileSync } from "node:fs";
import { join } from "node:path";
import semver from "semver";
import { describe, expect, it } from "vitest";

/**
 * Guards the constitution's runtime-pinning constraint: the Node floor in
 * package.json, the pin in .nvmrc and the pin in the Pages workflow must agree,
 * and the floor must be high enough for every direct dependency.
 *
 * A Node 20 runner against a dependency requiring >=22 broke the deploy once.
 * This is that failure, encoded.
 */

const root = process.cwd();
const read = (...parts: string[]) => readFileSync(join(root, ...parts), "utf8");

const pkg = JSON.parse(read("package.json")) as {
  engines?: { node?: string };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const nvmrc = read(".nvmrc").trim();

const workflowPin = (() => {
  const wf = read(".github", "workflows", "nextjs.yml");
  const m = wf.match(/^\s*node-version:\s*"?([^"\s]+)"?\s*$/m);
  return m?.[1];
})();

describe("Node runtime pinning", () => {
  it("declares a floor in package.json engines.node", () => {
    expect(pkg.engines?.node, "package.json engines.node").toBeTruthy();
    expect(semver.validRange(pkg.engines!.node!)).toBeTruthy();
  });

  it("pins the same version in .nvmrc and the Pages workflow", () => {
    expect(
      workflowPin,
      "node-version in .github/workflows/nextjs.yml",
    ).toBeTruthy();
    expect(nvmrc).toBe(workflowPin);
  });

  it("pins a version that satisfies the declared floor", () => {
    const floor = pkg.engines!.node!;
    // ".nvmrc: 24" means the 24 line, so compare as a range intersection.
    const pinned = semver.coerce(nvmrc);
    expect(pinned, `could not parse .nvmrc value "${nvmrc}"`).toBeTruthy();
    expect(
      semver.satisfies(pinned!.version, floor, { includePrerelease: false }),
      `.nvmrc ${nvmrc} does not satisfy engines.node "${floor}"`,
    ).toBe(true);
  });

  it("declares a floor every direct dependency can live with", () => {
    const floor = pkg.engines!.node!;
    // The lowest version the floor admits — if a dependency needs more than
    // this, the floor is a lie and CI can legally pick a runtime that breaks.
    const lowest = semver.minVersion(floor);
    expect(lowest, `could not resolve a minimum from "${floor}"`).toBeTruthy();

    const names = [
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ];

    const offenders: string[] = [];
    for (const name of names) {
      let range: string | undefined;
      try {
        const dep = JSON.parse(
          read("node_modules", ...name.split("/"), "package.json"),
        ) as { engines?: { node?: string } };
        range = dep.engines?.node;
      } catch {
        continue; // not installed in this environment — nothing to assert
      }
      if (!range || !semver.validRange(range)) continue;
      if (!semver.satisfies(lowest!.version, range)) {
        offenders.push(`${name} needs node ${range}`);
      }
    }

    expect(
      offenders,
      `engines.node "${floor}" admits ${lowest!.version}, which these reject`,
    ).toEqual([]);
  });
});
