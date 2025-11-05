import { auth0 } from "../lib/auth0";
import ChatClient from './components/chat-client';

// todo: inspect if we need to adjust for latest auth0-nextjs version changes
// https://github.com/auth0/nextjs-auth0/blob/v4.9.0/V4_MIGRATION_GUIDE.md?plain=1#L149
// any caste works around next.js build issue for now...
export default auth0.withPageAuthRequired(
  async function Chat() {
    const session = await auth0.getSession();
    const user = session?.user;

    return <ChatClient user={user!} />;
  },
  { returnTo: "/" }
) as any;
