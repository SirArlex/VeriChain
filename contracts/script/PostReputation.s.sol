// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {IReputationRegistry} from "../src/IERC8004.sol";

/**
 * @title PostReputation
 * @notice Posts performance signals to the OFFICIAL ERC-8004 Reputation
 *         Registry on Mantle Sepolia.
 *
 * @dev IMPORTANT: The spec forbids self-feedback — the caller MUST NOT be the
 *      owner/operator of the agent NFTs. Use a SECOND funded wallet here, set
 *      as CLIENT_PRIVATE_KEY in your .env (different from DEPLOYER_PRIVATE_KEY).
 *
 * Usage:
 *   forge script script/PostReputation.s.sol:PostReputation \
 *     --rpc-url https://rpc.sepolia.mantle.xyz \
 *     --private-key $CLIENT_PRIVATE_KEY \
 *     --broadcast --legacy
 */
contract PostReputation is Script {
    address constant REPUTATION_REGISTRY = 0x8004B663056A597Dffe9eCcC1965A193B7388713;

    function run() external {
        uint256 clientPrivateKey = vm.envUint("CLIENT_PRIVATE_KEY");

        IReputationRegistry reputation = IReputationRegistry(REPUTATION_REGISTRY);

        // EDIT THESE: paste the agentIds printed by RegisterAgents, in the same
        // order (metadata, ownership, compliance, fraud-detection, risk-scoring).
        uint256[5] memory agentIds = [uint256(0), 0, 0, 0, 0];

        // Success-rate signal per agent (matches dashboard: 100%).
        // tag1 = "successRate", valueDecimals = 0  => value is a 0-100 percent.
        int128[5] memory successRates = [int128(100), 100, 100, 100, 100];

        vm.startBroadcast(clientPrivateKey);

        for (uint256 i = 0; i < agentIds.length; i++) {
            if (agentIds[i] == 0) {
                console.log("Skipping unset agentId at index", i);
                continue;
            }
            reputation.giveFeedback(
                agentIds[i],
                successRates[i], // value
                0,               // valueDecimals -> percent
                "successRate",   // tag1
                "verichain",     // tag2
                "",              // endpoint
                "",              // feedbackURI
                bytes32(0)       // feedbackHash
            );
            console.log("Posted successRate for agentId:", agentIds[i]);
        }

        vm.stopBroadcast();
    }
}
