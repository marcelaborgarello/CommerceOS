
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

// Regex to parse the error output from Next.js / TypeScript
// Example: ./src/actions/compromisosActions.ts:6:10
// Type error: 'Commitment' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.
const FILE_REGEX = /^(\.\/src\/.*\.tsx?):(\d+):(\d+)$/;
const TYPE_ERROR_REGEX = /Type error: '(\w+)' is a type and must be imported using a type-only import/;

async function runBuildAndCaptureErrors(): Promise<string> {
    console.log("Running build to capture errors...");
    return new Promise((resolve) => {
        // Run bun run build. We expect it to fail.
        // We capture stdout/stderr.
        const child = spawn("bun", ["run", "build"], { shell: true, cwd: process.cwd() });

        let output = "";

        child.stdout.on("data", (data) => output += data.toString());
        child.stderr.on("data", (data) => output += data.toString());

        child.on("close", () => {
            resolve(output);
        });
    });
}

function applyFixes(log: string) {
    const lines = log.split('\n');
    const fixes = new Map<string, Set<string>>(); // Filename -> Set of symbols to fix

    let currentFile: string | null = null;

    for (const line of lines) {
        const fileMatch = line.match(FILE_REGEX);
        if (fileMatch) {
            currentFile = fileMatch[1];
            continue;
        }

        const errorMatch = line.match(TYPE_ERROR_REGEX);
        if (currentFile && errorMatch) {
            const symbol = errorMatch[1];
            if (!fixes.has(currentFile)) {
                fixes.set(currentFile, new Set());
            }
            fixes.get(currentFile)!.add(symbol);
        }
    }

    if (fixes.size === 0) {
        console.log("No type import errors found!");
        return false;
    }

    console.log(`Found issues in ${fixes.size} files.`);

    // Apply fixes
    for (const [relativePath, symbols] of fixes.entries()) {
        // resolve path (remove ./ at start)
        const filePath = path.join(process.cwd(), relativePath);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            continue;
        }

        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;

        console.log(`Fixing ${relativePath}: adding type to [${Array.from(symbols).join(', ')}]`);

        // Strategy: iterate over symbols and replace in the import clause.
        // We look for patterns like:
        // import { X } from '...'
        // import { X, Y } from '...'
        // import { Y, X } from '...'
        // We want to transform ' X ' into ' type X ' inside imports.

        // Naive replacement might be dangerous (replacing usage), so we strictly target import statements.
        // We can find the import line by checking where the symbol is imported.
        // Since we don't have AST here easily, we'll try a robust regex for imports.

        // Regex for named imports: import\s+\{([^}]+)\}\s+from
        const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;

        content = content.replace(importRegex, (match, importsBody, modulePath) => {
            let newBody = importsBody;
            let changedBody = false;

            // Split by comma
            const parts = newBody.split(',').map((p: string) => p.trim()); // e.g. ['Provider', 'CashSessionData'] (some might be empty strings if trailing comma)

            const newParts = parts.map((part: string) => {
                // part might be "Provider" or "Provider as P" or "type Provider" or empty
                // Cleanup whitespace
                const cleanPart = part.trim();
                if (!cleanPart) return part;

                // Check if this part matches one of our symbols
                // symbols to fix are simple names.
                // If part is "Aliased as X", we check "Aliased" (not X)? No, usually the imported name. 
                // The error says "'Commitment' is a type".
                // If we have "import { Commitment as C }", the error refers to 'Commitment'.

                // Simple space split to get the imported name
                const importedName = cleanPart.split(/\s+as\s+/)[0].trim();
                const hasType = cleanPart.startsWith('type ');

                if (symbols.has(importedName) && !hasType) {
                    changedBody = true;
                    return `type ${cleanPart}`;
                }
                return part; // No change
            });

            if (changedBody) {
                modified = true;
                // Reconstruct imports inside { }
                // match format usually preserves newlines? capturing group 1 captures raw content.
                // Our split/join destroys formatting (newlines, etc).
                // To preserve formatting would be harder with regex.
                // But we need to be effective. 
                // If the original had newlines, we might flatten it. User might accept flattening for now or we try to respect it.
                // A simple join(', ') is standard.
                return `import { ${newParts.join(', ')} } from '${modulePath}'`;
            }

            return match;
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf-8');
        } else {
            console.warn(`Could not auto-fix ${relativePath} using regex strategy.`);
        }
    }

    return true;
}

async function main() {
    // Run loop in case fixing one reveals another (though usually they all show up)
    // Next.js build might stop after some errors, so we loop.
    let attempt = 1;
    const maxAttempts = 5;

    while (attempt <= maxAttempts) {
        console.log(`\n--- Attempt ${attempt}/${maxAttempts} ---`);
        const log = await runBuildAndCaptureErrors();

        if (log.includes("Compiled successfully")) {
            console.log("Build success!");
            break;
        }

        const applied = applyFixes(log);
        if (!applied) {
            console.log("No more fixable type errors found (or build failed for other reasons).");
            console.log(log.slice(-500)); // Show tail of log
            break;
        }
        attempt++;
    }
}

main().catch(console.error);
