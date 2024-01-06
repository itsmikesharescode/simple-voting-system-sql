import type { LayoutLoad } from './$types';
import { createBrowserClient, isBrowser, parse } from '@supabase/ssr';

const supabaseURL = import.meta.env.VITE_SUPABASE_URL;
const supabaseKEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
    depends('supabase:auth')

    const supabase = createBrowserClient(supabaseURL, supabaseKEY, {
        global: {
            fetch,
        },  
        cookies: {
            get(key) {
              if (!isBrowser()) {
                return JSON.stringify(data.session)
              }

              const cookie = parse(document.cookie)
              return cookie[key]
            },
        },
    })

    const { data: { session } } = await supabase.auth.getSession()

    return { supabase, session, }
}