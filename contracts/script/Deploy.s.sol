// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {VeriChainRegistry} from "../src/VeriChainRegistry.sol";

/**
 * @title Deploy
 * @notice Deploys VeriChainRegistry to Mantle Sepolia.
 *
 * Usage:
 * forge script script/Deploy.s.sol \
 *   --rpc-url https://rpc.sepolia.mantle.xyz \
 *   --private-key $DEPLOYER_PRIVATE_KEY \
 *   --broadcast \
 *   --legacy
 *
 * The --legacy flag is required for Mantle (no EIP-1559).
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying VeriChainRegistry...");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

        VeriChainRegistry registry = new VeriChainRegistry();

        vm.stopBroadcast();

        console.log("VeriChainRegistry deployed at:", address(registry));
        console.log("Owner:", registry.owner());
        console.log("");
        console.log("Add to .env:");
        console.log("VERICHAIN_CONTRACT_ADDRESS=", address(registry));
        console.log("VITE_CONTRACT_ADDRESS=", address(registry));
    }
}
