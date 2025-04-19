"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Input, Textarea } from "@heroui/input";

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // In a real application, you would handle form submission here
    setFormSubmitted(true);
  };

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <div className="flex items-center text-sm text-muted-foreground">
          <Link className="hover:text-primary" href="/">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>Contact</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardBody className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>

              {formSubmitted ? (
                <div className="bg-primary/10 text-primary p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-lg mb-2">Thank You!</h3>
                  <p>
                    Your message has been sent successfully. We&apos;ll get back
                    to you as soon as possible.
                  </p>
                </div>
              ) : (
                <form className="space-y-10" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Input
                        required
                        id="first-name"
                        label="First Name"
                        labelPlacement="outside"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-1">
                      <Input
                        required
                        id="last-name"
                        label="Last Name"
                        labelPlacement="outside"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <Input
                    required
                    id="email"
                    label="Email"
                    labelPlacement="outside"
                    placeholder="john.doe@example.com"
                    type="email"
                  />

                  <Input
                    id="phone"
                    label="Phone (Optional)"
                    labelPlacement="outside"
                    placeholder="(123) 456-7890"
                    type="tel"
                  />

                  <div className="space-y-1">
                    <Textarea
                      required
                      className="min-h-[150px]"
                      id="message"
                      label="Message"
                      labelPlacement="outside"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <Button className="w-full sm:w-auto" type="submit">
                    Send Message
                  </Button>
                </form>
              )}
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <CardBody className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Address</h3>
                    <address className="not-italic text-muted-foreground">
                      123 Pet Street
                      <br />
                      Dogville, NY 10001
                      <br />
                      United States
                    </address>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-muted-foreground">
                      <a className="hover:text-primary" href="tel:+11234567890">
                        +1 (123) 456-7890
                      </a>
                    </p>
                    <p className="text-muted-foreground">
                      <a className="hover:text-primary" href="tel:+18005551234">
                        +1 (800) 555-1234
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">
                      <a
                        className="hover:text-primary"
                        href="mailto:info@petdo.com"
                      >
                        info@petdo.com
                      </a>
                    </p>
                    <p className="text-muted-foreground">
                      <a
                        className="hover:text-primary"
                        href="mailto:support@petdo.com"
                      >
                        support@petdo.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Business Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Friday: 9am - 6pm
                    </p>
                    <p className="text-muted-foreground">
                      Saturday: 10am - 4pm
                    </p>
                    <p className="text-muted-foreground">Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="mt-6">
            <Card>
              <CardBody className="p-6">
                <h2 className="text-xl font-semibold mb-4">Follow Us</h2>
                <div className="flex gap-4">
                  <span
                    aria-label="Facebook"
                    className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    <span className="sr-only">Facebook</span>
                  </span>
                  <span
                    aria-label="Instagram"
                    className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect height="20" rx="5" ry="5" width="20" x="2" y="2" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span className="sr-only">Instagram</span>
                  </span>
                  <span
                    aria-label="Twitter"
                    className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                    <span className="sr-only">Twitter</span>
                  </span>
                  <span
                    aria-label="LinkedIn"
                    className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                      <rect height="12" width="4" x="2" y="9" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    <span className="sr-only">LinkedIn</span>
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Find Us</h2>
        <div className="h-[400px] bg-muted rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground">Map would be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
