import { createConfig, regtest } from "@midl/core";
import { xverseConnector } from "@midl/connectors";

/**
 * MIDL SDK Configuration
 * 
 * This configures the MIDL SDK for Bitcoin Regtest network
 * with Xverse wallet connector integration.
 */
export const midlConfig = createConfig({
    networks: [regtest],
    connectors: [xverseConnector()],
    persist: true, // Persist connection state across page refreshes
});
