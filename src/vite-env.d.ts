/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENOKI_API_KEY: string
  readonly VITE_SUI_NETWORK: string
  readonly VITE_NFT_FACTORY_PACKAGE_ID: string
  readonly VITE_GLOBAL_STATE_OBJECT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
