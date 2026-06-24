// t158-test-pro-bundle: the test-pro full-featured-testing bundle (the large
// extension; the forcing function for bundle-partitioned test rosters).
//
// covers: file:extensions/test-pro/extension.ts
//
// WHAT. test-pro is the first large bundle: 4 §4 contributions
// (nfr-requirements, nfr-design, build-and-test, performance-validation), 2 new
// stages (cross-unit integration in construction, full-suite execution in
// operation), and 2 advisory sensors shipped WITH their tools via the new
// contributes.tools channel. This test asserts the delta is correct, the base is
// untouched, and the sensor tools actually run.
import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const PACKAGE_TS = join(REPO_ROOT, "scripts", "package.ts");
const DELTA = join(REPO_ROOT, "dist", "claude", "extensions", "test-pro", ".claude");
const DELTA_GRAPH = join(DELTA, "tools", "data", "stage-graph.json");
const BASE_GRAPH = join(REPO_ROOT, "dist", "claude", ".claude", "tools", "data", "stage-graph.json");
const COV_TOOL = join(DELTA, "tools", "aidlc-sensor-coverage-threshold.ts");
const REQ_TOOL = join(DELTA, "tools", "aidlc-sensor-requirement-coverage.ts");

type Node = {
  slug: string;
  number?: string;
  bundle?: string;
  produces?: string[];
  sensors?: string[];
  requires_stage?: string[];
};

describe("t158 test-pro bundle", () => {
  test("validate-ext test-pro is clean", () => {
    const r = spawnSync("bun", [PACKAGE_TS, "--validate-ext", "test-pro"], {
      cwd: REPO_ROOT,
      encoding: "utf-8",
      timeout: 30_000,
    });
    expect(r.status).toBe(0);
  });

  test("the two new stages are in the delta graph with valid edges", () => {
    const g = JSON.parse(readFileSync(DELTA_GRAPH, "utf-8")) as Node[];
    const integ = g.find((s) => s.slug === "test-pro-integration")!;
    const suite = g.find((s) => s.slug === "test-pro-full-suite")!;
    expect(integ.bundle).toBe("test-pro");
    expect(integ.number).toBe("3.85");
    expect(integ.requires_stage).toContain("build-and-test"); // 3.85 > 3.6
    expect(suite.number).toBe("4.45");
    expect(suite.requires_stage).toEqual(
      expect.arrayContaining(["deployment-execution", "test-pro-integration"]),
    );
  });

  test("build-and-test is enriched in the delta (produces + sensors unioned)", () => {
    const g = JSON.parse(readFileSync(DELTA_GRAPH, "utf-8")) as Node[];
    const n = g.find((s) => s.slug === "build-and-test")!;
    expect(n.produces).toContain("test-pro-regression-suite");
    expect(n.produces).toContain("test-pro-coverage-summary");
    expect(n.produces).toContain("build-instructions"); // core produces still present (union)
    expect(n.sensors).toEqual(expect.arrayContaining(["coverage-threshold", "requirement-coverage"]));
  });

  test("BASE graph is untouched (byte-clean guardrail)", () => {
    const g = JSON.parse(readFileSync(BASE_GRAPH, "utf-8")) as Node[];
    expect(g.some((s) => s.bundle === "test-pro")).toBe(false);
    const bt = g.find((s) => s.slug === "build-and-test")!;
    expect((bt.produces ?? []).some((p) => p.startsWith("test-pro-"))).toBe(false);
    expect(bt.sensors ?? []).not.toContain("coverage-threshold");
  });

  test("the bundle ships runnable sensor tools (contributes.tools)", () => {
    expect(existsSync(COV_TOOL)).toBe(true);
    expect(existsSync(REQ_TOOL)).toBe(true);
    const tmp = mkdtempSync(join(tmpdir(), "t158-"));
    try {
      const cov = join(tmp, "cov.json");
      writeFileSync(cov, '{"line_pct":60,"branch_pct":50,"targets":{"line":80,"branch":70}}');
      const r1 = spawnSync("bun", [COV_TOOL, "--stage", "build-and-test", "--output-path", cov], { encoding: "utf-8" });
      expect(JSON.parse(r1.stdout).pass).toBe(false);
      expect(JSON.parse(r1.stdout).findings_count).toBe(2);

      const req = join(tmp, "req.json");
      writeFileSync(req, '{"requirements":{"R1":{"covered":true},"R2":{"covered":false}}}');
      const r2 = spawnSync("bun", [REQ_TOOL, "--stage", "build-and-test", "--output-path", req], { encoding: "utf-8" });
      expect(JSON.parse(r2.stdout).pass).toBe(false);
      expect(JSON.parse(r2.stdout).uncovered_requirements).toEqual(["R2"]);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  test("package.ts --check is clean (base parity + both bundle deltas byte-pinned)", () => {
    const r = spawnSync("bun", [PACKAGE_TS, "--check"], {
      cwd: REPO_ROOT,
      encoding: "utf-8",
      timeout: 90_000,
    });
    expect(r.status).toBe(0);
  });
});
