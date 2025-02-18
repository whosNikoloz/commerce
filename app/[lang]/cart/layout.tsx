export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="">
      <div className="">{children}</div>
    </section>
  );
}
