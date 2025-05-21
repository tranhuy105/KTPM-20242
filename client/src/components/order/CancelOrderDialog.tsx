import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Loader2 } from "lucide-react";

interface CancelOrderDialogProps {
  orderId: string;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (orderId: string, reason: string) => Promise<void>;
}

export function CancelOrderDialog({
  orderId,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState("");
  const { t } = useTranslation();

  const handleConfirm = async () => {
    await onConfirm(
      orderId,
      reason || t("orders.defaultCancelReason") || "Cancelled by customer"
    );
    setReason(""); // Reset reason after confirmation
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("orders.cancelOrderTitle")}</DialogTitle>
          <DialogDescription>
            {t("orders.cancelOrderDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder={t("orders.cancelReasonPlaceholder")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("orders.cancelling")}
              </>
            ) : (
              t("orders.confirmCancellation")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
