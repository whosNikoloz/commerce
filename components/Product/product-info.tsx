"use client"

import { ShoppingCart, Truck } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Condition, StockStatus } from "@/types/enums"

interface ProductInfoProps {
  price: number
  originalPrice: number | null
  brand?: string
  discount?: number
  condition?: Condition
  status?: StockStatus
  onAddToCart?: () => void
  onWishlist?: () => void
  onBuyNow?: () => void
}

const getConditionLabel = (condition?: Condition) => {
  switch (condition) {
    case Condition.New:
      return "ახალი"
    case Condition.Used:
      return "მეორადი"
    case Condition.LikeNew:
      return "როგორც ახალი"
    default:
      return "უცნობი მდგომარეობა"
  }
}

const getStatusLabel = (status?: StockStatus) => {
  switch (status) {
    case StockStatus.InStock:
      return "მარაგშია"
    case StockStatus.OutOfStock:
      return "არ არის მარაგში"
    default:
      return "უცნობი სტატუსი"
  }
}

function formatPrice(v: number) {
  return v.toFixed(2) + " ₾"
}

export function ProductInfo({
  price,
  originalPrice,
  discount,
  brand,
  condition,
  status,
  onAddToCart,
  onWishlist,
  onBuyNow,
}: ProductInfoProps) {
  // derive discount if missing (only when originalPrice is valid and greater than price)
  const computedDiscount =
    discount ??
    (originalPrice && originalPrice > 0 && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0)

  const hasDiscount = !!originalPrice && originalPrice > price && computedDiscount > 0
  const isOut = status === StockStatus.OutOfStock

  const statusBadge = (
    <Badge
      className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold leading-none shadow-sm ${isOut ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
        }`}
      title={getStatusLabel(status)}
    >
      {getStatusLabel(status)}
    </Badge>
  )

  const conditionBadge =
    condition != null ? (
      <Badge
        className="inline-flex h-7 items-center rounded-full border border-white/15 bg-white/5 px-3 text-xs font-medium leading-none text-white/85"
        title={getConditionLabel(condition)}
      >
        {getConditionLabel(condition)}
      </Badge>
    ) : null

  return (
    <div className="space-y-6 ">
      <div className="md:sticky relative md:top-20 max-w-64 p-6 rounded-lg shadow-sm border dark:bg-brand-muteddark bg-brand-muted">
        <div className="mb-2">
          {/* price / old / discount */}
          <div className="min-w-0 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <span className="text-2xl font-extrabold leading-none">{formatPrice(price)}</span>
            <div className="flex items-center gap-2">
              {hasDiscount && (
                <>
                  <span className="text-sm text-muted-foreground line-through leading-none">
                    {formatPrice(originalPrice!)}
                  </span>
                  <Badge className="inline-flex h-6 items-center rounded-md px-2 text-[11px] font-semibold leading-none bg-red-500 text-white">
                    {"-" + computedDiscount + "%"}
                  </Badge>
                </>
              )}
            </div>
          </div>
          {/* status + condition on a new line */}
          <div className="mt-2 flex items-center justify-between gap-2">
            {statusBadge}
            {conditionBadge}
          </div>
        </div>

        {/* delivery info */}
        {!isOut && (
          <div className="mt-3 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border">
              <Truck className="h-4 w-4" />
            </span>
            <span className="text-foreground/90">სწრაფი მიწოდება მთელ საქართველოში</span>
          </div>
        )}

        {/* mobile actions */}
        <div className="md:hidden space-y-2 mt-4">
          <Button
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md disabled:opacity-60"
            onClick={onAddToCart}
            disabled={isOut}
            aria-disabled={isOut}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{isOut ? "ამოიწურა" : "კალათაში დამატება"}</span>
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="w-full flex items-center justify-center bg-black hover:bg-gray-800 text-white py-3 rounded-md disabled:opacity-60"
              onClick={onBuyNow}
              disabled={isOut}
              aria-disabled={isOut}
            >
              <span>ყიდვა</span>
            </Button>
          </div>
        </div>

        {/* desktop actions */}
        <div className="hidden md:block mt-4 space-y-3">
          <Button
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md disabled:opacity-60"
            onClick={onAddToCart}
            disabled={isOut}
            aria-disabled={isOut}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{isOut ? "ამოიწურა" : "დამატება"}</span>
          </Button>
          <Button
            className="w-full flex items-center justify-center bg-black hover:bg-gray-800 text-white py-3 rounded-md disabled:opacity-60"
            onClick={onBuyNow}
            disabled={isOut}
            aria-disabled={isOut}
          >
            <span>ყიდვა</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
