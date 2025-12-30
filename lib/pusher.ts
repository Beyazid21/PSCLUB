import Pusher from 'pusher';
import PusherClient from 'pusher-js';

// Server-side Pusher (only if configured)
export const pusherServer = process.env.PUSHER_APP_ID 
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    })
  : null as any; // Fallback

// Client-side Pusher (only if configured)
export const pusherClient = process.env.NEXT_PUBLIC_PUSHER_KEY
  ? new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      }
    )
  : null as any; // Fallback
