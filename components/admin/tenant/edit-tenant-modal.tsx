/* eslint-disable jsx-a11y/label-has-associated-control */
"use client";

import type {
  Template1SectionInstance,
  Template2SectionInstance,
  Template3SectionInstance,
  TenantConfig,
} from "@/types/tenant";

import { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { IconEdit } from "@tabler/icons-react";
import { toast } from "sonner";

import SectionContentEditor from "./section-content-editor";

import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  config: TenantConfig;
}

type AnySectionInstance =
  | Template1SectionInstance
  | Template2SectionInstance
  | Template3SectionInstance;

const T1_TYPES = new Set<Template1SectionInstance["type"]>([
  "HeroWithSearch",
  "CategoryGrid",
  "BrandStrip",
  "DealCountdown",
  "ProductRailLaptops",
  "ProductRailPhones",
  "ComparisonBlock",
  "Reviews",
  "TrustBadges",
  "NewsletterApp",
]);
const T2_TYPES = new Set<Template2SectionInstance["type"]>([
  "HeroLifestyle",
  "CategoryGrid",
  "ConfiguratorBlock",
  "ProductRailNewArrivals",
  "ProductRailBestSofas",
  "CustomerGallery",
  "BrandStory",
  "ReviewsWarranty",
  "Newsletter",
]);
const T3_TYPES = new Set<Template3SectionInstance["type"]>([
  "HeroBanner",
  "CategoryGrid",
  "ReviewsWall",
  "ProductRailBestRated",
  "BundlePromo",
  "InfluencerHighlight",
  "NewsletterBeauty",
]);

function isT1(s: AnySectionInstance): s is Template1SectionInstance {
  return T1_TYPES.has(s.type as any);
}
function isT2(s: AnySectionInstance): s is Template2SectionInstance {
  return T2_TYPES.has(s.type as any);
}
function isT3(s: AnySectionInstance): s is Template3SectionInstance {
  return T3_TYPES.has(s.type as any);
}

export default function EditTenantModal({
  isOpen,
  onClose,
  domain,
  config,
}: EditTenantModalProps) {
  const isMobile = useIsMobile();

  const [themeColor, setThemeColor] = useState(config.themeColor);
  const [themeMode, setThemeMode] = useState<"light" | "dark">(config.theme.mode);

  // Brand & text colors
  const [brandColors, setBrandColors] = useState(config.theme.brand);
  const [textColors, setTextColors] = useState(config.theme.text);

  // Fonts
  const [fonts, setFonts] = useState(
    config.theme.fonts || {
      primary: "Inter, system-ui, sans-serif",
      secondary: "Inter, system-ui, sans-serif",
      heading: "Inter, system-ui, sans-serif",
    },
  );

  // Sections
  const [sections, setSections] = useState<AnySectionInstance[]>(
    config.homepage.sections as AnySectionInstance[],
  );

  const [loading, setLoading] = useState(false);

  // Inline editor state
  const contentEditor = useDisclosure();
  const [selectedSection, setSelectedSection] = useState<{
    index: number;
    type: string;
    data: any;
  } | null>(null);

  // helpers
  const rgbToHex = (rgb: string): string => {
    const parts = rgb.split(" ").map((n) => parseInt(n.trim(), 10));
    if (parts.length !== 3 || parts.some(isNaN)) return "#000000";
    return "#" + parts.map((n) => n.toString(16).padStart(2, "0")).join("");
  };
  const hexToRgb = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
  };

  // Reset when opening
  useEffect(() => {
    if (!isOpen) return;
    setThemeColor(config.themeColor);
    setThemeMode(config.theme.mode);
    setBrandColors(config.theme.brand);
    setTextColors(config.theme.text);
    setFonts(
      config.theme.fonts || {
        primary: "Inter, system-ui, sans-serif",
        secondary: "Inter, system-ui, sans-serif",
        heading: "Inter, system-ui, sans-serif",
      },
    );
    setSections(config.homepage.sections as AnySectionInstance[]);
  }, [isOpen, config]);

  const handleThemeModeChange = (value: string) => {
    setThemeMode(value as "light" | "dark");
  };

  const toggleSection = (index: number) => {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, enabled: !section.enabled } : section)),
    );
  };

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections],
  );

  const handleEditContent = (section: AnySectionInstance) => {
    const originalIndex = sections.findIndex(
      (s) => s.type === section.type && s.order === section.order,
    );
    if (originalIndex !== -1) {
      setSelectedSection({
        index: originalIndex,
        type: section.type,
        data: section.data,
      });
      contentEditor.onOpen();
    }
  };

  const handleSaveContent = (updatedData: any) => {
    if (selectedSection === null) return;
    setSections((prev) =>
      prev.map((section, i) => (i === selectedSection.index ? { ...section, data: updatedData } : section)),
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const hexToRGB = (hex: string): string => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r} ${g} ${b}`;
      };
      const primaryRGB = hexToRGB(themeColor);

      let updatedConfig: TenantConfig;

      if (config.templateId === 1) {
        updatedConfig = {
          templateId: 1,
          themeColor,
          theme: {
            mode: themeMode,
            brand: { ...brandColors, primary: primaryRGB, primaryDark: primaryRGB },
            text: textColors,
            fonts,
          },
          homepage: {
            templateId: 1,
            sections: sections.filter(isT1),
          },
        };
      } else if (config.templateId === 2) {
        updatedConfig = {
          templateId: 2,
          themeColor,
          theme: {
            mode: themeMode,
            brand: { ...brandColors, primary: primaryRGB, primaryDark: primaryRGB },
            text: textColors,
            fonts,
          },
          homepage: {
            templateId: 2,
            sections: sections.filter(isT2),
          },
        };
      } else {
        updatedConfig = {
          templateId: 3,
          themeColor,
          theme: {
            mode: themeMode,
            brand: { ...brandColors, primary: primaryRGB, primaryDark: primaryRGB },
            text: textColors,
            fonts,
          },
          homepage: {
            templateId: 3,
            sections: sections.filter(isT3),
          },
        };
      }

      const response = await fetch("/api/admin/tenants/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, config: updatedConfig }),
      });

      const result = await response.json();

      if (!response.ok || !result.success)
        throw new Error(result.message || "Failed to update tenant");

      toast.success("Tenant updated successfully! Refresh the page to see changes.");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update tenant");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateLabel = (templateId: number) => {
    switch (templateId) {
      case 1:
        return "Tech/Electronics";
      case 2:
        return "Home/Furniture";
      case 3:
        return "Beauty/Health";
      default:
        return `Template ${templateId}`;
    }
  };

  const getSectionLabel = (type: string) => type.replace(/([A-Z])/g, " $1").trim();

  return (
    <Modal
      className="max-w-3xl"
      classNames={{
        backdrop: "bg-slate-900/80 backdrop-blur-xl",
        base:
          "rounded-t-2xl md:rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl",
        wrapper: "z-[998]",
        closeButton: "z-50",
      }}
      hideCloseButton={contentEditor.isOpen}
      isDismissable={!contentEditor.isOpen}
      isOpen={isOpen}
      placement={isMobile ? "top" : "center"}
      scrollBehavior="inside"
      size={isMobile ? "full" : "3xl"}
      onClose={onClose}
    >
      <ModalContent className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 pointer-events-none rounded-2xl" />
        {contentEditor.isOpen ? (
          <>
            <ModalHeader className="relative z-10 flex items-center justify-between gap-2 pb-2 pt-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                  <IconEdit className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    Edit Section Content
                  </h3>
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                    {selectedSection?.type && getSectionLabel(selectedSection.type)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                  onPress={() => {
                    contentEditor.onClose();
                    setSelectedSection(null);
                  }}
                >
                  Back
                </Button>
              </div>
            </ModalHeader>

            <ModalBody className="relative z-10 px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
              {selectedSection && (
                <SectionContentEditor
                  inline
                  isOpen
                  sectionData={selectedSection.data}
                  sectionType={selectedSection.type}
                  onClose={() => {
                    contentEditor.onClose();
                    setSelectedSection(null);
                  }}
                  onSave={(updated) => {
                    handleSaveContent(updated);
                    toast.success("Section content updated");
                  }}
                />
              )}
            </ModalBody>
          </>
        ) : (
          <>
            <ModalHeader className="relative z-10 flex flex-col items-center gap-2 pb-4 pt-8">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg mb-2">
                <IconEdit className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">
                Edit Tenant
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{domain}</p>
            </ModalHeader>

            <ModalBody className="relative z-10 px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
              <Tabs className="w-full" defaultValue="theme">
                <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
                  <TabsTrigger
                    className="rounded-lg font-semibold data-[state=active]:text-white data-[state=active]:shadow
                               data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600"
                    value="theme"
                  >
                    Theme
                  </TabsTrigger>
                  <TabsTrigger
                    className="rounded-lg font-semibold data-[state=active]:text-white data-[state=active]:shadow
                               data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600"
                    value="template"
                  >
                    Template
                  </TabsTrigger>
                  <TabsTrigger
                    className="rounded-lg font-semibold data-[state=active]:text-white data-[state=active]:shadow
                               data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600"
                    value="sections"
                  >
                    Sections
                  </TabsTrigger>
                </TabsList>

                {/* THEME TAB */}
                <TabsContent className="pt-4" value="theme">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      {/* Mode & Primary Color */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm">General</h4>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Theme Mode</label>
                          <Tabs value={themeMode} onValueChange={handleThemeModeChange}>
                            <TabsList className="grid w-full grid-cols-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 p-1">
                              <TabsTrigger className="rounded-md" value="light">Light</TabsTrigger>
                              <TabsTrigger className="rounded-md" value="dark">Dark</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Primary Theme Color
                          </label>
                          <input
                            className="w-full h-10 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                            type="color"
                            value={themeColor}
                            onChange={(e) => setThemeColor(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Brand Colors */}
                      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="font-semibold text-sm">Brand Colors</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="text-xs font-medium mb-1 block">Surface</label>
                              <div className="flex gap-2">
                                <input
                                  className="w-14 h-10 rounded border-2 border-slate-200 dark:border-slate-700 cursor-pointer"
                                  type="color"
                                  value={rgbToHex(brandColors.surface)}
                                  onChange={(e) =>
                                    setBrandColors({
                                      ...brandColors,
                                      surface: hexToRgb(e.target.value),
                                    })
                                  }
                                />
                                <input
                                  className="flex-1 px-3 py-2 text-xs rounded border-2 border-slate-200 dark:border-slate-700 font-mono bg-white dark:bg-slate-900"
                                  placeholder="241 245 249"
                                  type="text"
                                  value={brandColors.surface}
                                  onChange={(e) =>
                                    setBrandColors({ ...brandColors, surface: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-medium mb-1 block">Surface Dark</label>
                              <div className="flex gap-2">
                                <input
                                  className="w-14 h-10 rounded border-2 border-slate-200 dark:border-slate-700 cursor-pointer"
                                  type="color"
                                  value={rgbToHex(brandColors.surfaceDark)}
                                  onChange={(e) =>
                                    setBrandColors({
                                      ...brandColors,
                                      surfaceDark: hexToRgb(e.target.value),
                                    })
                                  }
                                />
                                <input
                                  className="flex-1 px-3 py-2 text-xs rounded border-2 border-slate-200 dark:border-slate-700 font-mono bg-white dark:bg-slate-900"
                                  placeholder="2 6 23"
                                  type="text"
                                  value={brandColors.surfaceDark}
                                  onChange={(e) =>
                                    setBrandColors({ ...brandColors, surfaceDark: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="text-xs font-medium mb-1 block">Muted</label>
                              <div className="flex gap-2">
                                <input
                                  className="w-14 h-10 rounded border-2 border-slate-200 dark:border-slate-700 cursor-pointer"
                                  type="color"
                                  value={rgbToHex(brandColors.muted)}
                                  onChange={(e) =>
                                    setBrandColors({
                                      ...brandColors,
                                      muted: hexToRgb(e.target.value),
                                    })
                                  }
                                />
                                <input
                                  className="flex-1 px-3 py-2 text-xs rounded border-2 border-slate-200 dark:border-slate-700 font-mono bg-white dark:bg-slate-900"
                                  placeholder="226 232 240"
                                  type="text"
                                  value={brandColors.muted}
                                  onChange={(e) =>
                                    setBrandColors({ ...brandColors, muted: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-medium mb-1 block">Muted Dark</label>
                              <div className="flex gap-2">
                                <input
                                  className="w-14 h-10 rounded border-2 border-slate-200 dark:border-slate-700 cursor-pointer"
                                  type="color"
                                  value={rgbToHex(brandColors.mutedDark)}
                                  onChange={(e) =>
                                    setBrandColors({
                                      ...brandColors,
                                      mutedDark: hexToRgb(e.target.value),
                                    })
                                  }
                                />
                                <input
                                  className="flex-1 px-3 py-2 text-xs rounded border-2 border-slate-200 dark:border-slate-700 font-mono bg-white dark:bg-slate-900"
                                  placeholder="16 24 41"
                                  type="text"
                                  value={brandColors.mutedDark}
                                  onChange={(e) =>
                                    setBrandColors({
                                      ...brandColors,
                                      mutedDark: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Text Colors */}
                      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="font-semibold text-sm">Text Colors</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="text-xs font-medium mb-1 block">Light</label>
                              <div className="flex gap-2">
                                <input
                                  className="w-14 h-10 rounded border-2 border-slate-200 dark:border-slate-700 cursor-pointer"
                                  type="color"
                                  value={rgbToHex(textColors.light)}
                                  onChange={(e) =>
                                    setTextColors({
                                      ...textColors,
                                      light: hexToRgb(e.target.value),
                                    })
                                  }
                                />
                                <input
                                  className="flex-1 px-3 py-2 text-xs rounded border-2 border-slate-200 dark:border-slate-700 font-mono bg-white dark:bg-slate-900"
                                  placeholder="30 41 59"
                                  type="text"
                                  value={textColors.light}
                                  onChange={(e) =>
                                    setTextColors({ ...textColors, light: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-medium mb-1 block">Subtle</label>
                              <div className="flex gap-2">
                                <input
                                  className="w-14 h-10 rounded border-2 border-slate-200 dark:border-slate-700 cursor-pointer"
                                  type="color"
                                  value={rgbToHex(textColors.subtle)}
                                  onChange={(e) =>
                                    setTextColors({
                                      ...textColors,
                                      subtle: hexToRgb(e.target.value),
                                    })
                                  }
                                />
                                <input
                                  className="flex-1 px-3 py-2 text-xs rounded border-2 border-slate-200 dark:border-slate-700 font-mono bg-white dark:bg-slate-900"
                                  placeholder="100 116 139"
                                  type="text"
                                  value={textColors.subtle}
                                  onChange={(e) =>
                                    setTextColors({ ...textColors, subtle: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <label className="text-xs font-medium mb-1 block">Light Dark</label>
                              <div className="flex gap-2">
                                <input
                                  className="w-14 h-10 rounded border-2 border-slate-200 dark:border-slate-700 cursor-pointer"
                                  type="color"
                                  value={rgbToHex(textColors.lightDark)}
                                  onChange={(e) =>
                                    setTextColors({
                                      ...textColors,
                                      lightDark: hexToRgb(e.target.value),
                                    })
                                  }
                                />
                                <input
                                  className="flex-1 px-3 py-2 text-xs rounded border-2 border-slate-200 dark:border-slate-700 font-mono bg-white dark:bg-slate-900"
                                  placeholder="228 221 222"
                                  type="text"
                                  value={textColors.lightDark}
                                  onChange={(e) =>
                                    setTextColors({ ...textColors, lightDark: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-medium mb-1 block">Subtle Dark</label>
                              <div className="flex gap-2">
                                <input
                                  className="w-14 h-10 rounded border-2 border-slate-200 dark:border-slate-700 cursor-pointer"
                                  type="color"
                                  value={rgbToHex(textColors.subtleDark)}
                                  onChange={(e) =>
                                    setTextColors({
                                      ...textColors,
                                      subtleDark: hexToRgb(e.target.value),
                                    })
                                  }
                                />
                                <input
                                  className="flex-1 px-3 py-2 text-xs rounded border-2 border-slate-200 dark:border-slate-700 font-mono bg-white dark:bg-slate-900"
                                  placeholder="106 119 138"
                                  type="text"
                                  value={textColors.subtleDark}
                                  onChange={(e) =>
                                    setTextColors({ ...textColors, subtleDark: e.target.value })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fonts */}
                      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h4 className="font-semibold text-sm">Typography</h4>
                        <div className="space-y-3">
                          {["primary", "secondary", "heading"].map((k) => (
                            <div key={k}>
                              <label className="text-xs font-medium mb-1 block capitalize">
                                {k} Font
                              </label>
                              <select
                                className="w-full px-3 py-2 text-sm rounded border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                value={(fonts as any)[k] || ""}
                                onChange={(e) =>
                                  setFonts({
                                    ...fonts,
                                    [k]: e.target.value,
                                  })
                                }
                              >
                                <option value="Inter, system-ui, sans-serif">Inter</option>
                                <option value="system-ui, -apple-system, sans-serif">System UI</option>
                                <option value="&quot;Roboto&quot;, sans-serif">Roboto</option>
                                <option value="&quot;Open Sans&quot;, sans-serif">Open Sans</option>
                                <option value="&quot;Montserrat&quot;, sans-serif">Montserrat</option>
                                <option value="&quot;Poppins&quot;, sans-serif">Poppins</option>
                                <option value="&quot;Lato&quot;, sans-serif">Lato</option>
                                <option value="&quot;Raleway&quot;, sans-serif">Raleway</option>
                                <option value="&quot;Plus Jakarta Sans&quot;, sans-serif">Plus Jakarta Sans</option>
                                <option value="&quot;DM Sans&quot;, sans-serif">DM Sans</option>
                                <option value="Georgia, serif">Georgia</option>
                                <option value="&quot;Playfair Display&quot;, serif">Playfair Display</option>
                                <option value="&quot;Merriweather&quot;, serif">Merriweather</option>
                                <option value="&quot;Courier New&quot;, monospace">Courier New</option>
                                <option value="&quot;Fira Code&quot;, monospace">Fira Code</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* TEMPLATE TAB */}
                <TabsContent className="pt-4" value="template">
                  <div className="rounded-lg border-2 border-slate-200 dark:border-slate-700 p-4 bg-white/80 dark:bg-slate-900/70">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Current Template</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {getTemplateLabel(config.templateId)}
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-amber-600">#{config.templateId}</div>
                    </div>
                  </div>
                </TabsContent>

                {/* SECTIONS TAB */}
                <TabsContent className="pt-4" value="sections">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {sortedSections.map((section, index) => {
                        const originalIndex = sections.findIndex(
                          (s) => s.type === section.type && s.order === section.order,
                        );
                        const enabled = section.enabled;

                        return (
                          <div
                            key={`${section.type}-${section.order}-${index}`}
                            className={`flex items-center justify-between rounded-lg border-2 p-4 transition-colors ${
                              enabled
                                ? "border-amber-500/30 bg-amber-500/5"
                                : "border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/40"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold ${
                                  enabled
                                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                }`}
                              >
                                {section.order}
                              </div>
                              <div>
                                <h5 className="font-medium">{getSectionLabel(section.type)}</h5>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                  {section.type}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                isIconOnly
                                className="h-8 w-8 min-w-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                size="sm"
                                variant="flat"
                                onPress={() => handleEditContent(section)}
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Switch
                                checked={enabled}
                                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-amber-500 data-[state=checked]:to-orange-600"
                                onCheckedChange={() =>
                                  originalIndex !== -1 && toggleSection(originalIndex)
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  <div className="mt-4 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-3">
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      <strong>Tip:</strong> Disabled sections won’t appear on the homepage but their
                      configuration is preserved. {sections.filter((s) => s.enabled).length} of{" "}
                      {sections.length} sections enabled.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </ModalBody>

            <ModalFooter className="relative z-10 gap-3 px-6 py-5 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700">
              <Button
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold shadow-sm hover:shadow-md transition-all duration-300"
                disabled={loading}
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                disabled={loading}
                isLoading={loading}
                onPress={handleSubmit}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
