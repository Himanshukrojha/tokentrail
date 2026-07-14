export interface AgentMessage {
  role: "system" | "user" | "assistant" | string;
  content: string;
  _tokentrailImages?: AnthropicImageBlock[];
}

export interface AnthropicImageBlock {
  type: "image";
  source: {
    type: "base64";
    media_type: "image/png";
    data: string;
  };
}

export interface AnthropicTextBlock {
  type: "text";
  text: string;
}

export type AnthropicContentBlock = AnthropicTextBlock | AnthropicImageBlock;

export type AgentBlockAction = "keep_text" | "cache" | "image" | "hybrid";

export interface AgentBlockAnalysis {
  index: number;
  role: string;
  contextRole: string;
  charCount: number;
  effectiveTextTokens: number;
  recommendation: string;
  agentContextRecommendation: string;
  action: AgentBlockAction;
  rulesFired: string[];
  rationale: string[];
  projectedTokens: number;
}

export interface AgentOptimizationPlan {
  blockCount: number;
  messages: AgentBlockAnalysis[];
  totals: {
    originalEffectiveTokens: number;
    projectedEffectiveTokens: number;
    estimatedSavingsPercent: number;
  };
}

export interface AnalyzeAgentRequestInput {
  messages: AgentMessage[];
  reuseCount?: number;
  model?: string;
  provider?: "claude";
  recentTurnsKeepText?: number;
  skipLog?: boolean;
}
