import "../../globals.css";


export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col">
      {children}
    </div>
  );
}