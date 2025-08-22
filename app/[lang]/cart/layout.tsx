
export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="">{children}</div>
    </section>
  );
}
