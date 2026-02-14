/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MIDL_API_KEY: string
    readonly VITE_MIDL_RPC_URL: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
