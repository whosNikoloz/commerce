"use client";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  User as UserIcon,
  Package,
  Heart,
  Settings,
  Shield,
  CreditCard,
  MapPin,
  Truck,
  Star,
  Eye,
  Trash2,
  ShoppingCart,
  Download,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin as MapPinIcon,
} from "lucide-react";

import type { Order, OrderItem, TrackingStep, WishlistItem } from "./helpers";
import { StatusIcon, demoWishlist, demoOrders } from "./helpers";

// ——— tiny subcomponents kept inline to keep file-count low ———
function UserHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="/diverse-user-avatars.png" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, John!</h1>
          <p className="text-muted-foreground">Manage your account and orders</p>
        </div>
      </div>
    </div>
  );
}

function NotificationArea({
  notifications,
  onDismiss,
}: {
  notifications: Record<string, string>;
  onDismiss: (id: string) => void;
}) {
  if (!notifications || Object.keys(notifications).length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {Object.entries(notifications).map(([orderId, message]) => (
        <div
          key={orderId}
          className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center">✅</span>
            <span className="text-sm text-green-800">{message}</span>
          </div>
          <Button
            className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
            size="sm"
            variant="ghost"
            onClick={() => onDismiss(orderId)}
          >
            ×
          </Button>
        </div>
      ))}
    </div>
  );
}

function DashboardStats() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">+2 from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$1,234.56</div>
          <p className="text-xs text-muted-foreground">+15% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">3 items on sale</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reward Points</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2,450</div>
          <p className="text-xs text-muted-foreground">Expires in 6 months</p>
        </CardContent>
      </Card>
    </div>
  );
}

function RecentOrders({ orders, onView }: { orders: Order[]; onView: (id: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Your latest purchases and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Package className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.date} • {order.items} items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant={
                    order.status === "Delivered"
                      ? "default"
                      : order.status === "Shipped"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {order.status}
                </Badge>
                <p className="font-medium">{order.total}</p>
                <Button size="sm" variant="outline" onClick={() => onView(order.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function OrderHistory({
  orders,
  expandedOrders,
  toggle,
  onTrack,
  onInvoice,
  onReview,
  actions,
}: {
  orders: Order[];
  expandedOrders: string[];
  toggle: (id: string) => void;
  onTrack: (id: string, tracking: string) => void;
  onInvoice: (id: string) => void;
  onReview: (id: string) => void;
  actions: Record<string, boolean>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>View and manage all your orders with detailed tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => {
            const expanded = expandedOrders.includes(order.id);

            return (
              <Collapsible key={order.id} open={expanded}>
                <div className="border rounded-lg">
                  <CollapsibleTrigger asChild>
                    <div
                      className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                      role="button"
                      tabIndex={0}
                      aria-expanded={expanded}
                      onClick={() => toggle(order.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggle(order.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <Package className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{order.id}</p>
                          <p className="text-muted-foreground">Ordered on {order.date}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items} items • {order.total}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            order.status === "Delivered"
                              ? "default"
                              : order.status === "Shipped"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                        {expanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="px-6 pb-6 space-y-6">
                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-3">Order Items</h4>
                        <div className="space-y-3">
                          {order.orderItems.map((item: OrderItem, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                            >
                              <img
                                alt={item.name}
                                className="h-12 w-12 object-cover rounded"
                                src={item.image || "/placeholder.png"}
                              />
                              <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                              <p className="font-semibold">{item.price}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Shipping Information</h4>
                        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{order.shippingAddress}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Tracking: {order.trackingNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Expected: {order.estimatedDelivery}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Order Tracking</h4>
                        <div className="space-y-4">
                          {order.trackingSteps.map((step: TrackingStep, i: number) => (
                            <div key={i} className="flex items-start gap-4">
                              <div className="flex flex-col items-center">
                                <StatusIcon completed={step.completed} status={step.status} />
                                {i < order.trackingSteps.length - 1 && (
                                  <div
                                    className={`w-0.5 h-8 mt-2 ${step.completed ? "bg-green-500" : "bg-gray-200"}`}
                                  />
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex items-center justify-between">
                                  <p
                                    className={`font-medium ${step.completed ? "text-foreground" : "text-muted-foreground"}`}
                                  >
                                    {step.status}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{step.date}</p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          className="flex-1 bg-transparent"
                          disabled={actions[`track-${order.id}`] === true}
                          variant="outline"
                          onClick={() => onTrack(order.id, order.trackingNumber)}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          {actions[`track-${order.id}`] ? "Tracking..." : "Track Package"}
                        </Button>
                        <Button
                          className="flex-1 bg-transparent"
                          disabled={actions[`invoice-${order.id}`] === true}
                          variant="outline"
                          onClick={() => onInvoice(order.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {actions[`invoice-${order.id}`] ? "Downloading..." : "Download Invoice"}
                        </Button>
                        {order.status === "Delivered" && (
                          <Button
                            className="flex-1 bg-transparent"
                            variant="outline"
                            onClick={() => onReview(order.id)}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function WishlistGrid() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Wishlist</CardTitle>
        <CardDescription>Items you&apos;ve saved for later</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {demoWishlist.map((item: WishlistItem) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-4">
              <img
                alt={item.name}
                className="w-full h-48 object-cover rounded-md"
                src={item.image || "/placeholder.png"}
              />
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-lg font-bold text-primary">{item.price}</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button size="icon" variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AccountForms() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input defaultValue="John" id="firstName" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input defaultValue="Doe" id="lastName" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input defaultValue="john.doe@example.com" id="email" type="email" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input defaultValue="+1 (555) 123-4567" id="phone" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
          <CardDescription>Manage your delivery addresses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Home</p>
              <p className="text-sm text-muted-foreground">
                123 Main St, Apt 4B
                <br />
                New York, NY 10001
              </p>
            </div>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </div>
          <Button className="w-full bg-transparent" variant="outline">
            <MapPin className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">•••• •••• •••• 1234</p>
              <p className="text-sm text-muted-foreground">Expires 12/26</p>
            </div>
            <Badge>Default</Badge>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </div>
          <Button className="w-full bg-transparent" variant="outline">
            <CreditCard className="h-4 w-4 mr-2" />
            Add New Card
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive order updates</p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Manage
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Privacy Settings</p>
                <p className="text-sm text-muted-foreground">Control your data</p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function UserPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [orderActions, setOrderActions] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState<Record<string, string>>({});
  const orders: Order[] = demoOrders;

  const toggleOrderExpansion = (id: string) =>
    setExpandedOrders((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const handleTrackPackage = (orderId: string, trackingNumber: string) => {
    setOrderActions((p) => ({ ...p, [`track-${orderId}`]: true }));
    setTimeout(() => {
      setNotifications((p) => ({ ...p, [orderId]: `Tracking updated for ${trackingNumber}` }));
      setOrderActions((p) => ({ ...p, [`track-${orderId}`]: false }));
    }, 1500);
  };

  const handleDownloadInvoice = (orderId: string) => {
    setOrderActions((p) => ({ ...p, [`invoice-${orderId}`]: true }));
    setTimeout(() => {
      const link = document.createElement("a");

      link.href = `data:text/plain;charset=utf-8,Invoice for Order ${orderId}
Date: ${new Date().toLocaleDateString()}
Thank you for your purchase!`;
      link.download = `invoice-${orderId}.txt`;
      link.click();
      setOrderActions((p) => ({ ...p, [`invoice-${orderId}`]: false }));
      setNotifications((p) => ({ ...p, [orderId]: `Invoice downloaded for ${orderId}` }));
    }, 1000);
  };

  const handleLeaveReview = (orderId: string) =>
    setNotifications((p) => ({ ...p, [orderId]: `Review form opened for ${orderId}` }));

  const handleViewOrder = (orderId: string) => {
    setActiveTab("orders");
    setTimeout(() => toggleOrderExpansion(orderId), 100);
  };

  const dismissNotification = (orderId: string) =>
    setNotifications((p) => {
      const n = { ...p };

      delete n[orderId];

      return n;
    });

  return (
    <div className="min-h-screen  ">
      <div className="container mx-auto my-20">
        <UserHeader />
        <NotificationArea notifications={notifications} onDismiss={dismissNotification} />

        <Tabs className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-fit">
            <TabsTrigger className="flex items-center gap-2" value="dashboard">
              <UserIcon className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="orders">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="wishlist">
              <Heart className="h-4 w-4" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="account">
              <Settings className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="support">
              <Shield className="h-4 w-4" />
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent className="space-y-6" value="dashboard">
            <DashboardStats />
            <RecentOrders orders={orders} onView={handleViewOrder} />
          </TabsContent>

          <TabsContent className="space-y-6" value="orders">
            <OrderHistory
              actions={orderActions}
              expandedOrders={expandedOrders}
              orders={orders}
              toggle={toggleOrderExpansion}
              onInvoice={handleDownloadInvoice}
              onReview={handleLeaveReview}
              onTrack={handleTrackPackage}
            />
          </TabsContent>

          <TabsContent className="space-y-6" value="wishlist">
            <WishlistGrid />
          </TabsContent>

          <TabsContent className="space-y-6" value="account">
            <AccountForms />
          </TabsContent>

          <TabsContent className="space-y-6" value="support">
            {/* Help Center + Contact */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Help Center</CardTitle>
                  <CardDescription>Find answers to common questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Order & Shipping
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payment & Billing
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Returns & Refunds
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>Get help from our team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                      id="message"
                      placeholder="Describe your issue..."
                    />
                  </div>
                  <Button className="w-full">Send Message</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
