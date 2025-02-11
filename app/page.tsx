import { Chat } from "@/components/chat/chat";
import { Header } from "@/components/site-header";

export default function ResearchPage() {
  return (
    <div>
      <main className="flex flex-col h-screen items-center p-4 bg-background">
        <Header />
        <Chat id="research" initialMessages={[]} />
      </main>
    </div>
  );
}
