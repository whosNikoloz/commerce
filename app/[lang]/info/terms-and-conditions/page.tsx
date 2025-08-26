"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Award, Users, Truck, PawPrint, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@heroui/button";

function ValueCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-lg border p-6 text-center">
      <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{children}</p>
    </div>
  );
}

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function TeamCard({
  name,
  role,
  image,
  alt,
}: {
  name: string;
  role: string;
  image: string;
  alt?: string;
}) {
  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="relative h-64 w-full">
        <Image
          fill
          alt={alt || name}
          className="object-cover"
          src={image || "/placeholder.svg"}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 300px"
          priority={false}
        />
      </div>
      <div className="p-4 text-center">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="container px-4 py-20 md:px-6 md:py-12 mx-auto">
      {/* Breadcrumbs */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">About PetDo</h1>
        <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
          <Link className="hover:text-primary" href="/">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span aria-current="page">About</span>
        </nav>
      </div>

      {/* Hero / Story */}
      <section className="grid md:grid-cols-2 gap-8 items-center mb-12">
        <div>
          <h2 className="text-3xl font-bold mb-4">Our Story</h2>
          <p className="text-muted-foreground mb-4">
            Founded in 2015, PetDo began with a simple mission: make pet parenting easier and more joyful
            with premium, fairly priced essentials.
          </p>
          <p className="text-muted-foreground mb-4">
            From a small neighborhood shop to a trusted online destination, our passion for animals drives
            every decision—from how we curate products to how we support our community.
          </p>
          <p className="text-muted-foreground">
            Every product we stock is vetted for quality, safety, and value. If we wouldn’t use it with our
            own pets, it doesn’t make the cut.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <Stat value="250k+" label="Orders Delivered" />
            <Stat value="50k+" label="Happy Pet Parents" />
            <Stat value="1,200+" label="Curated Products" />
            <Stat value="2015" label="Since" />
          </div>
        </div>

        <div className="relative h-[300px] md:h-[420px] rounded-lg overflow-hidden">
          <Image
            fill
            alt="PetDo team with happy dogs"
            className="object-cover"
            src="https://picsum.photos/id/1011/900/600"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </section>

      {/* Trust strip */}
      <section className="mb-16">
        <div className="rounded-lg border bg-card px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-sm">Secure Payments</span>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-primary" />
            <span className="text-sm">Fast & Tracked Shipping</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm">Easy 30-Day Returns</span>
          </div>
          <div className="flex items-center gap-3">
            <PawPrint className="h-5 w-5 text-primary" />
            <span className="text-sm">Vet-Reviewed Picks</span>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mb-16" aria-labelledby="values-heading">
        <div className="text-center mb-10">
          <h2 id="values-heading" className="text-3xl font-bold mb-4">
            Our Values
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Principles that guide our catalog, service, and community.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ValueCard icon={<Heart className="h-6 w-6" />} title="Pet Wellbeing">
            We champion products that support health, enrichment, and safety for every pet.
          </ValueCard>
          <ValueCard icon={<Award className="h-6 w-6" />} title="Quality Assurance">
            We rigorously vet brands and batch-test to maintain high standards.
          </ValueCard>
          <ValueCard icon={<Users className="h-6 w-6" />} title="Customer Focus">
            Real humans, real help—before and after your order.
          </ValueCard>
          <ValueCard icon={<Truck className="h-6 w-6" />} title="Reliability">
            On-time shipping, accurate picking, and responsive support.
          </ValueCard>
        </div>
      </section>

      {/* Team */}
      <section className="mb-16" aria-labelledby="team-heading">
        <div className="text-center mb-10">
          <h2 id="team-heading" className="text-3xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The people behind PetDo who keep tails wagging and orders moving.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Sarah Johnson", role: "Founder & CEO", image: "https://picsum.photos/id/1005/600/800" },
            { name: "Michael Chen", role: "Head of Product", image: "https://picsum.photos/id/1012/600/800" },
            { name: "Emily Rodriguez", role: "Customer Experience", image: "https://picsum.photos/id/1001/600/800" },
            { name: "David Kim", role: "Logistics Manager", image: "https://picsum.photos/id/1014/600/800" },
          ].map((m, i) => (
            <TeamCard key={i} name={m.name} role={m.role} image={m.image} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-16" aria-labelledby="faq-heading">
        <div className="text-center mb-10">
          <h2 id="faq-heading" className="text-3xl font-bold mb-4">FAQs</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Quick answers to common questions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              q: "Where do you ship?",
              a: "We ship nationwide with tracked delivery. International shipping is coming soon.",
            },
            {
              q: "What’s your return policy?",
              a: "30-day returns on unused items in original packaging. Start a return from your account.",
            },
            {
              q: "How do you vet products?",
              a: "We review materials, safety data, and feedback—then batch-test before listing.",
            },
            {
              q: "Can I get help choosing?",
              a: "Absolutely. Contact us and our team will recommend items tailored to your pet.",
            },
          ].map((item, idx) => (
            <details key={idx} className="rounded-lg border bg-card p-4">
              <summary className="cursor-pointer font-medium">{item.q}</summary>
              <p className="text-muted-foreground mt-2">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Join the PetDo Family</h2>
        <p className="max-w-2xl mx-auto mb-6">
          Explore premium picks for your furry friends—trusted by thousands of pet parents.
        </p>
        <Button
          color="secondary"
          size="lg"
          onPress={() => router.push("/shop")}
          aria-label="Shop PetDo products"
        >
          Shop Now
        </Button>
      </section>

      {/* JSON-LD SEO */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About PetDo",
            url: "https://example.com/about",
            primaryImageOfPage: "https://example.com/og-about.jpg",
            description:
              "Learn about PetDo—our story, values, team, and why pet parents trust our curated catalog.",
          }),
        }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "PetDo",
            url: "https://example.com",
            logo: "https://example.com/logo.png",
            sameAs: [
              "https://facebook.com/",
              "https://instagram.com/",
              "https://twitter.com/",
              "https://www.linkedin.com/",
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://example.com/" },
              { "@type": "ListItem", position: 2, name: "About", item: "https://example.com/about" },
            ],
          }),
        }}
      />
    </div>
  );
}
