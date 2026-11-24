import { createApiError } from "@pms/shared-types";
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

const postUpdateBehavioralTemplate = vi.fn();
const postPublishBehavioralTemplate = vi.fn();
const postBehavioralTemplateVersion = vi.fn();
vi.mock("@/features/review-templates/api/behavioral-template-requests", () => ({
  postUpdateBehavioralTemplate: (...args: unknown[]) => postUpdateBehavioralTemplate(...args),
  postPublishBehavioralTemplate: (...args: unknown[]) => postPublishBehavioralTemplate(...args),
  postBehavioralTemplateVersion: (...args: unknown[]) => postBehavioralTemplateVersion(...args),
}));

import {
  publishBehavioralTemplate,
  saveBehavioralTemplateEdits,
} from "@/features/review-templates/services/manage-behavioral-template";

const TEMPLATE_ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";
const LIST = "/reviews/templates/behavioral-assessment-template";
const BODY = {
  name: "Quarterly Performance Review",
  description: "",
  category: "general_performance",
  reviewType: "hr",
  sections: [
    {
      title: "Job Performance",
      questions: [{ prompt: "Meets deadlines?", questionType: "rating_scale", isRequired: true, allowNotObserved: false }],
    },
  ],
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
  postUpdateBehavioralTemplate.mockReset().mockResolvedValue({ status: 200, data: {} });
  postPublishBehavioralTemplate.mockReset().mockResolvedValue({ status: 200, data: {} });
  postBehavioralTemplateVersion.mockReset().mockResolvedValue({ status: 200, data: {} });
});

describe("saveBehavioralTemplateEdits", () => {
  it("saves a draft with the session token and returns to the list", async () => {
    const to = await redirectTarget(saveBehavioralTemplateEdits(TEMPLATE_ID, BODY, "draft"));

    expect(postUpdateBehavioralTemplate).toHaveBeenCalledWith("token", TEMPLATE_ID, BODY);
    expect(postPublishBehavioralTemplate).not.toHaveBeenCalled();
    expect(to).toBe(`${LIST}?saved=draft`);
  });

  it("publishes after it saves when the intent is publish", async () => {
    const to = await redirectTarget(saveBehavioralTemplateEdits(TEMPLATE_ID, BODY, "publish"));

    expect(postPublishBehavioralTemplate).toHaveBeenCalledWith("token", TEMPLATE_ID);
    expect(to).toBe(`${LIST}?saved=published`);
  });

  it("says the edits are saved when only the publish step fails", async () => {
    postPublishBehavioralTemplate.mockResolvedValue({ status: 409, data: {} });

    expect(await redirectTarget(saveBehavioralTemplateEdits(TEMPLATE_ID, BODY, "publish"))).toBe(`${LIST}?saved=publish_failed`);
  });

  it("stops at the edits and does not publish when saving them fails", async () => {
    postUpdateBehavioralTemplate.mockResolvedValue({ status: 409, data: { message: "Only draft templates can be updated." } });

    const result = await saveBehavioralTemplateEdits(TEMPLATE_ID, BODY, "publish");

    expect(result.message).toBeTruthy();
    expect(postPublishBehavioralTemplate).not.toHaveBeenCalled();
  });

  it.each([
    ["an id that is not a uuid", ["not-a-uuid", BODY, "draft"] as const],
    ["an unknown intent", [TEMPLATE_ID, BODY, "archive"] as const],
    ["a body the shared schema rejects", [TEMPLATE_ID, { ...BODY, sections: [] }, "draft"] as const],
  ])("refuses %s, with no request", async (_label, [id, body, intent]) => {
    const result = await saveBehavioralTemplateEdits(id, body, intent);

    expect(result.message).toBeTruthy();
    expect(postUpdateBehavioralTemplate).not.toHaveBeenCalled();
  });

  it("publishes the next version of a published template with the update intent, and returns to the list", async () => {
    const to = await redirectTarget(saveBehavioralTemplateEdits(TEMPLATE_ID, BODY, "update"));

    expect(postBehavioralTemplateVersion).toHaveBeenCalledWith("token", TEMPLATE_ID, BODY);
    expect(postUpdateBehavioralTemplate).not.toHaveBeenCalled();
    expect(postPublishBehavioralTemplate).not.toHaveBeenCalled();
    expect(to).toBe(`${LIST}?saved=updated`);
  });

  it("returns the message of the API when the new version is refused, and does not redirect", async () => {
    postBehavioralTemplateVersion.mockResolvedValue({
      status: 409,
      data: createApiError({ status: 409, message: "Only a published template gets a new version.", correlationId: "c" }),
    });

    const result = await saveBehavioralTemplateEdits(TEMPLATE_ID, BODY, "update");

    expect(result.message).toBe("Only a published template gets a new version.");
  });

  it("asks the user to log in again without a session cookie, with no request", async () => {
    cookieGet.mockReturnValue(undefined);

    expect((await saveBehavioralTemplateEdits(TEMPLATE_ID, BODY, "draft")).message).toMatch(/log in/i);
    expect(postUpdateBehavioralTemplate).not.toHaveBeenCalled();
  });

  it("keeps a thrown request error out of the message", async () => {
    postUpdateBehavioralTemplate.mockRejectedValue(new Error("connect ECONNREFUSED 10.0.0.5"));

    expect((await saveBehavioralTemplateEdits(TEMPLATE_ID, BODY, "draft")).message).not.toContain("ECONNREFUSED");
  });
});

describe("publishBehavioralTemplate", () => {
  it("publishes a saved draft and returns to the list", async () => {
    const to = await redirectTarget(publishBehavioralTemplate(TEMPLATE_ID));

    expect(postPublishBehavioralTemplate).toHaveBeenCalledWith("token", TEMPLATE_ID);
    expect(to).toBe(`${LIST}?saved=published`);
  });

  it("returns the message of the API when it refuses, and does not redirect", async () => {
    postPublishBehavioralTemplate.mockResolvedValue({ status: 409, data: { message: "The template is already published." } });

    const result = await publishBehavioralTemplate(TEMPLATE_ID);

    expect(result.message).toBeTruthy();
  });

  it("refuses an id that is not a uuid, with no request", async () => {
    expect((await publishBehavioralTemplate("not-a-uuid")).message).toBeTruthy();
    expect(postPublishBehavioralTemplate).not.toHaveBeenCalled();
  });
});
