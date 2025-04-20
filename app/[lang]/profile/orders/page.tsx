import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PayementPage PetDo</h1>
        <div className="flex items-center text-sm text-muted-foreground">
          <Link className="hover:text-primary" href="/en/profile/payment">
            payment
          </Link>
          <span className="mx-2">/</span>
          <span>PayementPage</span>
        </div>
      </div>
    </div>
  );
}
