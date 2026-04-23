import AppBar from "@/components/AppBar";
import TabBar from "@/components/TabBar";

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-app-bg flex justify-center">
      <div className="w-full max-w-[500px] flex flex-col min-h-screen">
        <AppBar title={title} />
        <div className="flex-1 flex flex-col items-center justify-center px-5 pb-28 gap-4">
          <div className="w-16 h-16 rounded-full bg-app-grey flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#55647B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="text-center">
            <h2 className="font-outfit font-medium text-app-black text-lg mb-1">{title}</h2>
            <p className="font-outfit text-app-icon text-sm leading-relaxed max-w-xs">
              This section is coming soon. Continue prompting to build out this page's content.
            </p>
          </div>
        </div>
        <TabBar />
      </div>
    </div>
  );
}
