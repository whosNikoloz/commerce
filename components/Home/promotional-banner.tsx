import { Button } from "@/components/ui/button"

export function PromotionalBanner() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-50 rounded-3xl overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                    {/* Image Side */}
                    <div className="relative h-64 md:h-96">
                        <img src="/winter-fashion-campaign.png" alt="Winter Collection" className="w-full h-full object-cover" />
                    </div>

                    {/* Content Side */}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                        <div className="space-y-6">
                            <div>
                                <p className="font-sans text-cyan-500 font-semibold text-sm uppercase tracking-wide mb-2">
                                    Limited Winter Edit
                                </p>
                                <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-700 mb-4">
                                    Embrace the Season in Style
                                </h2>
                                <p className="font-sans text-slate-600 text-lg leading-relaxed">
                                    Discover our curated winter collection featuring premium materials and timeless designs. Only
                                    available until Sunday.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-sans font-semibold px-8">
                                    Shop the Collection
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-slate-300 text-slate-700 hover:bg-slate-100 font-sans bg-transparent"
                                >
                                    View Lookbook
                                </Button>
                            </div>

                            <p className="font-sans text-sm text-slate-500">
                                Free shipping on orders over $150 • Easy returns within 30 days
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
