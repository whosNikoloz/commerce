import { ChevronLeft } from "lucide-react";
import { Button } from "@heroui/button";

interface GoBackButtonProps {
  className?: string;
  size?: number;
  onClick: () => void;
}

export const GoBackButton: React.FC<GoBackButtonProps> = ({ className, size = 25, onClick }) => {
  return (
    <Button
      isIconOnly
      aria-label="Go back"
      className={`flex items-center bg-transparent gap-2 ${className || ""}`}
      onPress={onClick}
    >
      <ChevronLeft size={size} />
    </Button>
  );
};
