import { auth0 } from "../lib/auth0";
import ChatClient from './components/chat-client';

export default auth0.withPageAuthRequired(
  async function Chat() {
    const session = await auth0.getSession();
    const user = session?.user;

    return <ChatClient user={user!} />;
  },
  { returnTo: "/" }
);
