import { describe, expect, it } from "vitest";

import { transformMessagesForProxy } from "../agent/transform-messages.js";

describe("transformMessagesForProxy", () => {
  it("transforms large dense tool result to images", async () => {
    const logs = JSON.stringify({
      lines: Array.from({ length: 150 }, (_, i) => `log-${i}:${"x".repeat(50)}`),
    });

    const result = await transformMessagesForProxy({
      messages: [
        { role: "system", content: "You are an agent." },
        { role: "user", content: logs },
      ],
      reuseCount: 1,
      enabled: true,
    });

    const toolBlock = result.messages[1];
    expect(toolBlock?._tokentrailImages?.length).toBeGreaterThan(0);
    expect(result.blocks[1]?.transformed).toBe(true);
  });

  it("keeps recent user message as text when disabled", async () => {
    const result = await transformMessagesForProxy({
      messages: [{ role: "user", content: "hello" }],
      enabled: false,
    });

    expect(result.messages[0]?.content).toBe("hello");
    expect(result.blocks[0]?.transformed).toBe(false);
  });
});
