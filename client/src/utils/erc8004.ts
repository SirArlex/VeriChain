import { AgentName } from '../types';

/**
 * ERC-8004 on-chain identity configuration.
 *
 * VeriChain registers each of its 5 AI agents with the OFFICIAL ERC-8004
 * Identity Registry deployed on Mantle (we do not redeploy it). Each agent is
 * minted an ERC-721 identity NFT whose tokenId is its `agentId`.
 *
 * After running `forge script script/RegisterAgents.s.sol`, paste the printed
 * agentIds into AGENT_IDS below.
 */

// OFFICIAL ERC-8004 registries on Mantle Sepolia (Mantle Testnet).
// Source: github.com/erc-8004/erc-8004-contracts
export const ERC8004_IDENTITY_REGISTRY =
  '0x8004A818BFB912233c491871b3d84c89A494BD9e';
export const ERC8004_REPUTATION_REGISTRY =
  '0x8004B663056A597Dffe9eCcC1965A193B7388713';

const MANTLE_SEPOLIA_EXPLORER = 'https://explorer.sepolia.mantle.xyz';

/**
 * agentName → on-chain ERC-8004 agentId (ERC-721 tokenId).
 * Fill these in from the RegisterAgents script output.
 * A value of null means "not yet registered" and the UI hides the badge.
 */
export const AGENT_IDS: Record<AgentName, number | null> = {
  METADATA: 103,
  OWNERSHIP: 104,
  COMPLIANCE: 105,
  FRAUD_DETECTION: 106,
  RISK_SCORING: 107,
};

/** True once an agent has a registered on-chain identity. */
export function hasOnChainIdentity(agent: AgentName): boolean {
  return AGENT_IDS[agent] !== null;
}

/** Mantle explorer link to the ERC-8004 identity NFT for an agent. */
export function agentIdentityUrl(agent: AgentName): string | null {
  const id = AGENT_IDS[agent];
  if (id === null) return null;
  // Links to the Identity Registry contract; the agent NFT is tokenId = id.
  return `${MANTLE_SEPOLIA_EXPLORER}/token/${ERC8004_IDENTITY_REGISTRY}/instance/${id}`;
}

/** Fallback link to the Identity Registry contract itself. */
export function identityRegistryUrl(): string {
  return `${MANTLE_SEPOLIA_EXPLORER}/address/${ERC8004_IDENTITY_REGISTRY}`;
}
