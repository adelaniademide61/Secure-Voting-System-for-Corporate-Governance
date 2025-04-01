import { describe, it, expect, beforeEach } from "vitest"
import { mockClarityBin } from "./test-utils"

describe("Shareholder Verification Contract", () => {
  let clarityBin
  
  beforeEach(() => {
    clarityBin = mockClarityBin()
    clarityBin.executeContract("shareholder-verification.clar")
  })
  
  it("should register a shareholder", () => {
    const result = clarityBin.callPublic("register-shareholder", ["ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", 1000])
    expect(result.success).toBe(true)
  })
  
  it("should verify if a shareholder can vote", () => {
    // Register shareholder first
    clarityBin.callPublic("register-shareholder", ["ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", 1000])
    
    // Check if they can vote
    const result = clarityBin.callReadOnly("can-vote", ["ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", 100])
    expect(result).toBe(true)
  })
  
  it("should return false for unregistered shareholders", () => {
    const result = clarityBin.callReadOnly("can-vote", ["ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", 100])
    expect(result).toBe(false)
  })
})

