// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {VeriChainRegistry} from "../src/VeriChainRegistry.sol";

contract VeriChainRegistryTest is Test {
    VeriChainRegistry public registry;
    address public owner = address(this);
    address public user = address(0xBEEF);

    bytes32 constant DOC_HASH = keccak256("test_document");
    bytes32 constant AGENT_HASH = keccak256("test_agent_outputs");
    string constant VERIFICATION_ID = "test-verification-uuid-001";

    function setUp() public {
        registry = new VeriChainRegistry();
    }

    function test_DeploymentState() public view {
        assertEq(registry.owner(), owner);
        assertEq(registry.paused(), false);
        assertEq(registry.totalVerifications(), 0);
    }

    function test_StoreVerification() public {
        registry.storeVerification(
            DOC_HASH,
            25,
            VeriChainRegistry.VerificationStatus.COMPLETED,
            AGENT_HASH,
            VERIFICATION_ID
        );

        assertEq(registry.totalVerifications(), 1);
        assertTrue(registry.verificationExists(VERIFICATION_ID));

        VeriChainRegistry.VerificationProof memory proof = registry.getVerification(VERIFICATION_ID);
        assertEq(proof.documentHash, DOC_HASH);
        assertEq(proof.riskScore, 25);
        assertEq(uint8(proof.status), uint8(VeriChainRegistry.VerificationStatus.COMPLETED));
        assertEq(proof.agentOutputsHash, AGENT_HASH);
        assertEq(proof.submitter, owner);
        assertTrue(proof.exists);
    }

    function test_RevertDuplicateVerification() public {
        registry.storeVerification(DOC_HASH, 25, VeriChainRegistry.VerificationStatus.COMPLETED, AGENT_HASH, VERIFICATION_ID);
        vm.expectRevert(abi.encodeWithSelector(VeriChainRegistry.VerificationAlreadyExists.selector, VERIFICATION_ID));
        registry.storeVerification(DOC_HASH, 25, VeriChainRegistry.VerificationStatus.COMPLETED, AGENT_HASH, VERIFICATION_ID);
    }

    function test_RevertInvalidRiskScore() public {
        vm.expectRevert(abi.encodeWithSelector(VeriChainRegistry.InvalidRiskScore.selector, 101));
        registry.storeVerification(DOC_HASH, 101, VeriChainRegistry.VerificationStatus.COMPLETED, AGENT_HASH, VERIFICATION_ID);
    }

    function test_RevertEmptyVerificationId() public {
        vm.expectRevert(VeriChainRegistry.InvalidVerificationId.selector);
        registry.storeVerification(DOC_HASH, 25, VeriChainRegistry.VerificationStatus.COMPLETED, AGENT_HASH, "");
    }

    function test_RevertZeroDocumentHash() public {
        vm.expectRevert(VeriChainRegistry.InvalidDocumentHash.selector);
        registry.storeVerification(bytes32(0), 25, VeriChainRegistry.VerificationStatus.COMPLETED, AGENT_HASH, VERIFICATION_ID);
    }

    function test_DocumentVerificationsIndex() public {
        registry.storeVerification(DOC_HASH, 25, VeriChainRegistry.VerificationStatus.COMPLETED, AGENT_HASH, "ver-001");
        registry.storeVerification(DOC_HASH, 30, VeriChainRegistry.VerificationStatus.COMPLETED, AGENT_HASH, "ver-002");

        string[] memory verIds = registry.getDocumentVerifications(DOC_HASH);
        assertEq(verIds.length, 2);
        assertEq(verIds[0], "ver-001");
        assertEq(verIds[1], "ver-002");
    }

    function test_PauseUnpause() public {
        registry.pause();
        assertTrue(registry.paused());
        vm.expectRevert(VeriChainRegistry.ContractIsPaused.selector);
        registry.storeVerification(DOC_HASH, 25, VeriChainRegistry.VerificationStatus.COMPLETED, AGENT_HASH, VERIFICATION_ID);

        registry.unpause();
        assertFalse(registry.paused());
        registry.storeVerification(DOC_HASH, 25, VeriChainRegistry.VerificationStatus.COMPLETED, AGENT_HASH, VERIFICATION_ID);
    }

    function test_OnlyOwnerCanPause() public {
        vm.prank(user);
        vm.expectRevert(VeriChainRegistry.NotOwner.selector);
        registry.pause();
    }

    function test_TransferOwnership() public {
        registry.transferOwnership(user);
        assertEq(registry.owner(), user);
    }

    function test_EmitsEventOnStore() public {
        vm.expectEmit(true, true, true, true);
        emit VeriChainRegistry.VerificationStored(
            VERIFICATION_ID,
            DOC_HASH,
            25,
            VeriChainRegistry.VerificationStatus.COMPLETED,
            owner,
            block.timestamp
        );
        registry.storeVerification(DOC_HASH, 25, VeriChainRegistry.VerificationStatus.COMPLETED, AGENT_HASH, VERIFICATION_ID);
    }
}
