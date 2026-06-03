export const VERICHAIN_REGISTRY_ABI = [
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
  {
    type: 'function',
    name: 'verificationExists',
    stateMutability: 'view',
    inputs: [{ name: 'verificationId', type: 'string' }],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'getDocumentVerifications',
    stateMutability: 'view',
    inputs: [{ name: 'documentHash', type: 'bytes32' }],
    outputs: [{ type: 'string[]' }],
  },
  {
    type: 'function',
    name: 'totalVerifications',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    type: 'function',
    name: 'paused',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bool' }],
  },
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

export async function hashAgentOutputs(outputs: string): Promise<`0x${string}`> {
  const encoder = new TextEncoder();
  const data = encoder.encode(outputs);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `0x${hashHex}`;
}
