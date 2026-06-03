import { AgentName } from '../types';

/**
 * ERC-8004 on-chain identity configuration.
 *
 * VeriChain registers each of its 5 AI agents with the OFFICIAL ERC-8004
 * Identity Registry deployed on Mantle. Each agent is minted an ERC-721
 * identity NFT whose tokenId is its `agentId`.
 */

// OFFICIAL ERC-8004 registries on Mantle Sepolia (Mantle Testnet).
export const ERC8004_IDENTITY_REGISTRY =
  '0x8004A818BFB912233c491871b3d84c89A494BD9e';
export const ERC8004_REPUTATION_REGISTRY =
  '0x8004B663056A597Dffe9eCcC1965A193B7388713';

// Mantlescan is the explorer that actually resolves these routes.
const EXPLORER = 'https://sepolia.mantlescan.xyz';

/**
 * agentName -> on-chain ERC-8004 agentId (ERC-721 tokenId).
 * These are the LIVE ids registered against veri-chain-client.vercel.app.
 */
export const AGENT_IDS: Record<AgentName, number | null> = {
  METADATA: 108,
  OWNERSHIP: 109,
  COMPLIANCE: 110,
  FRAUD_DETECTION: 111,
  RISK_SCORING: 112,
};

/**
 * The mint transaction hash for each agent's identity NFT.
 * Linking to the tx is explorer-agnostic and always resolves.
 */
export const AGENT_MINT_TX: Record<AgentName, string | null> = {
  METADATA: '0xc965527452778d0579a54774d7ac2745aa27801e24d68b22083f41a8ef704404',
  OWNERSHIP: '0x55b7cd9dc34f08e84161aedda300b1fab01645bdf08547a28c3de0147ce13fde',
  COMPLIANCE: '0x67bc1eefb9839b4fdbf0a277355a77fba093c9e86380a3ca824a0f9036e149f8',
  FRAUD_DETECTION: '0x818dbbab70b0d15256e74415ee876929539ec929d7e993f2048431c8741dae42',
  RISK_SCORING: '0x79f56524b1b3be248ea3dc147529d104922b42fc0e3b44b0104d03f33bd79be1',
};

/** True once an agent has a registered on-chain identity. */
export function hasOnChainIdentity(agent: AgentName): boolean {
  return AGENT_IDS[agent] !== null;
}

/**
 * Explorer link for an agent's ERC-8004 identity.
 * Prefers the mint transaction (always resolves); falls back to the
 * registry contract address page.
 */
export function agentIdentityUrl(agent: AgentName): string | null {
  const tx = AGENT_MINT_TX[agent];
  if (tx) return `${EXPLORER}/tx/${tx}`;
  if (AGENT_IDS[agent] !== null) {
    return `${EXPLORER}/address/${ERC8004_IDENTITY_REGISTRY}`;
  }
  return null;
}

/** Link to the Identity Registry contract itself. */
export function identityRegistryUrl(): string {
  return `${EXPLORER}/address/${ERC8004_IDENTITY_REGISTRY}`;
}
