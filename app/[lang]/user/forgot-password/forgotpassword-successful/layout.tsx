export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col h-screen bg-white dark:bg-slate-800">
      <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">{children}</main>
    </div>
  );
}
