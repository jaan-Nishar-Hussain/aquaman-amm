import { http, createConfig } from "wagmi";
import { mainnet, arbitrum, avalanche, base, optimism, sepolia, polygonAmoy } from "wagmi/chains";

// Wagmi configuration for AQUAMAN protocol
export const config = createConfig({
    chains: [mainnet, arbitrum, avalanche, base, optimism, sepolia, polygonAmoy],
    transports: {
        [mainnet.id]: http(),
        [arbitrum.id]: http(),
        [avalanche.id]: http(),
        [base.id]: http(),
        [optimism.id]: http(),
        [sepolia.id]: http(),
        [polygonAmoy.id]: http(),
    },
});

declare module "wagmi" {
    interface Register {
        config: typeof config;
    }
}
