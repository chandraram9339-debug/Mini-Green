import test from "node:test";
import assert from "node:assert/strict";
import { sibNextBalanceMinor } from "./sibBalance.js";

test("sibNextBalanceMinor: B_new = round(B × (1 + r/100))", () => {
  assert.equal(sibNextBalanceMinor(10_000, 5), 10_500);
  assert.equal(sibNextBalanceMinor(10_000, 0), 10_000);
  assert.equal(sibNextBalanceMinor(1_000, -10), 900);
  assert.equal(sibNextBalanceMinor(60, 2.5), 62);
});

test("sibNextBalanceMinor: stable vs naive B*(1+r/100) float rounding", () => {
  const b = 60;
  const r = 2.5;
  const naive = Math.round(b * (1 + r / 100));
  assert.equal(naive, 61);
  assert.equal(sibNextBalanceMinor(b, r), 62);
});
