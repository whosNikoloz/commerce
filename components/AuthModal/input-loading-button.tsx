import { Button } from "@heroui/button";
import { IconCheck } from "../icons";

export const InputLoadingBtn = ({
  loading,
  success,
}: {
  loading: boolean;
  success: boolean;
}) => {
  if (loading) {
    return <Button isIconOnly className="bg-transparent" isLoading={loading} />;
  }
  if (success) return <IconCheck color="#00FF00" size={20} />;

  return <></>;
};
