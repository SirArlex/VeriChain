<<<<<<< HEAD
export const VERICHAIN_REGISTRY_ABI = [
=======
/**
 * VeriChainRegistry contract configuration.
 *
 * The ABI here matches VeriChainRegistry.sol exactly.
 * After deploying with Foundry, update VITE_CONTRACT_ADDRESS in .env.
 *
 * The frontend uses wagmi's writeContract to call storeVerification.
 * No backend involvement in the transaction — pure client-side signing.
 */

export const VERICHAIN_REGISTRY_ABI = [
  // storeVerification
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
  {
    type: 'function',
    name: 'storeVerification',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'documentHash', type: 'bytes32' },
      { name: 'riskScore', type: 'uint8' },
      { name: 'status', type: 'uint8' },
      { name: 'agentOutputsHash', type: 'bytes32' },
      { name: 'verificationId', type: 'string' },
    ],
    outputs: [],
  },
<<<<<<< HEAD
=======
  // getVerification
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
  {
    type: 'function',
    name: 'getVerification',
    stateMutability: 'view',
    inputs: [{ name: 'verificationId', type: 'string' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'documentHash', type: 'bytes32' },
          { name: 'riskScore', type: 'uint8' },
          { name: 'status', type: 'uint8' },
          { name: 'agentOutputsHash', type: 'bytes32' },
          { name: 'verificationId', type: 'string' },
          { name: 'submitter', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'exists', type: 'bool' },
        ],
      },
    ],
  },
<<<<<<< HEAD
=======
  // verificationExists
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
  {
    type: 'function',
    name: 'verificationExists',
    stateMutability: 'view',
    inputs: [{ name: 'verificationId', type: 'string' }],
    outputs: [{ type: 'bool' }],
  },
<<<<<<< HEAD
=======
  // getDocumentVerifications
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
  {
    type: 'function',
    name: 'getDocumentVerifications',
    stateMutability: 'view',
    inputs: [{ name: 'documentHash', type: 'bytes32' }],
    outputs: [{ type: 'string[]' }],
  },
<<<<<<< HEAD
  {
    type: 'function',
    name: 'isDocumentVerified',
    stateMutability: 'view',
    inputs: [{ name: 'documentHash', type: 'bytes32' }],
    outputs: [{ type: 'bool' }],
  },
=======
  // totalVerifications
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
  {
    type: 'function',
    name: 'totalVerifications',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
<<<<<<< HEAD
=======
  // owner
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
<<<<<<< HEAD
=======
  // paused
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
  {
    type: 'function',
    name: 'paused',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bool' }],
  },
<<<<<<< HEAD
=======
  // Events
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
  {
    type: 'event',
    name: 'VerificationStored',
    inputs: [
      { name: 'verificationId', type: 'string', indexed: true },
      { name: 'documentHash', type: 'bytes32', indexed: true },
      { name: 'riskScore', type: 'uint8', indexed: false },
      { name: 'status', type: 'uint8', indexed: false },
      { name: 'submitter', type: 'address', indexed: true },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
] as const;

<<<<<<< HEAD
// Raw string — no template literal type to avoid TS comparison errors
export const CONTRACT_ADDRESS: string =
  import.meta.env.VITE_CONTRACT_ADDRESS ?? '';

export const MANTLE_SEPOLIA_CHAIN_ID = 5003;

export function isContractConfigured(): boolean {
  return CONTRACT_ADDRESS.length > 0 && CONTRACT_ADDRESS.startsWith('0x');
}

export function getContractAddress(): `0x${string}` {
  return CONTRACT_ADDRESS as `0x${string}`;
}

export function hexToBytes32(hex: string): `0x${string}` {
  const clean = hex.startsWith('0x') ? hex : `0x${hex}`;
  return clean.padEnd(66, '0') as `0x${string}`;
}

=======
export const CONTRACT_ADDRESS = (
  import.meta.env.VITE_CONTRACT_ADDRESS ?? ''
) as `0x${string}`;

export const MANTLE_SEPOLIA_CHAIN_ID = 5003;

/**
 * Converts a hex string document hash (0x...) to bytes32 for the contract.
 * The backend returns SHA-256 as "0x" + 64 hex chars.
 * The contract expects bytes32 (same format).
 */
export function hexToBytes32(hex: string): `0x${string}` {
  const clean = hex.startsWith('0x') ? hex : `0x${hex}`;
  // Pad to 66 chars (0x + 64 hex) if needed
  return clean.padEnd(66, '0') as `0x${string}`;
}

/**
 * Hashes agent outputs string to bytes32 using Web Crypto API.
 * This produces the agentOutputsHash stored on-chain.
 */
>>>>>>> bc38e5bb1578930cca919b9c6261805062e3c71f
export async function hashAgentOutputs(outputs: string): Promise<`0x${string}`> {
  const encoder = new TextEncoder();
  const data = encoder.encode(outputs);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `0x${hashHex}`;
}
