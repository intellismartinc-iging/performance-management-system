import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: cookieGet }),
}));

class RedirectSignal extends Error {
  constructor(readonly to: string) {
    super(`redirect:${to}`);
  }
}
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new RedirectSignal(to);
  },
}));

const postCreateGoalTemplate = vi.fn();
const postPublishGoalTemplate = vi.fn();
vi.mock("@/features/review-templates/api/goal-template-requests", () => ({
  postCreateGoalTemplate: (...args: unknown[]) => postCreateGoalTemplate(...args),
  postPublishGoalTemplate: (...args: unknown[]) => postPublishGoalTemplate(...args),
}));

import { createGoalTemplate } from "@/features/review-templates/services/create-goal-template";

const TEMPLATE_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const BODY = {
  name: "Engineering Manager Performance Goals",
  description: "",
  positionId: 12,
  indicators: [
    {
      name: "Delivery rate",
      description: "",
      unit: "%",
      direction: "higher_is_better",
      target: 90,
      weight: 100,
      scoreTargetMet: 5,
      scoreBelowTarget: 2,
      matrixKind: "none",
      matrixTitle: null,
      scaleBound: null,
      useForScoring: false,
      scales: [],
      matrixColumns: [],
      matrixRows: [],
    },
  ],
};
const CREATED = {
  status: 200,
  data: {
    template: {
      templateId: TEMPLATE_ID,
      positionId: "12",
      companyId: "1",
      name: "Engineering Manager Performance Goals",
      description: null,
      status: "draft",
      currentVersion: 1,
      publishedBy: null,
      publishedAt: null,
      archivedAt: null,
      createdAt: "2026-11-19T08:00:00.000Z",
      updatedAt: "2026-11-19T08:00:00.000Z",
    },
    version: null,
    indicators: [],
    scales: [],
    matrixRows: [],
    matrixColumns: [],
    matrixCells: [],
  },
};

async function redirectTarget(run: Promise<unknown>) {
  try {
    await run;
  } catch (error) {
    if (error instanceof RedirectSignal) return error.to;
    throw error;
  }
  return null;
}

beforeEach(() => {
  cookieGet.mockReset().mockReturnValue({ value: "token" });
  postCreateGoalTemplate.mockReset().mockResolvedValue(CREATED);
  postPublishGoalTemplate.mockReset().mockResolvedValue({ status: 200, data: {} });
});

describe("createGoalTemplate", () => {
  it("saves a draft with the session token and returns to the list", async () => {
    const to = await redirectTarget(createGoalTemplate(BODY, "draft"));

    expect(postCreateGoalTemplate).toHaveBeenCalledWith("token", BODY);
    expect(postPublishGoalTemplate).not.toHaveBeenCalled();
    expect(to).toBe("/reviews/templates/kpi-goal-template?saved=draft");
  });

  it("publishes after it creates when the intent is publish", async () => {
    const to = await redirectTarget(createGoalTemplate(BODY, "publish"));

    expect(postPublishGoalTemplate).toHaveBeenCalledWith("token", TEMPLATE_ID);
    expect(to).toBe("/reviews/templates/kpi-goal-template?saved=published");
  });

  it("keeps the draft and flags the failure when publishing fails", async () => {
    postPublishGoalTemplate.mockResolvedValue({ status: 400, data: {} });

    const to = await redirectTarget(createGoalTemplate(BODY, "publish"));

    expect(to).toBe("/reviews/templates/kpi-goal-template?saved=publish_failed");
  });

  it("keeps the draft when the publish request throws, and creates it only once", async () => {
    postPublishGoalTemplate.mockRejectedValue(new Error("socket hang up"));

    const to = await redirectTarget(createGoalTemplate(BODY, "publish"));

    expect(to).toBe("/reviews/templates/kpi-goal-template?saved=publish_failed");
    expect(postCreateGoalTemplate).toHaveBeenCalledTimes(1);
  });

  it("checks the body again on the server and sends nothing for a bad one", async () => {
    const result = await createGoalTemplate({ ...BODY, indicators: [] }, "draft");

    expect(result.message).toMatch(/at least one indicator/i);
    expect(postCreateGoalTemplate).not.toHaveBeenCalled();
  });

  it("refuses an unknown intent", async () => {
    const result = await createGoalTemplate(BODY, "archive");

    expect(result.message).toBeTruthy();
    expect(postCreateGoalTemplate).not.toHaveBeenCalled();
  });

  it("asks the user to log in again without a session", async () => {
    cookieGet.mockReturnValue(undefined);

    const result = await createGoalTemplate(BODY, "draft");

    expect(result.message).toMatch(/log in/i);
    expect(postCreateGoalTemplate).not.toHaveBeenCalled();
  });

  it.each([
    [401, /log in/i],
    [403, /HR administrators/i],
  ])("maps status %i to a plain message", async (status, message) => {
    postCreateGoalTemplate.mockResolvedValue({ status, data: {} });

    const result = await createGoalTemplate(BODY, "draft");

    expect(result.message).toMatch(message);
  });

  it("shows the API message for a 403 that is not about the role", async () => {
    postCreateGoalTemplate.mockResolvedValue({
      status: 403,
      data: {
        success: false,
        error: {
          code: "(403) FORBIDDEN",
          message: "No company is linked to your account.",
          details: [],
          correlationId: "req-2",
        },
      },
    });

    const result = await createGoalTemplate(BODY, "draft");

    expect(result.message).toBe("No company is linked to your account.");
  });

  it("shows the API message for a rejected body", async () => {
    postCreateGoalTemplate.mockResolvedValue({
      status: 400,
      data: {
        success: false,
        error: {
          code: "(400) VALIDATION_ERROR",
          message: "The position does not belong to your company.",
          details: [],
          correlationId: "req-1",
        },
      },
    });

    const result = await createGoalTemplate(BODY, "draft");

    expect(result.message).toBe("The position does not belong to your company.");
  });

  it("returns a generic message when the request throws", async () => {
    postCreateGoalTemplate.mockRejectedValue(new Error("connect ECONNREFUSED 10.0.0.5"));

    const result = await createGoalTemplate(BODY, "draft");

    expect(result.message).not.toContain("10.0.0.5");
  });
});
