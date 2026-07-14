export type PromptShape =
  | "prose"
  | "code_heavy"
  | "layout_heavy"
  | "mixed";

export type RecommendationLabel =
  | "text_preferred"
  | "image_viable"
  | "caching_preferred"
  | "hybrid"
  | "context_image_preferred";

export type ProviderName = "claude" | "openai";

export type ContextRole =
  | "system"
  | "tool_result"
  | "conversation_history"
  | "user_message"
  | "auto";

export type ContentDensity = "prose" | "dense" | "auto";

export type AgentContextRecommendation =
  | "keep_text"
  | "image_context"
  | "cache_context"
  | "hybrid_context";

export interface CompareInput {
  prompt: string;
  reuseCount?: number;
  provider?: ProviderName;
  model?: string;
  imagePresets?: number[];
  contextRole?: ContextRole;
  contentDensity?: ContentDensity;
  /** Write PNG page(s) to this directory after compare */
  renderOut?: string;
  /** Override render width (px); otherwise picked from recommendation */
  renderWidth?: number;
  /** Skip writing run log (useful in tests) */
  skipLog?: boolean;
}

export interface ImageVariantResult {
  width: number;
  height: number;
  visualTokens: number;
  readability: number;
  costSavings: number;
  estimatedTextTokens: number;
  effectiveTextTokens: number;
}

export interface CacheBaseline {
  reuseCount: number;
  effectiveCostPerRequest: number;
  savingsVsFullText: number;
  discountApplied: number;
}

export interface ComparisonScores {
  cost: number;
  fidelityRisk: number;
  readability: number;
  reusability: number;
}

export interface FidelityCapacity {
  fidelityTarget: 0.98 | 0.97;
  layoutId: string;
  label: string;
  maxWords: number;
  maxChars: number;
  width: number;
  height: number;
  fontSize: number;
  charsPerLine: number;
  lines: number;
  visualTokens: number;
  textTokensEquivalent: number;
  savingsVsText: number;
  charsPerVisualToken: number;
}

export interface ContextSavingsAnalysis {
  role: ContextRole;
  density: ContentDensity;
  effectiveTextTokens: number;
  proseTokens: number;
  denseTokens: number;
  bestImageVisualTokens: number;
  tokenSavingsIfImaged: number;
  savingsPercent: number;
  pagesRequired: number;
  totalVisualTokensIfPaged: number;
  pagedSavingsPercent: number;
  fidelityCapacities: FidelityCapacity[];
  agentContextRecommendation: AgentContextRecommendation;
  contextRecommendationLabel: string;
  rationale: string[];
}

export interface RenderedPngPage {
  pageIndex: number;
  path: string;
  width: number;
  height: number;
  charStart: number;
  charEnd: number;
}

export interface RenderOutput {
  outputDir: string;
  width: number;
  pageCount: number;
  pages: RenderedPngPage[];
}

export interface CompareResult {
  runId: string;
  timestamp: string;
  inputHash: string;
  promptLength: number;
  classification: PromptShape;
  textTokens: number;
  effectiveTextTokens: number;
  contentDensity: ContentDensity;
  imageVariants: ImageVariantResult[];
  cacheBaseline?: CacheBaseline;
  contextSavings: ContextSavingsAnalysis;
  renderOutput?: RenderOutput;
  scores: ComparisonScores;
  recommendation: RecommendationLabel;
  recommendationLabel: string;
  rulesFired: string[];
  ruleVersion: string;
  rationale: string[];
  provider: ProviderName;
  model: string;
  latencyMs: number;
}

export interface RulesConfig {
  version: string;
  thresholds: {
    minTokensForCache: number;
    minReuseCountForCache: number;
    minCostSavingsForImage: number;
    minReadabilityForImage: number;
    minReadabilityForHybrid: number;
    maxFidelityRiskForImage: number;
    maxFidelityRiskForHybrid: number;
    hardFidelityGate: number;
    codeBlockRatioGate: number;
    minTokensForImage: number;
    minContextSavingsForImage?: number;
    minDenseCharsForContextImage?: number;
  };
  labels: Record<RecommendationLabel, string>;
  contextRoleLabels?: Record<AgentContextRecommendation, string>;
}

export interface ClaudeProviderConfig {
  version: string;
  provider: string;
  patchSize: number;
  resolutionTiers: {
    standard: { maxLongEdge: number; maxVisualTokens: number };
    high: { maxLongEdge: number; maxVisualTokens: number };
  };
  models: Record<
    string,
    {
      resolutionTier: "standard" | "high";
      textTokenizer: string;
    }
  >;
  cache: {
    readDiscount: number;
    writeMultiplier: number;
  };
  contextImaging?: {
    minDenseCharsForContextImage: number;
    minDenseTokensForContextImage: number;
    minContextSavingsPercent: number;
    recentTurnsKeepText: number;
  };
}

export interface ComparisonContext {
  prompt: string;
  classification: PromptShape;
  textTokens: number;
  effectiveTextTokens: number;
  contentDensity: ContentDensity;
  fidelityRisk: number;
  codeBlockRatio: number;
  imageVariants: ImageVariantResult[];
  cacheBaseline?: CacheBaseline;
  reuseCount: number;
  contextRole?: ContextRole;
  contextSavings?: ContextSavingsAnalysis;
  bestImage?: ImageVariantResult;
}

export interface RecommendationResult {
  recommendation: RecommendationLabel;
  recommendationLabel: string;
  rulesFired: string[];
  rationale: string[];
  scores: ComparisonScores;
}
