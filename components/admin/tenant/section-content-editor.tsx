"use client";

import type { LocalizedText } from "@/types/tenant";

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { IconLanguage, IconPhoto } from "@tabler/icons-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SectionContentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: string;
  sectionData: any;
  onSave: (updatedData: any) => void;
  inline?: boolean;
}

export default function SectionContentEditor({
  isOpen,
  onClose,
  sectionType,
  sectionData,
  onSave,
  inline = false,
}: SectionContentEditorProps) {
  const [data, setData] = useState<any>(sectionData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inline ? true : isOpen) {
      setData(JSON.parse(JSON.stringify(sectionData)));
    }
  }, [isOpen, inline, sectionData]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSave(data);
      toast.success("Section content updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update section content");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateLocalizedText = (path: string[], locale: "ka" | "en", value: string) => {
    setData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) current = current[path[i]];
      const lastKey = path[path.length - 1];
      if (!current[lastKey]) current[lastKey] = { ka: "", en: "" };
      current[lastKey][locale] = value;
      return newData;
    });
  };

  const updateSimpleField = (path: string[], value: any) => {
    setData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) current = current[path[i]];
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  const getSectionLabel = (type: string) => type.replace(/([A-Z])/g, " $1").trim();

  const renderLocalizedInput = (
    label: string,
    path: string[],
    value: LocalizedText,
    multiline = false,
  ) => {
    return (
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <IconLanguage className="h-4 w-4" />
          {label}
        </Label>
        <Tabs defaultValue="en">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="ka">ქართული</TabsTrigger>
          </TabsList>
          <TabsContent className="mt-3" value="en">
            {multiline ? (
              <Textarea
                placeholder={`${label} in English`}
                rows={3}
                value={value?.en || ""}
                onChange={(e) => updateLocalizedText(path, "en", e.target.value)}
              />
            ) : (
              <Input
                placeholder={`${label} in English`}
                value={value?.en || ""}
                onChange={(e) => updateLocalizedText(path, "en", e.target.value)}
              />
            )}
          </TabsContent>
          <TabsContent className="mt-3" value="ka">
            {multiline ? (
              <Textarea
                placeholder={`${label} in Georgian`}
                rows={3}
                value={value?.ka || ""}
                onChange={(e) => updateLocalizedText(path, "ka", e.target.value)}
              />
            ) : (
              <Input
                placeholder={`${label} in Georgian`}
                value={value?.ka || ""}
                onChange={(e) => updateLocalizedText(path, "ka", e.target.value)}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderContentFields = () => {
    switch (sectionType) {
      case "HeroWithSearch":
        return (
          <div className="space-y-6">
            {renderLocalizedInput("Headline", ["headline"], data.headline)}
            {renderLocalizedInput("Subheadline", ["subheadline"], data.subheadline, true)}
            {renderLocalizedInput("Search Placeholder", ["searchPlaceholder"], data.searchPlaceholder)}
            {data.promoBadge && renderLocalizedInput("Promo Badge", ["promoBadge"], data.promoBadge)}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <IconPhoto className="h-4 w-4" />
                Image URL
              </Label>
              <Input
                placeholder="https://example.com/hero-image.jpg"
                value={data.imageUrl || ""}
                onChange={(e) => updateSimpleField(["imageUrl"], e.target.value)}
              />
            </div>
          </div>
        );

      case "HeroLifestyle":
        return (
          <div className="space-y-6">
            {renderLocalizedInput("Headline", ["headline"], data.headline)}
            {renderLocalizedInput("Subheadline", ["subheadline"], data.subheadline, true)}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <IconPhoto className="h-4 w-4" />
                Image URL
              </Label>
              <Input
                placeholder="https://example.com/hero-image.jpg"
                value={data.imageUrl || ""}
                onChange={(e) => updateSimpleField(["imageUrl"], e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Overlay Opacity (0-1)</Label>
              <Input
                max="1"
                min="0"
                step="0.1"
                type="number"
                value={data.overlayOpacity || 0.3}
                onChange={(e) => updateSimpleField(["overlayOpacity"], parseFloat(e.target.value))}
              />
            </div>
          </div>
        );

      case "HeroBanner":
        return (
          <div className="space-y-6">
            {renderLocalizedInput("Headline", ["headline"], data.headline)}
            {data.subheadline && renderLocalizedInput("Subheadline", ["subheadline"], data.subheadline, true)}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <IconPhoto className="h-4 w-4" />
                Background Image URL
              </Label>
              <Input
                placeholder="https://example.com/background.jpg"
                value={data.backgroundImage || ""}
                onChange={(e) => updateSimpleField(["backgroundImage"], e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <IconPhoto className="h-4 w-4" />
                Mobile Background Image URL (optional)
              </Label>
              <Input
                placeholder="https://example.com/background-mobile.jpg"
                value={data.mobileBackgroundImage || ""}
                onChange={(e) => updateSimpleField(["mobileBackgroundImage"], e.target.value)}
              />
            </div>
            {data.badge && renderLocalizedInput("Badge", ["badge"], data.badge)}
          </div>
        );

      case "CategoryGrid":
        return (
          <div className="space-y-6">
            {renderLocalizedInput("Title", ["title"], data.title)}
            <div className="rounded-lg border border-brand-muted dark:border-brand-muteddark bg-brand-muted/20 dark:bg-brand-muteddark/20 p-4">
              <p className="text-sm text-text-subtle dark:text-text-subtledark">
                <strong>Note:</strong> Category items editing requires advanced interface. Contact
                developer for category management.
              </p>
              <p className="mt-2 text-xs text-text-subtle dark:text-text-subtledark">
                Current categories: {data.categories?.length || 0}
              </p>
            </div>
          </div>
        );

      case "ProductRailLaptops":
      case "ProductRailPhones":
      case "ProductRailNewArrivals":
      case "ProductRailBestSofas":
      case "ProductRailBestRated":
        return (
          <div className="space-y-6">
            {renderLocalizedInput("Title", ["title"], data.title)}
            {data.subtitle && renderLocalizedInput("Subtitle", ["subtitle"], data.subtitle)}
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                placeholder="laptops, phones, etc."
                value={data.category || ""}
                onChange={(e) => updateSimpleField(["category"], e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Product Limit</Label>
              <Input
                min="1"
                type="number"
                value={data.limit || 4}
                onChange={(e) => updateSimpleField(["limit"], parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>View All Link</Label>
              <Input
                placeholder="/category/laptops"
                value={data.viewAllHref || ""}
                onChange={(e) => updateSimpleField(["viewAllHref"], e.target.value)}
              />
            </div>
          </div>
        );

      case "DealCountdown":
        return (
          <div className="space-y-6">
            {renderLocalizedInput("Title", ["title"], data.title)}
            <div className="space-y-2">
              <Label>Countdown End Date/Time (ISO)</Label>
              <Input
                type="datetime-local"
                value={data.endsAtISO ? new Date(data.endsAtISO).toISOString().slice(0, 16) : ""}
                onChange={(e) => updateSimpleField(["endsAtISO"], new Date(e.target.value).toISOString())}
              />
            </div>
            <div className="rounded-lg border border-brand-muted dark:border-brand-muteddark bg-brand-muted/20 dark:bg-brand-muteddark/20 p-4">
              <p className="text-sm text-text-subtle dark:text-text-subtledark">
                <strong>Note:</strong> Deal items editing requires advanced interface.
              </p>
              <p className="mt-2 text-xs text-text-subtle dark:text-text-subtledark">
                Current deal items: {data.dealItems?.length || 0}
              </p>
            </div>
          </div>
        );

      case "Reviews":
      case "ReviewsWarranty":
      case "ReviewsWall":
        return (
          <div className="space-y-6">
            {renderLocalizedInput("Title", ["title"], data.title)}
            <div className="rounded-lg border border-brand-muted dark:border-brand-muteddark bg-brand-muted/20 dark:bg-brand-muteddark/20 p-4">
              <p className="text-sm text-text-subtle dark:text-text-subtledark">
                <strong>Note:</strong> Reviews editing requires advanced interface.
              </p>
              <p className="mt-2 text-xs text-text-subtle dark:text-text-subtledark">
                Current reviews: {data.reviews?.length || 0}
              </p>
            </div>
          </div>
        );

      case "NewsletterApp":
      case "Newsletter":
      case "NewsletterBeauty":
        return (
          <div className="space-y-6">
            {renderLocalizedInput("Title", ["title"], data.title)}
            {renderLocalizedInput("Description", ["description"], data.description, true)}
            {renderLocalizedInput("Email Placeholder", ["emailPlaceholder"], data.emailPlaceholder)}
            {renderLocalizedInput("CTA Button Label", ["ctaLabel"], data.ctaLabel)}
            {data.privacyNote && renderLocalizedInput("Privacy Note", ["privacyNote"], data.privacyNote)}
          </div>
        );

      case "TrustBadges":
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-brand-muted dark:border-brand-muteddark bg-brand-muted/20 dark:bg-brand-muteddark/20 p-4">
              <p className="text-sm text-text-subtle dark:text-text-subtledark">
                <strong>Note:</strong> Trust badges editing requires advanced interface.
              </p>
              <p className="mt-2 text-xs text-text-subtle dark:text-text-subtledark">
                Current badges: {data.badges?.length || 0}
              </p>
            </div>
          </div>
        );

      case "BrandStrip":
        return (
          <div className="space-y-6">
            {data.title && renderLocalizedInput("Title", ["title"], data.title)}
            <div className="rounded-lg border border-brand-muted dark:border-brand-muteddark bg-brand-muted/20 dark:bg-brand-muteddark/20 p-4">
              <p className="text-sm text-text-subtle dark:text-text-subtledark">
                <strong>Note:</strong> Brand items editing requires advanced interface.
              </p>
              <p className="mt-2 text-xs text-text-subtle dark:text-text-subtledark">
                Current brands: {data.brands?.length || 0}
              </p>
            </div>
          </div>
        );

      case "BrandStory":
        return (
          <div className="space-y-6">
            {renderLocalizedInput("Title", ["title"], data.title)}
            {renderLocalizedInput("Story", ["story"], data.story, true)}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <IconPhoto className="h-4 w-4" />
                Image URL (optional)
              </Label>
              <Input
                placeholder="https://example.com/brand-story.jpg"
                value={data.imageUrl || ""}
                onChange={(e) => updateSimpleField(["imageUrl"], e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Video URL (optional)</Label>
              <Input
                placeholder="https://example.com/video.mp4"
                value={data.videoUrl || ""}
                onChange={(e) => updateSimpleField(["videoUrl"], e.target.value)}
              />
            </div>
          </div>
        );

      case "ComparisonBlock":
        return (
          <div className="space-y-6">
            {renderLocalizedInput("Title", ["title"], data.title)}
            {data.description && renderLocalizedInput("Description", ["description"], data.description, true)}
            <div className="rounded-lg border border-brand-muted dark:border-brand-muteddark bg-brand-muted/20 dark:bg-brand-muteddark/20 p-4">
              <p className="text-sm text-text-subtle dark:text-text-subtledark">
                <strong>Note:</strong> Product comparison items editing requires advanced interface.
              </p>
              <p className="mt-2 text-xs text-text-subtle dark:text-text-subtledark">
                Current products: {data.products?.length || 0}
              </p>
            </div>
          </div>
        );

      case "ConfiguratorBlock":
        return (
          <div className="space-y-6">
            {renderLocalizedInput("Title", ["title"], data.title)}
            {data.description && renderLocalizedInput("Description", ["description"], data.description, true)}
            <div className="rounded-lg border border-brand-muted dark:border-brand-muteddark bg-brand-muted/20 dark:bg-brand-muteddark/20 p-4">
              <p className="text-sm text-text-subtle dark:text-text-subtledark">
                <strong>Note:</strong> Configurator steps editing requires advanced interface.
              </p>
              <p className="mt-2 text-xs text-text-subtle dark:text-text-subtledark">
                Current steps: {data.steps?.length || 0}
              </p>
            </div>
          </div>
        );

      case "CustomerGallery":
        return (
          <div className="space-y-6">
            {renderLocalizedInput("Title", ["title"], data.title)}
            {data.subtitle && renderLocalizedInput("Subtitle", ["subtitle"], data.subtitle)}
            {data.hashtag && renderLocalizedInput("Hashtag", ["hashtag"], data.hashtag)}
            <div className="rounded-lg border border-brand-muted dark:border-brand-muteddark bg-brand-muted/20 dark:bg-brand-muteddark/20 p-4">
              <p className="text-sm text-text-subtle dark:text-text-subtledark">
                <strong>Note:</strong> Gallery images editing requires advanced interface.
              </p>
              <p className="mt-2 text-xs text-text-subtle dark:text-text-subtledark">
                Current images: {data.images?.length || 0}
              </p>
            </div>
          </div>
        );

      case "BundlePromo":
        return (
          <div className="space-y-6">
            {renderLocalizedInput("Title", ["title"], data.title)}
            {renderLocalizedInput("Description", ["description"], data.description, true)}
            <div className="rounded-lg border border-brand-muted dark:border-brand-muteddark bg-brand-muted/20 dark:bg-brand-muteddark/20 p-4">
              <p className="text-sm text-text-subtle dark:text-text-subtledark">
                <strong>Note:</strong> Bundle items editing requires advanced interface.
              </p>
              <p className="mt-2 text-xs text-text-subtle dark:text-text-subtledark">
                Current bundles: {data.bundles?.length || 0}
              </p>
            </div>
          </div>
        );

      case "InfluencerHighlight":
        return (
          <div className="space-y-6">
            {renderLocalizedInput("Title", ["title"], data.title)}
            <div className="space-y-2">
              <Label>Video URL (optional)</Label>
              <Input
                placeholder="https://example.com/video.mp4"
                value={data.videoUrl || ""}
                onChange={(e) => updateSimpleField(["videoUrl"], e.target.value)}
              />
            </div>
            <div className="rounded-lg border border-brand-muted dark:border-brand-muteddark bg-brand-muted/20 dark:bg-brand-muteddark/20 p-4">
              <p className="text-sm text-text-subtle dark:text-text-subtledark">
                <strong>Note:</strong> Influencer details and images editing requires advanced
                interface.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Content editing for section type <strong>{sectionType}</strong> is not yet implemented.
            </p>
          </div>
        );
    }
  };

  return (
    <Modal
      className="max-w-3xl"
      classNames={{
        backdrop: "bg-slate-900/90 backdrop-blur-xl",
        base:
          "rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-violet-200 dark:border-violet-800 shadow-2xl",
        wrapper: "z-[9999]",
      }}
      hideCloseButton={false}
      isDismissable
      isOpen={isOpen}
      scrollBehavior="inside"
      onClose={onClose}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  Edit Section Content
                </h3>
                <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                  {getSectionLabel(sectionType)}
                </p>
              </div>
            </ModalHeader>
            <ModalBody className="py-6">
              <ScrollArea className="h-[500px] pr-4">{renderContentFields()}</ScrollArea>
            </ModalBody>
            <ModalFooter className="gap-3 border-t border-slate-200 dark:border-slate-700">
              <Button
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                variant="flat"
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white font-bold"
                isLoading={loading}
                onPress={handleSubmit}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
