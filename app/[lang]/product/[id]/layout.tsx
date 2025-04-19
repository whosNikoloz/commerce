export default function DetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section className="md:mt-10 mt-0">{children}</section>;
}
