export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16">
      <div className="">
        {children}
      </div>
    </section>
  );
}
