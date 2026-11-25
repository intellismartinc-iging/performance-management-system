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

const postCreateBehavioralTemplate = vi.fn();
const postPublishBehavioralTemplate = vi.fn();
vi.mock("@/features/review-templates/api/behavioral-template-requests", () => ({
  postCreateBehavioralTemplate: (...args: unknown[]) => postCreateBehavioralTemplate(...args),
  postPublishBehavioralTemplate: (...args: unknown[]) => postPublishBehavioralTemplate(...args),
}));

import { createBehavioralTemplate } from "@/features/review-templates/services/save-behavioral-template";

const TEMPLATE_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const BODY = {
  name: "Quarterly Performance Review",
  description: "",
  category: "general_performance",
  reviewType: "self",
  sections: [
    {
      title: "Leadership",
      questions: [{ prompt: "Meets deadlines?", questionType: "rating_scale", isRequired: true, allowNotObserved: false }],
    },
  ],
};
const TREE = {
  template: {
    templateId: TEMPLATE_ID,
    company: "Mayon Consolidated Inc.",
    name: "Quarterly Performance Review",
    description: null,
    category: "general_performance",
    reviewType: "self",
    status: "draft",
    currentVersion: 1,
    publishedBy: null,
    publishedAt: null,
    archivedAt: null,
    createdAt: "2026-11-24T06:00:00.000Z",
    updatedAt: "2026-11-24T06:00:00.000Z",
  },
  version: null,
  sections: [],
  questions: [],
  options: [],
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
  postCreateBehavioralTemplate.mockReset().mockResolvedValue({ status: 200, data: TREE });
  postPublishBehavioralTemplate.mockReset().mockResolvedValue({ status: 200, data: TREE });
});

describe("createBehavioralTemplate", () => {
  it("saves a draft with the session token and returns to the list", async () => {
    const to = await redirectTarget(createBehavioralTemplate(BODY, "draft"));

    expect(postCreateBehavioralTemplate).toHaveBeenCalledWith("token", BODY);
    expect(postPublishBehavioralTemplate).not.toHaveBeenCalled();
    expect(to).toBe("/reviews/templates/behavioral-assessment-template?saved=draft");
  });

  it("publishes after it creates when the intent is publish", async () => {
    const to = await redirectTarget(createBehavioralTemplate(BODY, "publish"));

    expect(postPublishBehavioralTemplate).toHaveBeenCalledWith("token", TEMPLATE_ID);
    expect(to).toBe("/reviews/templates/behavioral-assessment-template?saved=published");
  });

  it("tells the user the draft was saved when only the publish step fails", async () => {
    postPublishBehavioralTemplate.mockResolvedValue({ status: 409, data: {} });

    const to = await redirectTarget(createBehavioralTemplate(BODY, "publish"));

    expect(to).toBe("/reviews/templates/behavioral-assessment-template?saved=publish_failed");
  });

  it("refuses a body the shared schema rejects, before any request", async () => {
    const result = await createBehavioralTemplate({ sections: [] }, "draft");

    expect(result.message).toBeTruthy();
    expect(postCreateBehavioralTemplate).not.toHaveBeenCalled();
  });

  it("refuses an unknown intent, before any request", async () => {
    const result = await createBehavioralTemplate(BODY, "archive");

    expect(result.message).toBeTruthy();
    expect(postCreateBehavioralTemplate).not.toHaveBeenCalled();
  });

  it("asks the user to log in again without a session cookie, with no request", async () => {
    cookieGet.mockReturnValue(undefined);

    const result = await createBehavioralTemplate(BODY, "draft");

    expect(result.message).toMatch(/log in/i);
    expect(postCreateBehavioralTemplate).not.toHaveBeenCalled();
  });

  it.each([
    [401, /log in/i],
    [403, /HR administrators/i],
  ])("answers a %s with a message and no redirect", async (status, message) => {
    postCreateBehavioralTemplate.mockResolvedValue({ status, data: {} });

    const result = await createBehavioralTemplate(BODY, "draft");

    expect(result.message).toMatch(message);
  });

  it("keeps a thrown request error out of the message", async () => {
    postCreateBehavioralTemplate.mockRejectedValue(new Error("connect ECONNREFUSED 10.0.0.5"));

    const result = await createBehavioralTemplate(BODY, "draft");

    expect(result.message).not.toContain("ECONNREFUSED");
  });
});
