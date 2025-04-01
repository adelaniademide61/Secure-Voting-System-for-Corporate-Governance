/**
 * Mock implementation of Clarity binary execution environment
 * This is a simplified mock for testing Clarity contracts with Vitest
 */
export function mockClarityBin() {
  // In-memory storage for contract data
  const storage = {
    dataVars: {},
    maps: {},
    blockHeight: 0,
    txSender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    contractOwner: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    contracts: {},
  }

  return {
    // Execute a contract and load it into memory
    executeContract(contractPath) {
      // In a real implementation, this would parse and execute the contract
      // For our mock, we'll just register it as available
      storage.contracts[contractPath] = true
      return true
    },

    // Call a public function on a contract
    callPublic(functionName, args = []) {
      // Mock implementation of public function calls
      // In a real implementation, this would execute the function logic

      // For testing purposes, we'll implement some basic behavior
      if (functionName === "register-shareholder") {
        const [address, shares] = args
        if (storage.txSender !== storage.contractOwner) {
          return { success: false, error: 100 }
        }

        if (!storage.maps.shareholders) {
          storage.maps.shareholders = {}
        }

        storage.maps.shareholders[address] = { shares, verified: true }
        return { success: true }
      }

      if (functionName === "submit-proposal") {
        const [title, description, startBlock, endBlock] = args

        if (endBlock <= startBlock) {
          return { success: false, error: 101 }
        }

        if (startBlock < storage.blockHeight) {
          return { success: false, error: 102 }
        }

        if (!storage.maps.proposals) {
          storage.maps.proposals = {}
          storage.dataVars.proposalCount = 0
        }

        const id = storage.dataVars.proposalCount
        storage.maps.proposals[id] = {
          title,
          description,
          proposer: storage.txSender,
          "start-block": startBlock,
          "end-block": endBlock,
          status: "active",
        }

        storage.dataVars.proposalCount++
        return { success: true, value: id }
      }

      if (functionName === "cast-vote") {
        const [proposalId, voteType] = args

        // Check if proposal exists
        if (!storage.maps.proposals || !storage.maps.proposals[proposalId]) {
          return { success: false, error: 200 }
        }

        const proposal = storage.maps.proposals[proposalId]

        // Check if proposal is active
        if (proposal.status !== "active") {
          return { success: false, error: 201 }
        }

        // Check if within voting period
        if (storage.blockHeight < proposal["start-block"] || storage.blockHeight > proposal["end-block"]) {
          return { success: false, error: 202 }
        }

        // Check if shareholder can vote
        if (
          !storage.maps.shareholders ||
          !storage.maps.shareholders[storage.txSender] ||
          !storage.maps.shareholders[storage.txSender].verified
        ) {
          return { success: false, error: 203 }
        }

        const shares = storage.maps.shareholders[storage.txSender].shares

        // Record vote
        if (!storage.maps.votes) {
          storage.maps.votes = {}
        }

        const voteKey = `${proposalId}-${storage.txSender}`
        storage.maps.votes[voteKey] = {
          vote: voteType,
          weight: shares,
          timestamp: storage.blockHeight,
        }

        // Update vote count
        if (!storage.maps.voteCounts) {
          storage.maps.voteCounts = {}
        }

        const countKey = `${proposalId}-${voteType}`
        storage.maps.voteCounts[countKey] = {
          count: (storage.maps.voteCounts[countKey]?.count || 0) + shares,
        }

        return { success: true }
      }

      if (functionName === "tally-votes") {
        const [proposalId] = args

        // Check if proposal exists
        if (!storage.maps.proposals || !storage.maps.proposals[proposalId]) {
          return { success: false, error: 300 }
        }

        const proposal = storage.maps.proposals[proposalId]

        // Check if voting period has ended
        if (storage.blockHeight <= proposal["end-block"]) {
          return { success: false, error: 301 }
        }

        // Get vote counts
        const forVotes = storage.maps.voteCounts[`${proposalId}-for`]?.count || 0
        const againstVotes = storage.maps.voteCounts[`${proposalId}-against`]?.count || 0
        const abstainVotes = storage.maps.voteCounts[`${proposalId}-abstain`]?.count || 0

        // Record results
        if (!storage.maps.results) {
          storage.maps.results = {}
        }

        storage.maps.results[proposalId] = {
          "for-votes": forVotes,
          "against-votes": againstVotes,
          "abstain-votes": abstainVotes,
          status: forVotes > againstVotes ? "passed" : "rejected",
          "certified-by": storage.txSender,
        }

        return { success: true }
      }

      // Default fallback
      return { success: false, error: 999 }
    },

    // Call a read-only function on a contract
    callReadOnly(functionName, args = []) {
      if (functionName === "can-vote") {
        const [address, requiredShares] = args

        if (!storage.maps.shareholders || !storage.maps.shareholders[address]) {
          return false
        }

        const shareholder = storage.maps.shareholders[address]
        return shareholder.verified && shareholder.shares >= requiredShares
      }

      if (functionName === "get-shareholder-shares") {
        const [address] = args

        if (!storage.maps.shareholders || !storage.maps.shareholders[address]) {
          return 0
        }

        return storage.maps.shareholders[address].shares
      }

      if (functionName === "get-proposal") {
        const [id] = args

        if (!storage.maps.proposals || !storage.maps.proposals[id]) {
          return null
        }

        return storage.maps.proposals[id]
      }

      if (functionName === "get-vote") {
        const [proposalId, voter] = args

        if (!storage.maps.votes) {
          return null
        }

        const voteKey = `${proposalId}-${voter}`
        return storage.maps.votes[voteKey] || null
      }

      if (functionName === "get-vote-count") {
        const [proposalId, voteType] = args

        if (!storage.maps.voteCounts) {
          return null
        }

        const countKey = `${proposalId}-${voteType}`
        return storage.maps.voteCounts[countKey] || null
      }

      if (functionName === "get-result") {
        const [proposalId] = args

        if (!storage.maps.results || !storage.maps.results[proposalId]) {
          return null
        }

        return storage.maps.results[proposalId]
      }

      return null
    },

    // Set the current block height
    setBlockHeight(height) {
      storage.blockHeight = height
    },

    // Get the current block height
    getBlockHeight() {
      return storage.blockHeight
    },

    // Set the transaction sender
    setTxSender(address) {
      storage.txSender = address
    },

    // Get the transaction sender
    getTxSender() {
      return storage.txSender
    },
  }
}

