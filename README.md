# StackMart

StackMart is a decentralized marketplace on Stacks where creators list digital goods (templates, code snippets, game assets, music loops) as NFTs with built-in licensing. Buyers pay in STX, and smart contracts handle escrow, automatic royalty splits, and on-chain delivery signals to prevent fraud.

## Key Features (concept)
- On-chain listings for digital goods represented as NFTs with license terms.
- Escrowed payments in STX with automatic royalty splits to collaborators.
- Reputation and delivery attestation (seller/buyer signals recorded on-chain).
- Dispute resolution via community staking and weighted votes.
- Bundles and curated packs with discounted pricing.

## Repo Structure
- `Clarinet.toml` – Clarinet project manifest.
- `contracts/` – Clarity smart contracts (add your contracts here and register in `Clarinet.toml`).
- `tests/` – Vitest + clarinet simnet tests.
- `settings/` – Network-specific Clarinet settings.
- `vitest.config.ts` / `tsconfig.json` – Test runner and TS config for the clarinet environment.

## Getting Started
1) Install prerequisites
   - Node.js 18+ and npm
   - Clarinet (`npm install -g @hirosystems/clarinet` or see docs)
2) Install dependencies
   - `npm install`
3) Add a contract
   - Create a `.clar` file under `contracts/` and register it in `Clarinet.toml`.
4) Write tests
   - Add simnet tests in `tests/` (Vitest + `vitest-environment-clarinet` are preconfigured).

## Testing
- Run tests: `npm test`
- Run tests with coverage and cost reports: `npm run test:report`
- Watch mode (tests rerun on contract/test changes): `npm run test:watch`

## Development Workflow
- Use `clarinet check` to lint/check contracts as you build.
- Keep contract interfaces and tests in sync; simnet state resets between tests.
- Capture any protocol decisions (e.g., royalty splits, dispute parameters) in this README as the design evolves.
