"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLang = params.lang as string || 'ka';

  const switchLanguage = (newLang: string) => {
    // Replace the language in the current path
    const segments = pathname.split('/');

    if (segments[1] === 'en' || segments[1] === 'ka') {
      segments[1] = newLang;
    } else {
      segments.splice(1, 0, newLang);
    }

    const newPath = segments.join('/');

    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className={currentLang === 'en' ? 'bg-accent' : ''}
          onClick={() => switchLanguage('en')}
        >
          <span className="mr-2">🇬🇧</span>
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          className={currentLang === 'ka' ? 'bg-accent' : ''}
          onClick={() => switchLanguage('ka')}
        >
          <span className="mr-2">🇬🇪</span>
          ქართული
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
