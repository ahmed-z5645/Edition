import { describe, it, expect } from "vitest";
import { getTimeUntilSunday } from "@/lib/utils/week";

describe("getTimeUntilSunday", () => {
  it("returns an object with days and hours properties", () => {
    const result = getTimeUntilSunday();
    expect(result).toHaveProperty("days");
    expect(result).toHaveProperty("hours");
  });

  it("days is between 1 and 7", () => {
    const { days } = getTimeUntilSunday();
    expect(days).toBeGreaterThanOrEqual(1);
    expect(days).toBeLessThanOrEqual(7);
  });

  it("hours is between 0 and 23", () => {
    const { hours } = getTimeUntilSunday();
    expect(hours).toBeGreaterThanOrEqual(0);
    expect(hours).toBeLessThanOrEqual(23);
  });

  it("both values are integers", () => {
    const { days, hours } = getTimeUntilSunday();
    expect(Number.isInteger(days)).toBe(true);
    expect(Number.isInteger(hours)).toBe(true);
  });
});
