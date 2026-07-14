#!/usr/bin/env node
import { runBenchmark } from "@tokentrail/core";

const report = await runBenchmark();

console.log("TokenTrail Benchmark Report");
console.log("===========================");
console.log(`Agreement: ${report.agreed}/${report.total} (${report.agreementPercent}%)`);
console.log("");

console.log("By category:");
for (const [category, stats] of Object.entries(report.byCategory)) {
  const pct = Math.round((stats.agreed / stats.total) * 100);
  console.log(`  • ${category}: ${stats.agreed}/${stats.total} (${pct}%)`);
}

console.log("");
console.log("Cases:");
for (const row of report.results) {
  const mark = row.agreed ? "✓" : "✗";
  console.log(
    `  ${mark} ${row.id} [${row.category}] human=${row.humanLabel} engine=${row.engineLabel} rules=${row.rulesFired.join(",")}`,
  );
}

if (report.agreementPercent < 70) {
  process.exitCode = 1;
}
