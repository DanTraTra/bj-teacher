export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export default {
  // The scheduled handler is invoked by Cron Triggers
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      console.log(`Cron triggered at ${new Date(event.scheduledTime).toISOString()}`);

      const { SUPABASE_URL, SUPABASE_ANON_KEY } = env;

      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('Missing Supabase URL or Anon Key environment variables');
      }

      // We just need to make a valid request to keep it alive. Let's fetch 1 row from userscore.
      const response = await fetch(`${SUPABASE_URL}/rest/v1/userscore?select=id&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ping Supabase: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Successfully pinged Supabase! Response data:', JSON.stringify(data));

    } catch (error: any) {
      console.error('Error during scheduled event:', error.message);
    }
  },

  // Also expose a manual fetch endpoint just in case you want to test it via browser
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/ping') {
      try {
        const { SUPABASE_URL, SUPABASE_ANON_KEY } = env;
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
          return new Response('Missing configuration', { status: 500 });
        }

        const res = await fetch(`${SUPABASE_URL}/rest/v1/userscore?select=id&limit=1`, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          return new Response('Pong! Supabase successfully pinged.', { status: 200 });
        } else {
          return new Response(`Ping failed with status: ${res.status}`, { status: 500 });
        }
      } catch (err: any) {
        return new Response(`Error: ${err.message}`, { status: 500 });
      }
    }
    return new Response('Not found', { status: 404 });
  }
};
