import type { DealCountdownData, Locale } from "@/types/tenant"
import { searchProductsByFilter } from "@/app/api/services/productService"
import DealCountdown from "./DealCountdown"

interface DealCountdownWrapperProps {
  data: DealCountdownData
  locale: Locale
  template?: 1 | 2 | 3
}

export default async function DealCountdownWrapper({
  data,
  locale,
  template = 1
}: DealCountdownWrapperProps) {
  let products = null

  try {
    // Fetch products with discounts
    const result = await searchProductsByFilter({
      filter: {},
      pageSize: 8,
      page: 1,
      sortBy: "featured"
    })

    // Filter only products with discount prices
    products = result.items?.filter(p => p.discountPrice && p.discountPrice > 0) || []
  } catch (e) {
    console.error("Failed to load deal products:", e)
  }

  return <DealCountdown data={data} locale={locale} template={template} products={products || []} />
}
