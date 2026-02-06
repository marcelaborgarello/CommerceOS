import { expect, test, describe, mock, beforeEach } from "bun:test";

// Mock de next/navigation
const mockRedirect = mock(() => { });
mock.module("next/navigation", () => ({
    redirect: mockRedirect
}));

// Mock de next/cache
const mockRevalidatePath = mock(() => { });
mock.module("next/cache", () => ({
    revalidatePath: mockRevalidatePath
}));

// Mock de Supabase
const mockSignInWithPassword = mock(() => Promise.resolve({ error: null as any }));
const mockSignUp = mock(() => Promise.resolve({ error: null as any }));
const mockSignInWithOtp = mock(() => Promise.resolve({ error: null as any }));

const mockSupabase = {
    auth: {
        signInWithPassword: mockSignInWithPassword,
        signUp: mockSignUp,
        signInWithOtp: mockSignInWithOtp
    }
};
mock.module("@/utils/supabase/server", () => ({
    createClient: () => Promise.resolve(mockSupabase)
}));

// Importar la función a testear DESPUÉS de definir los mocks
import { login, signup, sendMagicLink } from "../src/actions/authActions";

describe("Auth Logic", () => {
    beforeEach(() => {
        mockRedirect.mockClear();
        mockRevalidatePath.mockClear();
        mockSignInWithPassword.mockClear();
        mockSignUp.mockClear();
        mockSignInWithOtp.mockClear();
    });

    // ... (tests anteriores de login) ...
    // Nota: El modelo no debe reemplazar los tests existentes de login, solo agregar los nuevos.
    // Como replace_file_content es para bloques contiguos, y quiero agregar al final del bloque existing o modificar el beforeEach, voy a hacer esto en dos pasos o usar multi_replace si fuera necesario disperso.
    // Aquí solo actualizo beforeEach y el resto lo agrego al final del archivo.

    test("login exitoso debe redirigir a /", async () => {
        // Setup del mock para éxito
        mockSignInWithPassword.mockResolvedValueOnce({ error: null });

        const formData = new FormData();
        formData.append("email", "test@test.com");
        formData.append("password", "password123");

        // Ejecutar
        try {
            await login(formData);
        } catch (e) {
            // redirect lanza un error en next.js, pero aquí es un mock
        }

        // Verificaciones
        expect(mockSignInWithPassword).toHaveBeenCalled();
        expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
        expect(mockRedirect).toHaveBeenCalledWith("/");
    });

    test("login fallido debe retornar error", async () => {
        // Setup del mock para error
        mockSignInWithPassword.mockResolvedValueOnce({ error: { message: "Invalid login credentials" } });

        const formData = new FormData();
        formData.append("email", "wrong@test.com");
        formData.append("password", "wrongpass");

        const result = await login(formData);

        expect(result).toEqual({ error: 'Credenciales inválidas' });
        expect(mockRedirect).not.toHaveBeenCalled();
    });

    describe("signup", () => {
        test("registro exitoso debe redirigir", async () => {
            mockSignUp.mockResolvedValueOnce({ error: null });

            const formData = new FormData();
            formData.append("email", "new@test.com");
            formData.append("password", "newpass");

            try {
                await signup(formData);
            } catch (e) { }

            expect(mockSignUp).toHaveBeenCalled();
            expect(mockRedirect).toHaveBeenCalledWith("/");
        });

        test("registro fallido retorna error", async () => {
            mockSignUp.mockResolvedValueOnce({ error: { message: "User already exists" } });

            const formData = new FormData();
            formData.append("email", "exists@test.com");
            formData.append("password", "pass");

            const result = await signup(formData);

            expect(result).toEqual({ error: "User already exists" });
            expect(mockRedirect).not.toHaveBeenCalled();
        });
    });

    describe("sendMagicLink", () => {
        test("retorna error si no hay email", async () => {
            const formData = new FormData();
            // No agregamos email

            const result = await sendMagicLink(formData);
            expect(result).toEqual({ error: 'Por favor ingresá tu email' });
            expect(mockSignInWithOtp).not.toHaveBeenCalled();
        });

        test("envío exitoso retorna success", async () => {
            mockSignInWithOtp.mockResolvedValueOnce({ error: null });

            // Mock de process.env para que NEXT_PUBLIC_APP_URL esté definido (o confiar en el fallback del código)
            // El código usa process.env.NEXT_PUBLIC_APP_URL. Bun permite asignarlo.
            const originalEnv = process.env.NEXT_PUBLIC_APP_URL;
            process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

            const formData = new FormData();
            formData.append("email", "magic@test.com");

            const result = await sendMagicLink(formData);

            expect(mockSignInWithOtp).toHaveBeenCalled();
            // Verificamos que se llame con el redirect URL correcto
            expect(mockSignInWithOtp).toHaveBeenCalledWith(expect.objectContaining({
                email: "magic@test.com",
                options: expect.objectContaining({
                    emailRedirectTo: "http://localhost:3000/auth/callback"
                })
            }));

            expect(result).toEqual({ success: true, message: '¡Revisá tu email! Te enviamos un link para ingresar.' });

            // Cleanup env
            process.env.NEXT_PUBLIC_APP_URL = originalEnv;
        });

        test("fallo en supabase retorna error amigable", async () => {
            mockSignInWithOtp.mockResolvedValueOnce({ error: { message: "Rate limit exceeded" } });

            const formData = new FormData();
            formData.append("email", "limit@test.com");

            const result = await sendMagicLink(formData);

            expect(result).toEqual({ error: 'No se pudo enviar el email. Verificá tu dirección.' });
        });
    });
});
