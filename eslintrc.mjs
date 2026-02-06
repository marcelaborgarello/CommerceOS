import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        rules: {
            // 🚨 Anti-any rules
            "@typescript-eslint/no-explicit-any": "error",      // Prohibe `any` explícito
            "@typescript-eslint/no-unsafe-assignment": "warn",  // Avisa de asignaciones unsafe
            "@typescript-eslint/no-unsafe-call": "warn",        // Avisa de llamadas unsafe
            "@typescript-eslint/no-unsafe-member-access": "warn", // Avisa de acceso unsafe

            // 🎯 Calidad de código
            "@typescript-eslint/no-unused-vars": ["error", {    // Variables sin usar = error
                "argsIgnorePattern": "^_",                       // Permite _variableIgnorada
                "varsIgnorePattern": "^_"
            }],
            "no-console": ["warn", { "allow": ["warn", "error"] }], // Solo console.warn/error

            // 🔒 Mejores prácticas
            "prefer-const": "error",                             // Usa const cuando sea posible
            "no-var": "error",                                   // Prohibe var (usa let/const)
        }
    }
];

export default eslintConfig;