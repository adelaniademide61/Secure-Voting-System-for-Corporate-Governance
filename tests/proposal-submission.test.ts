import { describe, it, expect, beforeEach } from "vitest"
import { mockClarityBin } from "./test-utils"

describe("Proposal Submission Contract", () => {
  let clarityBin
  
  beforeEach(() => {
    clarityBin = mockClarityBin()
    clarityBin.executeContract("proposal-submission.clar")
    clarityBin.setBlockHeight(100)
  })
  
  it("should submit a proposal", () => {
    const result = clarityBin.callPublic("submit-proposal", [
      "Increase Dividend",
      "Proposal to increase quarterly dividend by 5%",
      100,
      200,
    ])
    expect(result.success).toBe(true)
    expect(result.value).toBe(0)
  })
  
  it("should reject proposals with invalid block range", () => {
    const result = clarityBin.callPublic("submit-proposal", [
      "Invalid Proposal",
      "This proposal has end block before start block",
      200,
      100,
    ])
    expect(result.success).toBe(false)
    expect(result.error).toBe(101)
  })
  
  it("should reject proposals with start block in the past", () => {
    const result = clarityBin.callPublic("submit-proposal", [
      "Invalid Proposal",
      "This proposal has start block in the past",
      50,
      200,
    ])
    expect(result.success).toBe(false)
    expect(result.error).toBe(102)
  })
  
  it("should retrieve a proposal by id", () => {
    // Submit a proposal first
    clarityBin.callPublic("submit-proposal", [
      "Increase Dividend",
      "Proposal to increase quarterly dividend by 5%",
      100,
      200,
    ])
    
    // Retrieve the proposal
    const result = clarityBin.callReadOnly("get-proposal", [0])
    expect(result).toEqual({
      title: "Increase Dividend",
      description: "Proposal to increase quarterly dividend by 5%",
      proposer: clarityBin.getTxSender(),
      "start-block": 100,
      "end-block": 200,
      status: "active",
    })
  })
})

