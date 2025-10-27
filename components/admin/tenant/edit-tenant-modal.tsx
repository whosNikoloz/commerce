/* eslint-disable jsx-a11y/label-has-associated-control */
"use client";

import type {
  Template1SectionInstance,
  Template2SectionInstance,
  Template3SectionInstance,
  Template4SectionInstance,
  TenantConfig,
} from "@/types/tenant";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { IconEdit, IconPlus, IconTrash, IconChevronUp, IconChevronDown } from "@tabler/icons-react";
import { toast } from "sonner";

import SectionContentEditor from "./section-content-editor";

import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getDefaultSectionsForTemplate, TEMPLATE_1_ALLOWED_SECTIONS, TEMPLATE_2_ALLOWED_SECTIONS, TEMPLATE_3_ALLOWED_SECTIONS, TEMPLATE_4_ALLOWED_SECTIONS } from "@/lib/templates";

interface EditTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  config: TenantConfig;
}

type AnySectionInstance =
  | Template1SectionInstance
  | Template2SectionInstance
  | Template3SectionInstance
  | Template4SectionInstance;

const T1_TYPES = new Set<Template1SectionInstance["type"]>([
  "ProductRail",
  "CommercialBanner",
  "AboutUs",
  "CategoryGrid",
  "BrandCarousel",
]);
const T2_TYPES = new Set<Template2SectionInstance["type"]>([
  "HeroLifestyle",
  "CategoryGrid",
  "ConfiguratorBlock",
  "ProductRail",
  "CustomerGallery",
  "BrandStory",
  "ReviewsWarranty",
  "Newsletter",
]);
const T3_TYPES = new Set<Template3SectionInstance["type"]>([
  "HeroBanner",
  "CategoryGrid",
  "ReviewsWall",
  "ProductRail",
  "BundlePromo",
  "InfluencerHighlight",
  "NewsletterBeauty",
]);
const T4_TYPES = new Set<Template4SectionInstance["type"]>([
  "HeroCategoryGrid",
  "CommercialBanner",
  "BrandStrip",
  "CategoryCarousel",
  "ProductRail",
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
function isT4(s: AnySectionInstance): s is Template4SectionInstance {
  return T4_TYPES.has(s.type as any);
}

export default function EditTenantModal({
  isOpen,
  onClose,
  domain,
  config,
}: EditTenantModalProps) {
  const isMobile = useIsMobile();

  const [templateId, setTemplateId] = useState<1 | 2 | 3 | 4>(config.templateId as 1 | 2 | 3 | 4);
  const [themeColor, setThemeColor] = useState(config.themeColor);
  const [themeMode, setThemeMode] = useState<"light" | "dark">(config.theme.mode);
  const [merchantType, setMerchantType] = useState<"FINA" | "CUSTOM">(
    config.merchantType || "CUSTOM"
  );

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

  // Site Config state
  const [siteConfig, setSiteConfig] = useState(config.siteConfig);

  const [loading, setLoading] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

  // Configuration settings state
  const [configSettings, setConfigSettings] = useState({
    REFRESH_TOKEN_EXPIRE_TIME: "",
    FB_CLIENT_ID: "",
    FB_CLIENT_SECRET: "",
    GOOGLE_CLIENT_ID: "",
    GOOGLE_CLIENT_SECRET: "",
    FINA_IP: "",
    FINA_LOGIN: "",
    FINA_PASSWORD: "",
    AUTHORIZATION_GOOGLE_USER_INFO_URL: "",
    AWS_ACCESS_KEY_ID: "",
    AWS_SECRET_ACCESS_KEY: "",
    AWS_REGION: "",
    AWS_BUCKET_NAME: "",
  });

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
    setTemplateId(config.templateId as 1 | 2 | 3 | 4);
    setThemeColor(config.themeColor);
    setThemeMode(config.theme.mode);
    setMerchantType(config.merchantType || "CUSTOM");
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
    setSiteConfig(config.siteConfig);

    // Fetch existing settings
    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/admin/tenants/get-settings?domain=${domain}`);
        const result = await response.json();

        if (response.ok && result.success && result.settings) {
          setConfigSettings({
            REFRESH_TOKEN_EXPIRE_TIME: result.settings.REFRESH_TOKEN_EXPIRE_TIME || "",
            FB_CLIENT_ID: result.settings.FB_CLIENT_ID || "",
            FB_CLIENT_SECRET: result.settings.FB_CLIENT_SECRET || "",
            GOOGLE_CLIENT_ID: result.settings.GOOGLE_CLIENT_ID || "",
            GOOGLE_CLIENT_SECRET: result.settings.GOOGLE_CLIENT_SECRET || "",
            FINA_IP: result.settings.FINA_IP || "",
            FINA_LOGIN: result.settings.FINA_LOGIN || "",
            FINA_PASSWORD: result.settings.FINA_PASSWORD || "",
            AUTHORIZATION_GOOGLE_USER_INFO_URL: result.settings.AUTHORIZATION_GOOGLE_USER_INFO_URL || "",
            AWS_ACCESS_KEY_ID: result.settings.AWS_ACCESS_KEY_ID || "",
            AWS_SECRET_ACCESS_KEY: result.settings.AWS_SECRET_ACCESS_KEY || "",
            AWS_REGION: result.settings.AWS_REGION || "",
            AWS_BUCKET_NAME: result.settings.AWS_BUCKET_NAME || "",
          });
        }
      } catch (error) {
        console.error("Error fetching tenant settings:", error);
      }
    };

    fetchSettings();
  }, [isOpen, config, domain]);

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
    console.log("Saving section content:", selectedSection.index, updatedData);
    setSections((prev) =>
      prev.map((section, i) => (i === selectedSection.index ? { ...section, data: updatedData } : section)),
    );
  };

  const addProductRail = () => {
    const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order)) : 0;
    const newSection: AnySectionInstance = {
      type: "ProductRail",
      enabled: true,
      order: maxOrder + 1,
      data: {
        title: { ka: "ახალი პროდუქტები", en: "New Products" },
        subtitle: { ka: "ახალი შემოსული", en: "Just arrived" },
        limit: 4,
        viewAllHref: "/products",
        filterBy: {},
        sortBy: "featured",
      },
    } as any;

    setSections((prev) => [...prev, newSection]);
    toast.success("Product Rail section added");
  };

  const addSection = (sectionType: string) => {
    const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order)) : 0;
    const defaultSections = getDefaultSectionsForTemplate(templateId);
    const defaultSection = defaultSections.find(s => s.type === sectionType);

    if (defaultSection) {
      const newSection = {
        ...defaultSection,
        order: maxOrder + 1,
      };

      setSections((prev) => [...prev, newSection as any]);
      toast.success(`${sectionType} section added`);
      setShowAddSectionModal(false);
    } else {
      toast.error(`Could not add ${sectionType} section`);
    }
  };

  const availableSections = templateId === 1 ? TEMPLATE_1_ALLOWED_SECTIONS :
    templateId === 2 ? TEMPLATE_2_ALLOWED_SECTIONS :
    templateId === 3 ? TEMPLATE_3_ALLOWED_SECTIONS :
    TEMPLATE_4_ALLOWED_SECTIONS;

  const deleteSection = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
    toast.success("Section deleted");
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    setSections((prev) => {
      const newSections = [...prev];
      const temp = newSections[index - 1];

      newSections[index - 1] = newSections[index];
      newSections[index] = temp;

      // Update order numbers
      newSections[index - 1].order = index;
      newSections[index].order = index + 1;

      return newSections;
    });
  };

  const moveSectionDown = (index: number) => {
    setSections((prev) => {
      if (index === prev.length - 1) return prev;
      const newSections = [...prev];
      const temp = newSections[index + 1];

      newSections[index + 1] = newSections[index];
      newSections[index] = temp;

      // Update order numbers
      newSections[index].order = index + 1;
      newSections[index + 1].order = index + 2;

      return newSections;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // First, save configuration settings if any are provided
      const hasSettings = Object.values(configSettings).some(val => val && val.trim() !== "");

      if (hasSettings) {
        const settingsResponse = await fetch(`/api/admin/tenants/update-settings/${encodeURIComponent(domain)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(configSettings),
        });

        const settingsResult = await settingsResponse.json();

        if (!settingsResponse.ok || !settingsResult.success) {
          throw new Error(settingsResult.message || "Failed to update tenant settings");
        }
      }

      const hexToRGB = (hex: string): string => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        return `${r} ${g} ${b}`;
      };
      const primaryRGB = hexToRGB(themeColor);

      // Clean sections: remove brands array from BrandStrip sections (keep title) only for API payload
      const cleanSections = sections.map((section) => {
        if (section.type === "BrandStrip") {
          // Only keep title, remove brands
          return {
            ...section,
            data: {
              title: section.data.title,
            },
          };
        }

        return section;
      });

      let updatedConfig: TenantConfig;

      if (templateId === 1) {
        updatedConfig = {
          templateId: 1,
          themeColor,
          merchantType,
          siteConfig, // Use the updated site config from state
          theme: {
            mode: themeMode,
            brand: { ...brandColors, primary: primaryRGB, primaryDark: primaryRGB },
            text: textColors,
            fonts,
          },
          homepage: {
            templateId: 1,
            sections: cleanSections.filter(isT1) as Template1SectionInstance[],
          },
        };
      } else if (templateId === 2) {
        updatedConfig = {
          templateId: 2,
          themeColor,
          merchantType,
          siteConfig, // Use the updated site config from state
          theme: {
            mode: themeMode,
            brand: { ...brandColors, primary: primaryRGB, primaryDark: primaryRGB },
            text: textColors,
            fonts,
          },
          homepage: {
            templateId: 2,
            sections: cleanSections.filter(isT2) as Template2SectionInstance[],
          },
        };
      } else if (templateId === 3) {
        updatedConfig = {
          templateId: 3,
          themeColor,
          merchantType,
          siteConfig, // Use the updated site config from state
          theme: {
            mode: themeMode,
            brand: { ...brandColors, primary: primaryRGB, primaryDark: primaryRGB },
            text: textColors,
            fonts,
          },
          homepage: {
            templateId: 3,
            sections: cleanSections.filter(isT3) as Template3SectionInstance[],
          },
        };
      } else {
        updatedConfig = {
          templateId: 4,
          themeColor,
          merchantType,
          siteConfig, // Use the updated site config from state
          theme: {
            mode: themeMode,
            brand: { ...brandColors, primary: primaryRGB, primaryDark: primaryRGB },
            text: textColors,
            fonts,
          },
          homepage: {
            templateId: 4,
            sections: cleanSections.filter(isT4) as Template4SectionInstance[],
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

      const successMessage = hasSettings
        ? "Tenant and settings updated successfully! Refresh the page to see changes."
        : "Tenant updated successfully! Refresh the page to see changes.";

      toast.success(successMessage);
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
    <>
    <Modal
      className="max-w-3xl"
      classNames={{
        backdrop: "bg-slate-900/80 backdrop-blur-xl",
        base:
          "rounded-t-2xl md:rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl",
        wrapper: "z-[998]",
        closeButton: "z-50",
      }}
      hideCloseButton={contentEditor.isOpen || showAddSectionModal}
      isDismissable={!contentEditor.isOpen && !showAddSectionModal}
      isOpen={isOpen}
      placement={isMobile ? "top" : "center"}
      scrollBehavior="inside"
      size={isMobile ? "full" : "3xl"}
      onClose={onClose}
    >
      <ModalContent className="relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-muted/5 via-transparent to-muted/5 pointer-events-none rounded-2xl" />
        {contentEditor.isOpen ? (
          <>
            <ModalHeader className="relative z-10 flex items-center justify-between gap-2 pb-2 pt-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
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
              <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg mb-2">
                <IconEdit className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">
                Edit Tenant
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{domain}</p>
            </ModalHeader>

            <ModalBody className="relative z-10 px-6 py-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
              <Tabs className="w-full" defaultValue="theme">
                <TabsList className="grid w-full grid-cols-5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
                  <TabsTrigger
                    className="rounded-lg font-semibold data-[state=active]:text-primary-foreground data-[state=active]:shadow
                               data-[state=active]:bg-primary"
                    value="theme"
                  >
                    Theme
                  </TabsTrigger>
                  <TabsTrigger
                    className="rounded-lg font-semibold data-[state=active]:text-primary-foreground data-[state=active]:shadow
                               data-[state=active]:bg-primary"
                    value="template"
                  >
                    Template
                  </TabsTrigger>
                  <TabsTrigger
                    className="rounded-lg font-semibold data-[state=active]:text-primary-foreground data-[state=active]:shadow
                               data-[state=active]:bg-primary"
                    value="sections"
                  >
                    Sections
                  </TabsTrigger>
                  <TabsTrigger
                    className="rounded-lg font-semibold data-[state=active]:text-primary-foreground data-[state=active]:shadow
                               data-[state=active]:bg-primary"
                    value="siteInfo"
                  >
                    Site Info
                  </TabsTrigger>
                  <TabsTrigger
                    className="rounded-lg font-semibold data-[state=active]:text-primary-foreground data-[state=active]:shadow
                               data-[state=active]:bg-primary"
                    value="config"
                  >
                    Settings
                  </TabsTrigger>
                </TabsList>

                {/* THEME TAB */}
                <TabsContent className="pt-4" value="theme">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      {/* Mode & Primary Color */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">General</h4>
                          <Button
                            className="h-7 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            size="sm"
                            variant="flat"
                            onPress={() => {
                              setThemeColor(config.themeColor);
                              setThemeMode(config.theme.mode);
                              toast.success("General settings reset");
                            }}
                          >
                            Reset
                          </Button>
                        </div>
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
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">Brand Colors</h4>
                          <Button
                            className="h-7 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            size="sm"
                            variant="flat"
                            onPress={() => {
                              setBrandColors(config.theme.brand);
                              toast.success("Brand colors reset");
                            }}
                          >
                            Reset
                          </Button>
                        </div>
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
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">Text Colors</h4>
                          <Button
                            className="h-7 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            size="sm"
                            variant="flat"
                            onPress={() => {
                              setTextColors(config.theme.text);
                              toast.success("Text colors reset");
                            }}
                          >
                            Reset
                          </Button>
                        </div>
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
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">Typography</h4>
                          <Button
                            className="h-7 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                            size="sm"
                            variant="flat"
                            onPress={() => {
                              setFonts(
                                config.theme.fonts || {
                                  primary: "Inter, system-ui, sans-serif",
                                  secondary: "Inter, system-ui, sans-serif",
                                  heading: "Inter, system-ui, sans-serif",
                                }
                              );
                              toast.success("Typography reset");
                            }}
                          >
                            Reset
                          </Button>
                        </div>
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
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm">Select Template</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {/* Template 1 */}
                          <button
                            className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                              templateId === 1
                                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-amber-300 dark:hover:border-amber-700"
                            }`}
                            type="button"
                            onClick={() => {
                              setTemplateId(1);
                              setSections(getDefaultSectionsForTemplate(1) as AnySectionInstance[]);
                              toast.success("Template 1 selected - Default sections loaded");
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div
                                    className={`text-xl font-bold ${
                                      templateId === 1 ? "text-amber-600" : "text-slate-400"
                                    }`}
                                  >
                                    #1
                                  </div>
                                  <h5 className="font-semibold text-lg">Tech / Electronics</h5>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                  Modern e-commerce template for electronics, gadgets, and tech products
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                    Hero with Search
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                    Deal Countdown
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                    Product Comparison
                                  </span>
                                </div>
                              </div>
                              {templateId === 1 && (
                                <div className="ml-3">
                                  <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center">
                                    <svg
                                      className="w-4 h-4 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        d="M5 13l4 4L19 7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </button>

                          {/* Template 2 */}
                          <button
                            className={`relative w-full text-left rounded-lg border-2 p-4 transition-all ${
                              templateId === 2
                                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-amber-300 dark:hover:border-amber-700"
                            }`}
                            type="button"
                            onClick={() => {
                              setTemplateId(2);
                              setSections(getDefaultSectionsForTemplate(2) as AnySectionInstance[]);
                              toast.success("Template 2 selected - Default sections loaded");
                            }}
                          >

                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div
                                    className={`text-xl font-bold ${
                                      templateId === 2 ? "text-amber-600" : "text-slate-400"
                                    }`}
                                  >
                                    #2
                                  </div>
                                  <h5 className="font-semibold text-lg">Home / Furniture</h5>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                  Elegant template for furniture, home decor, and lifestyle products
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                    Lifestyle Hero
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                    Product Configurator
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
                                    Customer Gallery
                                  </span>
                                </div>
                              </div>
                              {templateId === 2 && (
                                <div className="ml-3">
                                  <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center">
                                    <svg
                                      className="w-4 h-4 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        d="M5 13l4 4L19 7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </button>

                          {/* Template 3 */}
                          <button
                            className={`relative w-full text-left rounded-lg border-2 p-4 transition-all cursor-pointer ${
                              templateId === 3
                                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-amber-300 dark:hover:border-amber-700"
                            }`}
                            type="button"
                            onClick={() => {
                              setTemplateId(3);
                              setSections(getDefaultSectionsForTemplate(3) as AnySectionInstance[]);
                              toast.success("Template 3 selected - Default sections loaded");
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div
                                    className={`text-xl font-bold ${
                                      templateId === 3 ? "text-amber-600" : "text-slate-400"
                                    }`}
                                  >
                                    #3
                                  </div>
                                  <h5 className="font-semibold text-lg">Beauty / Health</h5>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                  Stylish template for beauty, cosmetics, and wellness products
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <span className="text-xs px-2 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
                                    Banner Hero
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                    Bundle Promos
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                    Influencer Spotlight
                                  </span>
                                </div>
                              </div>
                              {templateId === 3 && (
                                <div className="ml-3">
                                  <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center">
                                    <svg
                                      className="w-4 h-4 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        d="M5 13l4 4L19 7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </button>

                          {/* Template 4 */}
                          <button
                            className={`relative w-full text-left rounded-lg border-2 p-4 transition-all cursor-pointer ${
                              templateId === 4
                                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-amber-300 dark:hover:border-amber-700"
                            }`}
                            type="button"
                            onClick={() => {
                              setTemplateId(4);
                              setSections(getDefaultSectionsForTemplate(4) as AnySectionInstance[]);
                              toast.success("Template 4 selected - Default sections loaded");
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div
                                    className={`text-xl font-bold ${
                                      templateId === 4 ? "text-amber-600" : "text-slate-400"
                                    }`}
                                  >
                                    #4
                                  </div>
                                  <h5 className="font-semibold text-lg">Casual Ecommerce</h5>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                  Modern casual template with category grids, commercial banners, and product showcases
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                    Category Hero
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                    Banners
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                    Product Grid
                                  </span>
                                </div>
                              </div>
                              {templateId === 4 && (
                                <div className="ml-3">
                                  <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center">
                                    <svg
                                      className="w-4 h-4 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        d="M5 13l4 4L19 7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                      />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </button>
                        </div>
                      </div>

                      <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-4">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          <strong>⚠️ Warning:</strong> Changing the template will reset your sections to the default layout for the new template. Make sure to save any important customizations first.
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* SECTIONS TAB */}
                <TabsContent className="pt-4" value="sections">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {sections.filter((s) => s.enabled).length} of {sections.length} sections enabled
                    </p>
                    <Button
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-md"
                      size="sm"
                      startContent={<IconPlus className="h-4 w-4" />}
                      onPress={() => setShowAddSectionModal(true)}
                    >
                      Add Section
                    </Button>
                  </div>

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
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                }`}
                              >
                                {section.order}
                              </div>
                              <div>
                                <h5 className="font-medium">
                                  {section.type === "ProductRail" && (section.data as any).customName
                                    ? (section.data as any).customName
                                    : getSectionLabel(section.type)}
                                </h5>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                  {section.type}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-1">
                                <Button
                                  isIconOnly
                                  className="h-6 w-6 min-w-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"
                                  isDisabled={originalIndex === 0}
                                  size="sm"
                                  variant="flat"
                                  onPress={() => originalIndex !== -1 && moveSectionUp(originalIndex)}
                                >
                                  <IconChevronUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  isIconOnly
                                  className="h-6 w-6 min-w-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30"
                                  isDisabled={originalIndex === sections.length - 1}
                                  size="sm"
                                  variant="flat"
                                  onPress={() => originalIndex !== -1 && moveSectionDown(originalIndex)}
                                >
                                  <IconChevronDown className="h-3 w-3" />
                                </Button>
                              </div>
                              <Button
                                isIconOnly
                                className="h-8 w-8 min-w-8 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                                size="sm"
                                variant="flat"
                                onPress={() => handleEditContent(section)}
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              {section.type === "ProductRail" && (
                                <Button
                                  isIconOnly
                                  className="h-8 w-8 min-w-8 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400"
                                  size="sm"
                                  variant="flat"
                                  onPress={() => originalIndex !== -1 && deleteSection(originalIndex)}
                                >
                                  <IconTrash className="h-4 w-4" />
                                </Button>
                              )}
                              <Switch
                                checked={enabled}
                                className="data-[state=checked]:bg-primary"
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
                      <strong>Tip:</strong> Click &quot;Add Section&quot; to add any section type available for this template. You can add multiple ProductRail sections with different filters (liquidated, new arrivals, categories, brands, etc).
                    </p>
                  </div>
                </TabsContent>

                {/* SITE INFO TAB */}
                <TabsContent className="pt-4" value="siteInfo">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div className="space-y-4 p-5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">Basic Information</h4>
                          </div>
                          <Button
                            className="h-7 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 border-0"
                            size="sm"
                            variant="flat"
                            onPress={() => {
                              setSiteConfig(config.siteConfig);
                              toast.success("Site info reset");
                            }}
                          >
                            Reset
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-blue-500">●</span> Site Name
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                              placeholder="Commerce SXVA"
                              type="text"
                              value={siteConfig.name}
                              onChange={(e) => setSiteConfig({ ...siteConfig, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-indigo-500">●</span> Short Name
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                              placeholder="SXVA"
                              type="text"
                              value={siteConfig.shortName}
                              onChange={(e) => setSiteConfig({ ...siteConfig, shortName: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                            <span className="text-violet-500">●</span> Description
                          </label>
                          <textarea
                            className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                            placeholder="Site description for SEO"
                            rows={3}
                            value={siteConfig.description}
                            onChange={(e) => setSiteConfig({ ...siteConfig, description: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                            <span className="text-purple-500">●</span> Site URL
                          </label>
                          <input
                            className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-purple-500 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono"
                            placeholder="https://example.com"
                            type="text"
                            value={siteConfig.url}
                            onChange={(e) => setSiteConfig({ ...siteConfig, url: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Assets & Media */}
                      <div className="space-y-4 p-5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-2 bg-green-500/10 rounded-lg">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">Assets & Media</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-green-500">●</span> Logo Path
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-green-500 dark:focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-mono"
                              placeholder="/svg/logo.svg"
                              type="text"
                              value={siteConfig.logo}
                              onChange={(e) => setSiteConfig({ ...siteConfig, logo: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-teal-500">●</span> Favicon Path
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-mono"
                              placeholder="/favicons/favicon.ico"
                              type="text"
                              value={siteConfig.favicon}
                              onChange={(e) => setSiteConfig({ ...siteConfig, favicon: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                            <span className="text-cyan-500">●</span> OG Image Path
                          </label>
                          <input
                            className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
                            placeholder="/ogtest.jpg"
                            type="text"
                            value={siteConfig.ogImage}
                            onChange={(e) => setSiteConfig({ ...siteConfig, ogImage: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Localization */}
                      <div className="space-y-4 p-5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-2 bg-orange-500/10 rounded-lg">
                            <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">Localization & Currency</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-orange-500">●</span> Default Locale
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-mono"
                              placeholder="en"
                              type="text"
                              value={siteConfig.localeDefault}
                              onChange={(e) => setSiteConfig({ ...siteConfig, localeDefault: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-amber-500">●</span> Currency
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                              placeholder="USD"
                              type="text"
                              value={siteConfig.currency}
                              onChange={(e) => setSiteConfig({ ...siteConfig, currency: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                            <span className="text-yellow-500">●</span> Available Locales <span className="text-slate-400 font-normal">(comma-separated)</span>
                          </label>
                          <input
                            className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-yellow-500 dark:focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all font-mono"
                            placeholder="en,ka"
                            type="text"
                            value={siteConfig.locales.join(",")}
                            onChange={(e) => setSiteConfig({ ...siteConfig, locales: e.target.value.split(",").map(l => l.trim()).filter(Boolean) })}
                          />
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="space-y-4 p-5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-2 bg-pink-500/10 rounded-lg">
                            <svg className="w-4 h-4 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">Social Media Links</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-blue-500">●</span> Twitter URL
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                              placeholder="https://twitter.com/..."
                              type="text"
                              value={siteConfig.links.twitter || ""}
                              onChange={(e) => setSiteConfig({ ...siteConfig, links: { ...siteConfig.links, twitter: e.target.value } })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-pink-500">●</span> Instagram URL
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-pink-500 dark:focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all font-mono"
                              placeholder="https://instagram.com/..."
                              type="text"
                              value={siteConfig.links.instagram || ""}
                              onChange={(e) => setSiteConfig({ ...siteConfig, links: { ...siteConfig.links, instagram: e.target.value } })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-indigo-500">●</span> Facebook URL
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                              placeholder="https://facebook.com/..."
                              type="text"
                              value={siteConfig.links.facebook || ""}
                              onChange={(e) => setSiteConfig({ ...siteConfig, links: { ...siteConfig.links, facebook: e.target.value } })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-red-500">●</span> YouTube URL
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-red-500 dark:focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
                              placeholder="https://youtube.com/..."
                              type="text"
                              value={siteConfig.links.youtube || ""}
                              onChange={(e) => setSiteConfig({ ...siteConfig, links: { ...siteConfig.links, youtube: e.target.value } })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border-2 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20 p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg mt-0.5">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-sm text-blue-900 dark:text-blue-100 mb-1">Site Information</h5>
                            <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                              These settings control your site metadata, SEO information, branding assets, and social media links. Changes will affect how your site appears in search results and social media shares.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* SETTINGS/CONFIG TAB */}
                <TabsContent className="pt-4" value="config">
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                      {/* Merchant Type Configuration */}
                      <div className="space-y-4 p-5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">Merchant Type</h4>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Choose your merchant type to control product management workflow:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all text-left ${
                                merchantType === "FINA"
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-blue-300 dark:hover:border-blue-700"
                              }`}
                              type="button"
                              onClick={() => setMerchantType("FINA")}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-blue-500/10 rounded">
                                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                  </div>
                                  <h5 className="font-bold text-base">FINA Sync</h5>
                                </div>
                                {merchantType === "FINA" && (
                                  <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                Sync products and categories from FINA system automatically
                              </p>
                            </button>

                            <button
                              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all text-left ${
                                merchantType === "CUSTOM"
                                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-emerald-300 dark:hover:border-emerald-700"
                              }`}
                              type="button"
                              onClick={() => setMerchantType("CUSTOM")}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-emerald-500/10 rounded">
                                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </div>
                                  <h5 className="font-bold text-base">Custom</h5>
                                </div>
                                {merchantType === "CUSTOM" && (
                                  <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                Add and manage products and categories manually
                              </p>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* OAuth Configuration */}
                      <div className="space-y-4 p-5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">OAuth Authentication</h4>
                          </div>
                          <Button
                            className="h-7 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 border-0"
                            size="sm"
                            variant="flat"
                            onPress={() => {
                              setConfigSettings({
                                ...configSettings,
                                GOOGLE_CLIENT_ID: "",
                                GOOGLE_CLIENT_SECRET: "",
                                FB_CLIENT_ID: "",
                                FB_CLIENT_SECRET: "",
                                AUTHORIZATION_GOOGLE_USER_INFO_URL: "",
                                REFRESH_TOKEN_EXPIRE_TIME: "",
                              });
                              toast.success("OAuth settings cleared");
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-blue-500">●</span> Google Client ID
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                              placeholder="Enter Google Client ID"
                              type="text"
                              value={configSettings.GOOGLE_CLIENT_ID}
                              onChange={(e) =>
                                setConfigSettings({ ...configSettings, GOOGLE_CLIENT_ID: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-blue-500">●</span> Google Client Secret
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                              placeholder="Enter Google Client Secret"
                              type="password"
                              value={configSettings.GOOGLE_CLIENT_SECRET}
                              onChange={(e) =>
                                setConfigSettings({ ...configSettings, GOOGLE_CLIENT_SECRET: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-indigo-500">●</span> Facebook Client ID
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                              placeholder="Enter Facebook Client ID"
                              type="text"
                              value={configSettings.FB_CLIENT_ID}
                              onChange={(e) =>
                                setConfigSettings({ ...configSettings, FB_CLIENT_ID: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-indigo-500">●</span> Facebook Client Secret
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                              placeholder="Enter Facebook Client Secret"
                              type="password"
                              value={configSettings.FB_CLIENT_SECRET}
                              onChange={(e) =>
                                setConfigSettings({ ...configSettings, FB_CLIENT_SECRET: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-1 pt-2">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                            <span className="text-violet-500">●</span> Google User Info URL
                          </label>
                          <input
                            className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-mono"
                            placeholder="https://www.googleapis.com/oauth2/v1/userinfo"
                            type="text"
                            value={configSettings.AUTHORIZATION_GOOGLE_USER_INFO_URL}
                            onChange={(e) =>
                              setConfigSettings({ ...configSettings, AUTHORIZATION_GOOGLE_USER_INFO_URL: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                            <span className="text-amber-500">●</span> Refresh Token Expire Time <span className="text-slate-400 font-normal">(seconds)</span>
                          </label>
                          <input
                            className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                            placeholder="604800 (7 days)"
                            type="text"
                            value={configSettings.REFRESH_TOKEN_EXPIRE_TIME}
                            onChange={(e) =>
                              setConfigSettings({ ...configSettings, REFRESH_TOKEN_EXPIRE_TIME: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      {/* FINA Configuration */}
                      <div className="space-y-4 p-5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">FINA Integration</h4>
                          </div>
                          <Button
                            className="h-7 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 border-0"
                            size="sm"
                            variant="flat"
                            onPress={() => {
                              setConfigSettings({
                                ...configSettings,
                                FINA_IP: "",
                                FINA_LOGIN: "",
                                FINA_PASSWORD: "",
                              });
                              toast.success("FINA settings cleared");
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-emerald-500">●</span> FINA IP Address
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                              placeholder="192.168.1.100"
                              type="text"
                              value={configSettings.FINA_IP}
                              onChange={(e) =>
                                setConfigSettings({ ...configSettings, FINA_IP: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-teal-500">●</span> FINA Login
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                              placeholder="Enter FINA username"
                              type="text"
                              value={configSettings.FINA_LOGIN}
                              onChange={(e) =>
                                setConfigSettings({ ...configSettings, FINA_LOGIN: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                            <span className="text-cyan-500">●</span> FINA Password
                          </label>
                          <input
                            className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                            placeholder="Enter FINA password"
                            type="password"
                            value={configSettings.FINA_PASSWORD}
                            onChange={(e) =>
                              setConfigSettings({ ...configSettings, FINA_PASSWORD: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      {/* AWS S3 Configuration */}
                      <div className="space-y-4 p-5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                              <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                              </svg>
                            </div>
                            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">AWS S3 Storage</h4>
                          </div>
                          <Button
                            className="h-7 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 border-0"
                            size="sm"
                            variant="flat"
                            onPress={() => {
                              setConfigSettings({
                                ...configSettings,
                                AWS_ACCESS_KEY_ID: "",
                                AWS_SECRET_ACCESS_KEY: "",
                                AWS_REGION: "",
                                AWS_BUCKET_NAME: "",
                              });
                              toast.success("AWS settings cleared");
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-orange-500">●</span> Access Key ID
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-mono"
                              placeholder="AKIAIOSFODNN7EXAMPLE"
                              type="text"
                              value={configSettings.AWS_ACCESS_KEY_ID}
                              onChange={(e) =>
                                setConfigSettings({ ...configSettings, AWS_ACCESS_KEY_ID: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-red-500">●</span> Secret Access Key
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-red-500 dark:focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
                              placeholder="wJalrXUtnFEMI/K7MDENG/..."
                              type="password"
                              value={configSettings.AWS_SECRET_ACCESS_KEY}
                              onChange={(e) =>
                                setConfigSettings({ ...configSettings, AWS_SECRET_ACCESS_KEY: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-amber-500">●</span> Region
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                              placeholder="us-east-1"
                              type="text"
                              value={configSettings.AWS_REGION}
                              onChange={(e) =>
                                setConfigSettings({ ...configSettings, AWS_REGION: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block flex items-center gap-1">
                              <span className="text-yellow-500">●</span> Bucket Name
                            </label>
                            <input
                              className="w-full px-3 py-2.5 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-yellow-500 dark:focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                              placeholder="my-s3-bucket"
                              type="text"
                              value={configSettings.AWS_BUCKET_NAME}
                              onChange={(e) =>
                                setConfigSettings({ ...configSettings, AWS_BUCKET_NAME: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg mt-0.5">
                            <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">Security Notice</h5>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                              These credentials are stored securely and encrypted in your tenant configuration. Only use production credentials in production environments. Never share these values publicly.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md hover:shadow-xl transition-all duration-300 disabled:opacity-50"
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

    {/* Add Section Modal - Using portal to render outside DOM hierarchy */}
    {showAddSectionModal && isOpen && typeof document !== 'undefined' && createPortal(
      <div
        aria-label="Close modal"
        className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        role="button"
        style={{ zIndex: 999999 }}
        tabIndex={0}
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowAddSectionModal(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            setShowAddSectionModal(false);
          }
        }}
      >
        <div
          aria-modal="true"
          className="relative max-w-md w-full mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-800 p-6"
          role="dialog"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Add Section
            </h3>
            <button
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              onClick={() => setShowAddSectionModal(false)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Select a section type to add to your homepage:
          </p>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {availableSections.map((sectionType) => (
              <button
                key={sectionType}
                className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all"
                onClick={() => addSection(sectionType)}
              >
                <IconPlus className="h-5 w-5 text-green-600" />
                <span className="font-medium">{getSectionLabel(sectionType)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
