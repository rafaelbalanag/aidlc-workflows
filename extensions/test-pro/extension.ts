// extensions/test-pro/extension.ts — the "full-featured testing" bundle.
//
// Enriches the AIDLC pipeline so a generated app gets comprehensive, traceable
// test coverage: unit (branch + coverage), full functional, integration,
// regression suite, edge (off-by-one / ±min·max), and API positive+negative.
//
// Mostly §4 CONTRIBUTIONS to existing stages (nfr-requirements, nfr-design,
// build-and-test, performance-validation) + two genuinely-new stages
// (cross-unit integration in construction, full-suite execution in operation) +
// two advisory sensors (coverage-threshold, requirement-coverage) shipped with
// their tools. Reuses aidlc-quality-agent as the test lead — no new agent.
import type { ExtensionManifest } from "../../scripts/extension-types.ts";

const extension: ExtensionManifest = {
  name: "test-pro",
  version: "0.1.0",
  requiresBundle: ["core"],
  // construction 3.80–3.99 sorts after build-and-test (3.6); operation 4.40–4.49
  // is below deployment-execution (4.3)'s required-direction floor and does NOT
  // overlap ops-min's claimed 4.50–4.99.
  numberRanges: {
    construction: [["3.80", "3.99"]],
    operation: [["4.40", "4.49"]],
  },
  contributes: {
    stages: "stages/", // the 2 new stages
    overlays: "contributions/", // the 4 §4 contributions
    sensors: "sensors/", // the 2 advisory sensor manifests
    tools: "tools/", // the 2 sensor tool scripts (need contributes.tools)
  },
};

export default extension;
