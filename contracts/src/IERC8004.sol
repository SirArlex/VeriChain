// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IERC8004
 * @notice Minimal interfaces for the OFFICIAL ERC-8004 registries that are
 *         already deployed on Mantle. VeriChain does NOT redeploy these — it
 *         registers its agents against them.
 *
 * @dev Signatures taken verbatim from the ERC-8004 spec (ERC8004SPEC.md).
 *      Official Mantle addresses are in script/RegisterAgents.s.sol.
 */

struct MetadataEntry {
    string metadataKey;
    bytes metadataValue;
}

interface IIdentityRegistry {
    /// @notice Mint a new agent identity NFT pointing at a registration file.
    /// @return agentId The ERC-721 tokenId assigned to the new agent.
    function register(string calldata agentURI) external returns (uint256 agentId);

    /// @notice Mint a new agent identity NFT with URI + on-chain metadata.
    function register(string calldata agentURI, MetadataEntry[] calldata metadata)
        external
        returns (uint256 agentId);

    /// @notice Update an agent's registration-file URI.
    function setAgentURI(uint256 agentId, string calldata newURI) external;

    /// @notice ERC-721 — current owner of the agent NFT.
    function ownerOf(uint256 agentId) external view returns (address);

    /// @notice ERC-721 — registration-file URI for the agent.
    function tokenURI(uint256 agentId) external view returns (string memory);
}

interface IReputationRegistry {
    /// @notice Post a feedback / performance signal for an agent.
    /// @param value Signed fixed-point value (e.g. 100 for "100").
    /// @param valueDecimals Decimals applied to `value` (0-18).
    function giveFeedback(
        uint256 agentId,
        int128 value,
        uint8 valueDecimals,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI,
        bytes32 feedbackHash
    ) external;
}
