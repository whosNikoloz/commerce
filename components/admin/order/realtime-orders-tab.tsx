'use client';

import { useMemo, useState } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, Package, RefreshCw, Truck, XCircle } from 'lucide-react';

import { OrderStatus } from '@/types/orderTypes';
import { useOrderStream, type ConnectionStatus } from '@/hooks/use-order-stream';
import { useDictionary } from '@/app/context/dictionary-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { currencyFmt } from '@/lib/utils';

interface RealtimeOrdersTabProps {
    token: string;
    domain: string;
}

type EventTypeFilter = 'all' | 'Created' | 'StatusChanged' | 'Cancelled' | 'Paid' | 'PaymentCallback';

function normalizeStatus(status: OrderStatus | string): OrderStatus {
    if (typeof status === 'number') return status;
    const key = String(status);
    const mapped = OrderStatus[key as keyof typeof OrderStatus];

    return typeof mapped === 'number' ? mapped : OrderStatus.Pending;
}

function getStatusIcon(status: OrderStatus) {
    switch (status) {
        case OrderStatus.Pending: return <Clock className="h-4 w-4" />;
        case OrderStatus.Processing: return <RefreshCw className="h-4 w-4" />;
        case OrderStatus.Shipped: return <Truck className="h-4 w-4" />;
        case OrderStatus.Delivered: return <CheckCircle className="h-4 w-4" />;
        case OrderStatus.Cancelled:
        case OrderStatus.Refunded: return <XCircle className="h-4 w-4" />;
        case OrderStatus.Paid: return <CheckCircle className="h-4 w-4" />;
        default: return <Package className="h-4 w-4" />;
    }
}

function getStatusColor(status: OrderStatus) {
    switch (status) {
        case OrderStatus.Pending: return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        case OrderStatus.Processing:
        case OrderStatus.Shipped: return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        case OrderStatus.Delivered:
        case OrderStatus.Paid: return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        case OrderStatus.Cancelled:
        case OrderStatus.Refunded: return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        default: return "bg-gray-100 text-gray-800";
    }
}

function getEventTypeColor(eventType: string) {
    switch (eventType) {
        case 'Created': return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
        case 'StatusChanged': return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        case 'Cancelled': return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        case 'Paid': return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        case 'PaymentCallback': return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
        default: return "bg-gray-100 text-gray-800";
    }
}

function statusLabel(s: OrderStatus, dict: any): string {
    const key = (typeof s === "number" ? OrderStatus[s] : String(s)).toLowerCase();

    return dict.admin.orders.statuses[key] || key;
}

function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
    const dict = useDictionary();
    const t = dict.admin.orders.realtime.connection;

    const config = {
        connected: { color: 'bg-green-500', text: t.live },
        connecting: { color: 'bg-yellow-500', text: t.connecting },
        disconnected: { color: 'bg-gray-400', text: t.disconnected },
        error: { color: 'bg-red-500', text: t.error },
    };

    const { color, text } = config[status];

    return (
        <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${color} animate-pulse`} />
            <span className="text-sm font-medium">{text}</span>
        </div>
    );
}

export default function RealtimeOrdersTab({ token, domain }: RealtimeOrdersTabProps) {
    const dict = useDictionary();
    const t = dict.admin.orders.realtime;
    const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeFilter>('all');

    const { events, connected, error } = useOrderStream({
        token,
        domain,
        maxEvents: 100,
        autoConnect: true,
    });

    const filteredEvents = useMemo(() => {
        if (eventTypeFilter === 'all') return events;

        return events.filter(e => e.eventType === eventTypeFilter);
    }, [events, eventTypeFilter]);

    return (
        <div className="space-y-6">
            {/* Header with connection status and filters */}
            <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-3">
                                <Activity className="h-5 w-5" />
                                {t.title}
                            </CardTitle>
                            <CardDescription>{t.subtitle}</CardDescription>
                        </div>
                        <ConnectionIndicator status={connected} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <select
                            className="h-9 w-56 rounded-md border border-input bg-white dark:bg-slate-800 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring text-slate-900 dark:text-slate-100"
                            value={eventTypeFilter}
                            onChange={(e) => setEventTypeFilter(e.target.value as EventTypeFilter)}
                        >
                            <option value="all">{t.filters.all}</option>
                            <option value="Created">{t.filters.created}</option>
                            <option value="StatusChanged">{t.filters.statusChanged}</option>
                            <option value="Cancelled">{t.filters.cancelled}</option>
                            <option value="Paid">{t.filters.paid}</option>
                            <option value="PaymentCallback">{t.filters.paymentCallback}</option>
                        </select>
                        <span className="text-sm text-muted-foreground">
                            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Error state */}
            {error && connected === 'error' && (
                <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">{t.error.title}</h3>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{t.error.description}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Events feed */}
            <div className="space-y-3">
                {filteredEvents.length === 0 ? (
                    <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur">
                        <CardContent className="pt-6">
                            <div className="text-center py-12">
                                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="font-semibold text-lg mb-2">{t.empty.title}</h3>
                                <p className="text-sm text-muted-foreground">{t.empty.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredEvents.map((event) => (
                        <Card
                            key={event.eventId}
                            className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur hover:shadow-md transition-shadow"
                        >
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        {/* Event header */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge className={getEventTypeColor(event.eventType)}>
                                                {t.eventTypes[event.eventType] || event.eventType}
                                            </Badge>
                                            <span className="font-mono text-sm font-semibold">#{event.orderNumber}</span>
                                            {event.customerName && (
                                                <span className="text-sm text-muted-foreground">
                                                    • {event.customerName}
                                                </span>
                                            )}
                                            <span className="text-sm text-muted-foreground ml-auto">
                                                {new Date(event.timestamp).toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Status transition */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <div className="flex items-center gap-1.5">
                                                {getStatusIcon(normalizeStatus(event.previousStatus))}
                                                <Badge className={getStatusColor(normalizeStatus(event.previousStatus))}>
                                                    {statusLabel(normalizeStatus(event.previousStatus), dict)}
                                                </Badge>
                                            </div>
                                            <span className="text-muted-foreground">→</span>
                                            <div className="flex items-center gap-1.5">
                                                {getStatusIcon(normalizeStatus(event.currentStatus))}
                                                <Badge className={getStatusColor(normalizeStatus(event.currentStatus))}>
                                                    {statusLabel(normalizeStatus(event.currentStatus), dict)}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Description and details */}
                                        {event.description && (
                                            <p className="text-sm text-muted-foreground">{event.description}</p>
                                        )}

                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="font-semibold">{currencyFmt(event.total)}</span>
                                            {event.trackingNumber && (
                                                <span className="text-muted-foreground">
                                                    Tracking: {event.trackingNumber}
                                                </span>
                                            )}
                                            <span className="text-muted-foreground ml-auto">
                                                by {event.changedBy}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
