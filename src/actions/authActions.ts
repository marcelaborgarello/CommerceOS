'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
  try {
    const supabase = await createClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: 'Credenciales inválidas' };
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('Supabase credentials missing')) {
      return { error: 'Error de Configuración: Faltan variables de entorno en Vercel.' };
    }
    return { error: 'Error inesperado al intentar iniciar sesión.' };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirect to callback if needed, but for now direct is fine
      }
    });

    if (error) {
      return { error: error.message };
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('Supabase credentials missing')) {
      return { error: 'Error de Configuración: Faltan variables de entorno en Vercel.' };
    }
    return { error: 'Error inesperado al intentar registrarse.' };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}


export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function sendMagicLink(formData: FormData) {
  try {
    const supabase = await createClient();
    const email = formData.get('email') as string;

    if (!email) {
      return { error: 'Por favor ingresá tu email' };
    }

    // Get origin from env or construct from headers
    let origin = process.env.NEXT_PUBLIC_APP_URL;

    if (!origin) {
      const headersList = await import('next/headers').then(m => m.headers());
      const host = headersList.get('host');
      const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
      origin = `${protocol}://${host}`;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Magic link error:', error);
      return { error: 'No se pudo enviar el email. Verificá tu dirección.' };
    }

    return { success: true, message: '¡Revisá tu email! Te enviamos un link para ingresar.' };
  } catch (e) {
    console.error('Magic link exception:', e);
    return { error: 'Error inesperado al enviar el email.' };
  }
}

export async function loginWithGoogle() {
  const supabase = await createClient();

  // Get origin from env or construct from headers
  let origin = process.env.NEXT_PUBLIC_APP_URL;

  if (!origin) {
    // Fallback: construct from request headers
    const headersList = await import('next/headers').then(m => m.headers());
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    origin = `${protocol}://${host}`;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('Google OAuth error:', error);
    redirect('/login?error=No se pudo autenticar con Google. Intentá de nuevo.');
  }

  if (data.url) {
    redirect(data.url);
  }

  // Fallback if no URL returned
  redirect('/login?error=Error inesperado con Google OAuth');
}
