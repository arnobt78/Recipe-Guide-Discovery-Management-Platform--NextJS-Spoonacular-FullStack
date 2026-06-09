/**
 * TC-0020 — assert single batched user count query (not 5× prisma.user.count).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const queryRawMock = vi.fn();
const userCountMock = vi.fn();

const modelStub = () => ({
  count: vi.fn().mockResolvedValue(0),
  groupBy: vi.fn().mockResolvedValue([]),
  findMany: vi.fn().mockResolvedValue([]),
});

vi.mock("../prisma", () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => queryRawMock(...args),
    favouriteRecipes: modelStub(),
    recipeCollection: modelStub(),
    collectionItem: modelStub(),
    mealPlan: modelStub(),
    mealPlanItem: modelStub(),
    recipeNote: modelStub(),
    filterPreset: modelStub(),
    recipeImage: modelStub(),
    recipeVideo: modelStub(),
    shoppingList: modelStub(),
    user: {
      ...modelStub(),
      count: (...args: unknown[]) => userCountMock(...args),
    },
  },
}));

describe("getBusinessInsightsStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryRawMock.mockImplementation((strings: TemplateStringsArray) => {
      const sql = strings.join("");
      if (sql.includes('"User"')) {
        return [
          {
            total: 1,
            new_this_month: 0,
            new_last_month: 0,
            new_this_week: 0,
            new_today: 0,
          },
        ];
      }
      if (sql.includes('"ShoppingList"')) {
        return [{ total: 0, completed: 0 }];
      }
      if (sql.includes("this_week")) {
        return [{ this_week: 0, last_week: 0 }];
      }
      if (sql.includes("DISTINCT")) {
        return [{ unique_count: 0 }];
      }
      return [];
    });
  });

  it("uses one $queryRaw batch for User counts (no prisma.user.count)", async () => {
    const { getBusinessInsightsStats } = await import("../business-insights");
    await getBusinessInsightsStats();

    const userRawCalls = queryRawMock.mock.calls.filter((call) => {
      const sql = call[0]?.join?.("") ?? "";
      return sql.includes('"User"');
    });
    expect(userRawCalls.length).toBe(1);
    expect(userCountMock).not.toHaveBeenCalled();
  });
});
