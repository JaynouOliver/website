import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    // React Compiler rules added in eslint-config-next 16. Existing code uses
    // these patterns intentionally (mount flags, fetch-on-mount), so surface
    // them as warnings instead of failing lint.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
];

export default config;
