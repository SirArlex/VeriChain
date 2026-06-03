// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {IIdentityRegistry} from "../src/IERC8004.sol";

/**
 * @title RegisterAgents
 * @notice Registers VeriChain's 5 AI verification agents with the OFFICIAL
 *         ERC-8004 Identity Registry on Mantle Sepolia, minting one identity
 *         NFT per agent. Run once; record the printed agentIds.
 *
 * Usage:
 *   forge script script/RegisterAgents.s.sol:RegisterAgents \
 *     --rpc-url https://rpc.sepolia.mantle.xyz \
 *     --private-key $DEPLOYER_PRIVATE_KEY \
 *     --broadcast --legacy
 *
 * After it runs, copy each agentId into:
 *   client/src/utils/erc8004.ts  (AGENT_IDS map)
 * so the Agent Reputation page can link to each on-chain identity.
 */
contract RegisterAgents is Script {
    // OFFICIAL ERC-8004 Identity Registry on Mantle Sepolia (Mantle Testnet).
    // Source: github.com/erc-8004/erc-8004-contracts README.
    address constant IDENTITY_REGISTRY = 0x8004A818BFB912233c491871b3d84c89A494BD9e;

    // Where each agent's registration JSON is served from. These files live in
    // client/public/agents/ and are deployed by Vercel at the site root.
    string constant BASE_URI = "https://veri-chain-client.vercel.app/agents/";
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        IIdentityRegistry identity = IIdentityRegistry(IDENTITY_REGISTRY);

        // Slugs MUST match the JSON filenames in client/public/agents/.
        // Order matches the AgentName enum used across the app.
        string[5] memory slugs = [
            "metadata",         // METADATA
            "ownership",        // OWNERSHIP
            "compliance",       // COMPLIANCE
            "fraud-detection",  // FRAUD_DETECTION
            "risk-scoring"      // RISK_SCORING
        ];

        vm.startBroadcast(deployerPrivateKey);

        console.log("Registering VeriChain agents on ERC-8004 (Mantle Sepolia)");
        console.log("Identity Registry:", IDENTITY_REGISTRY);
        console.log("-----------------------------------------------------");

        for (uint256 i = 0; i < slugs.length; i++) {
            string memory agentURI = string.concat(BASE_URI, slugs[i], ".json");
            uint256 agentId = identity.register(agentURI);

            console.log("Agent:", slugs[i]);
            console.log("  agentId:", agentId);
            console.log("  agentURI:", agentURI);
            console.log("-----------------------------------------------------");
        }

        vm.stopBroadcast();

        console.log("Done. Copy the agentIds into client/src/utils/erc8004.ts");
    }
}
