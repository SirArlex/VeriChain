// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title VeriChainRegistry
 * @author VeriChain
 * @notice Stores tamper-proof AI verification proofs for Real World Assets on Mantle.
 *
 * @dev Architecture decisions:
 * - We store ONLY hashes and scores on-chain, never raw documents.
 * - documentHash is SHA-256 of the original file — computed off-chain.
 * - agentOutputsHash is SHA-256 of the full agent JSON output — links to off-chain data.
 * - This keeps gas costs minimal while providing cryptographic proof of verification.
 *
 * @dev Key design:
 * - One document can have multiple verifications (reverifications over time).
 * - Each verification is immutable once stored.
 * - Anyone can verify a document's status by its hash — no trust required.
 */
contract VeriChainRegistry {

    // ── Types ──────────────────────────────────────────────────────────

    enum VerificationStatus { PENDING, COMPLETED, FAILED }

    struct VerificationProof {
        bytes32 documentHash;       // SHA-256 hash of original document
        uint8 riskScore;            // 0-100, higher = riskier
        VerificationStatus status;  // verification outcome
        bytes32 agentOutputsHash;   // SHA-256 hash of full agent JSON outputs
        string verificationId;      // off-chain UUID for cross-reference
        address submitter;          // wallet that submitted the proof
        uint256 timestamp;          // block timestamp of submission
        bool exists;                // used for existence checks
    }

    // ── State ──────────────────────────────────────────────────────────

    /// @notice Owner of the contract — can pause in emergencies
    address public owner;

    /// @notice Whether new proofs can be stored
    bool public paused;

    /// @notice Total verifications stored
    uint256 public totalVerifications;

    /// @notice Maps verificationId → proof
    mapping(string => VerificationProof) private proofs;

    /// @notice Maps documentHash → array of verificationIds
    mapping(bytes32 => string[]) private documentVerifications;

    /// @notice Maps submitter address → their verificationIds
    mapping(address => string[]) private submitterVerifications;

    // ── Events ─────────────────────────────────────────────────────────

    event VerificationStored(
        string indexed verificationId,
        bytes32 indexed documentHash,
        uint8 riskScore,
        VerificationStatus status,
        address indexed submitter,
        uint256 timestamp
    );

    event ContractPaused(address by);
    event ContractUnpaused(address by);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ── Errors ─────────────────────────────────────────────────────────

    error NotOwner();
    error ContractIsPaused();
    error VerificationAlreadyExists(string verificationId);
    error InvalidVerificationId();
    error InvalidDocumentHash();
    error InvalidRiskScore(uint8 score);

    // ── Modifiers ──────────────────────────────────────────────────────

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractIsPaused();
        _;
    }

    // ── Constructor ────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        paused = false;
        totalVerifications = 0;
    }

    // ── Core Functions ─────────────────────────────────────────────────

    /**
     * @notice Stores a new verification proof on-chain.
     * @param documentHash SHA-256 hash of the document (bytes32)
     * @param riskScore Risk score 0-100
     * @param status Verification outcome (0=PENDING, 1=COMPLETED, 2=FAILED)
     * @param agentOutputsHash SHA-256 hash of agent JSON outputs
     * @param verificationId Off-chain UUID for cross-reference
     */
    function storeVerification(
        bytes32 documentHash,
        uint8 riskScore,
        VerificationStatus status,
        bytes32 agentOutputsHash,
        string calldata verificationId
    ) external whenNotPaused {
        // Validate inputs
        if (bytes(verificationId).length == 0) revert InvalidVerificationId();
        if (documentHash == bytes32(0)) revert InvalidDocumentHash();
        if (riskScore > 100) revert InvalidRiskScore(riskScore);
        if (proofs[verificationId].exists) revert VerificationAlreadyExists(verificationId);

        // Store proof
        proofs[verificationId] = VerificationProof({
            documentHash: documentHash,
            riskScore: riskScore,
            status: status,
            agentOutputsHash: agentOutputsHash,
            verificationId: verificationId,
            submitter: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        // Update indexes
        documentVerifications[documentHash].push(verificationId);
        submitterVerifications[msg.sender].push(verificationId);
        totalVerifications++;

        emit VerificationStored(
            verificationId,
            documentHash,
            riskScore,
            status,
            msg.sender,
            block.timestamp
        );
    }

    // ── View Functions ─────────────────────────────────────────────────

    /**
     * @notice Returns a verification proof by its ID.
     */
    function getVerification(string calldata verificationId)
        external
        view
        returns (VerificationProof memory)
    {
        return proofs[verificationId];
    }

    /**
     * @notice Returns all verification IDs for a document hash.
     */
    function getDocumentVerifications(bytes32 documentHash)
        external
        view
        returns (string[] memory)
    {
        return documentVerifications[documentHash];
    }

    /**
     * @notice Checks if a verification exists on-chain.
     */
    function verificationExists(string calldata verificationId)
        external
        view
        returns (bool)
    {
        return proofs[verificationId].exists;
    }

    /**
     * @notice Returns all verification IDs submitted by an address.
     */
    function getSubmitterVerifications(address submitter)
        external
        view
        returns (string[] memory)
    {
        return submitterVerifications[submitter];
    }

    // ── Admin Functions ────────────────────────────────────────────────

    function pause() external onlyOwner {
        paused = true;
        emit ContractPaused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit ContractUnpaused(msg.sender);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }
}
