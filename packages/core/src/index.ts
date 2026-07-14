export { comparePrompt } from "./compare-prompt.js";
export { classifyPrompt } from "./classify/index.js";
export { ingestPrompt } from "./ingest/index.js";
export { applyRecommendationRules } from "./recommend/index.js";
export { findProjectRoot, loadRulesConfig, getDefaultHomeDir, resetProjectRootCache } from "./config/load.js";
export {
  detectContentDensity,
  analyzeContextSavings,
  detectContextRole,
  estimateFidelityCapacities,
  estimateVisualTokens,
} from "./estimate/index.js";
export {
  renderPromptToPng,
  renderFromRecommendation,
  renderImageVariants,
  estimatePageCount,
  layoutPromptPages,
  renderPromptToBuffers,
  resolveRenderLayout,
} from "./render/index.js";
export { runBenchmark, loadBenchmarkEntries } from "./benchmark/index.js";
export { resolveInputPath } from "./paths/resolve.js";
export { analyzeAgentRequest, transformMessagesForProxy, logProxyTransform } from "./agent/index.js";
export type {
  CompareInput,
  CompareResult,
  RecommendationLabel,
  PromptShape,
  ImageVariantResult,
  CacheBaseline,
  ContextRole,
  ContentDensity,
  ContextSavingsAnalysis,
  FidelityCapacity,
  AgentContextRecommendation,
  RenderOutput,
  RenderedPngPage,
} from "./types.js";
export type {
  RenderPngOptions,
  RenderPngResult,
} from "./render/index.js";
export type {
  BenchmarkReport,
  BenchmarkCaseResult,
  BenchmarkEntry,
} from "./benchmark/index.js";
export type {
  AgentMessage,
  AgentBlockAnalysis,
  AgentOptimizationPlan,
  AnalyzeAgentRequestInput,
  AgentBlockAction,
  AnthropicImageBlock,
  AnthropicTextBlock,
  AnthropicContentBlock,
  TransformMessagesResult,
  TransformBlockResult,
} from "./agent/index.js";
