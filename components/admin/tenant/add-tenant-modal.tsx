"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { IconCheck, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTenantModal({ isOpen, onClose }: AddTenantModalProps) {
  const isMobile = useIsMobile();
  const [domain, setDomain] = useState("");
  const [templateId, setTemplateId] = useState<"1" | "2" | "3">("1");
  const [themeColor, setThemeColor] = useState("#2563eb");
  const [themeMode, setThemeMode] = useState<"light" | "dark">("dark");
  const [loading, setLoading] = useState(false);

  const getDefaultTheme = (templateId: string, mode: string) => {
    const themes: Record<string, { light: string; dark: string }> = {
      "1": { light: "#2563eb", dark: "#2563eb" },
      "2": { light: "#10b981", dark: "#10b981" },
      "3": { light: "#a855f7", dark: "#a855f7" },
    };

    return themes[templateId]?.[mode as "light" | "dark"] || "#2563eb";
  };

  const handleTemplateChange = (value: string) => {
    setTemplateId(value as "1" | "2" | "3");
    setThemeColor(getDefaultTheme(value, themeMode));
  };

  const handleThemeModeChange = (value: string) => {
    setThemeMode(value as "light" | "dark");
  };

  const handleSubmit = async () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain name");
      return;
    }

    setLoading(true);

    try {
      const hexToRGB = (hex: string): string => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r} ${g} ${b}`;
      };

      const primaryRGB = hexToRGB(themeColor);

      const config = {
        templateId: parseInt(templateId) as 1 | 2 | 3,
        themeColor,
        theme: {
          mode: themeMode,
          brand: {
            primary: primaryRGB,
            primaryDark: primaryRGB,
            surface: "241 245 249",
            surfaceDark: "2 6 23",
            muted: "226 232 240",
            mutedDark: "16 24 41",
          },
          text: {
            light: "30 41 59",
            subtle: "100 116 139",
            lightDark: "228 221 222",
            subtleDark: "106 119 138",
          },
        },
        homepage: {
          templateId: parseInt(templateId) as 1 | 2 | 3,
          sections: [] as any[],
        },
      };

      const response = await fetch("/api/admin/tenants/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim(), config }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create tenant");
      }

      toast.success("Tenant created! Changes will be live in 2-3 minutes after deployment.");

      setDomain("");
      setTemplateId("1");
      setThemeColor("#2563eb");
      setThemeMode("dark");

      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Failed to create tenant");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateDescription = (id: string) => {
    switch (id) {
      case "1":
        return "Optimized for tech stores with search-driven discovery, product comparisons, and deal countdowns.";
      case "2":
        return "Perfect for furniture stores with lifestyle imagery, product configurators, and customer galleries.";
      case "3":
        return "Designed for beauty brands with social proof, influencer content, and bundle promotions.";
      default:
        return "";
    }
  };

  return (
    <Modal
      className="max-w-2xl"
      classNames={{
        backdrop: "bg-slate-900/80 backdrop-blur-xl",
        base: "rounded-t-2xl md:rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl",
        wrapper: "z-[998]",
      }}
      hideCloseButton={false}
      isOpen={isOpen}
      motionProps={{
        variants: {
          enter: { y: 40, opacity: 0, scale: 0.96, transition: { duration: 0 } },
          center: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.8 },
          },
          exit: {
            y: 40,
            opacity: 0,
            scale: 0.96,
            transition: { duration: 0.18, ease: "easeIn" },
          },
        },
        initial: "enter",
        animate: "center",
        exit: "exit",
      }}
      placement={isMobile ? "top" : "center"}
      scrollBehavior="inside"
      size={isMobile ? "full" : "2xl"}
      onClose={onClose}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader>
              <h3 className="text-xl font-semibold">Add New Tenant</h3>
            </ModalHeader>
            <ModalBody className="py-6">
              <Tabs className="w-full" defaultValue="basic">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="theme">Theme & Template</TabsTrigger>
                </TabsList>

                <TabsContent className="space-y-6 pt-4" value="basic">
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain *</Label>
                    <Input
                      id="domain"
                      placeholder="example.com or localhost:3000"
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Enter the domain name that will use this configuration
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template">Template *</Label>
                    <Select value={templateId} onValueChange={handleTemplateChange}>
                      <SelectTrigger id="template">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Template 1 - Tech/Electronics</span>
                            <span className="text-xs text-slate-500">
                              Search-focused, data-driven
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="2">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Template 2 - Home/Furniture</span>
                            <span className="text-xs text-slate-500">
                              Image-heavy, lifestyle-focused
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="3">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Template 3 - Beauty/Health</span>
                            <span className="text-xs text-slate-500">
                              Social proof, editorial
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {getTemplateDescription(templateId)}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent className="space-y-6 pt-4" value="theme">
                  <div className="space-y-2">
                    <Label htmlFor="themeMode">Theme Mode *</Label>
                    <Select value={themeMode} onValueChange={handleThemeModeChange}>
                      <SelectTrigger id="themeMode">
                        <SelectValue placeholder="Select theme mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light Mode</SelectItem>
                        <SelectItem value="dark">Dark Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="themeColor">Theme Color *</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        className="h-12 w-12 cursor-pointer p-1"
                        id="themeColor"
                        type="color"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                      />
                      <Input
                        className="flex-1 font-mono"
                        placeholder="#2563eb"
                        type="text"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Primary brand color for this tenant
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
                isLoading={loading}
                onPress={handleSubmit}
              >
                Create Tenant
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
