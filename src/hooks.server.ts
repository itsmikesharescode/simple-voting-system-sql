
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
const supabaseKEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseAdminKEY = import.meta.env.VITE_SUPABASE_ADMIN_KEY;

export const handle: Handle = async ({ event, resolve, }) => {
    event.locals.supabase = createServerClient(supabaseURL, supabaseKEY, {
        cookies: {
            get: (key) => event.cookies.get(key),
            set: (key, value, options ) => {
                event.cookies.set(key, value, options = { path: "/"} )
            },
            remove: (key, options ) => {
                event.cookies.delete(key, options = { path: "/"} )
            },
        },
    });

    event.locals.supabaseAdmin = createServerClient(supabaseURL, supabaseAdminKEY, {
        cookies: {
            get: (key) => event.cookies.get(key),
            set: (key, value, options ) => {
                event.cookies.set(key, value, options = { path: "/"} )
            },
            remove: (key, options ) => {
                event.cookies.delete(key, options = { path: "/"} )
            },
        },

        auth: {
            autoRefreshToken: false,
            persistSession: false,
        }
    })

    event.locals.getSession = async () => {
        const {
        data: { session },
        } = await event.locals.supabase.auth.getSession()
        return session
    }

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range'
        },
    });
}