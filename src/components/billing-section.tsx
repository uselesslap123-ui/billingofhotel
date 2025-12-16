"use client";

import { useState, useMemo, useRef } from "react";
import type { BillItem } from "@/app/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "@/hooks/use-toast";

interface BillingSectionProps {
  items: BillItem[];
  onUpdateQuantity: (itemId: number, quantity: number) => void;
}

const GST_RATE = 0.05; // 5%

export function BillingSection({ items, onUpdateQuantity }: BillingSectionProps) {
  const [customerName, setCustomerName] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const billContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const gstAmount = useMemo(() => subtotal * GST_RATE, [subtotal]);
  const totalAmount = useMemo(() => subtotal + gstAmount, [subtotal, gstAmount]);

  const handleGenerateBill = () => {
    if (items.length === 0) {
      toast({
        title: "Empty Bill",
        description: "Please add items to the bill before generating.",
        variant: "destructive",
      });
      return false;
    }
    setBillNumber(`HSB-${Date.now()}`);
    setBillDate(new Date().toLocaleString());
    return true;
  };

  const handleDownloadPdf = () => {
    const input = billContentRef.current;
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const width = pdfWidth;
        const height = width / ratio;
        
        let finalHeight = height > pdf.internal.pageSize.getHeight() ? pdf.internal.pageSize.getHeight() : height;

        pdf.addImage(imgData, "PNG", 0, 0, width, finalHeight);
        pdf.save(`bill-${billNumber}.pdf`);
      });
    }
  };

  return (
    <Card className="sticky top-20 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Current Bill</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Customer Name (Optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <ScrollArea className="h-64 pr-4">
            <div className="space-y-3">
              {items.length === 0 && (
                <p className="text-center text-muted-foreground py-10">
                  No items added yet.
                </p>
              )}
              {items.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className="flex-grow">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Rs.{item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center tabular-nums">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                     <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive/80 hover:text-destructive"
                      onClick={() => onUpdateQuantity(item.id, 0)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {items.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">Rs.{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({(GST_RATE * 100).toFixed(0)}%)</span>
                  <span className="font-medium">Rs.{gstAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>Rs.{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}

          <Dialog onOpenChange={(open) => !open && setBillNumber('')}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full" onClick={handleGenerateBill} disabled={items.length === 0}>
                <Printer className="mr-2 h-4 w-4" /> Generate Bill
              </Button>
            </DialogTrigger>
            {billNumber && (
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-headline">Bill Details</DialogTitle>
                </DialogHeader>
                <div ref={billContentRef} className="p-6 bg-white text-black rounded-sm">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold font-headline">हॉटेल सुग्ररण</h3>
                    <p className="text-sm">Bill Receipt</p>
                  </div>
                  <Separator className="my-2 bg-gray-300" />
                  <div className="flex justify-between text-xs mb-2">
                    <p><strong>Bill No:</strong> {billNumber}</p>
                    <p><strong>Date:</strong> {billDate}</p>
                  </div>
                  {customerName && <p className="text-xs mb-2"><strong>Customer:</strong> {customerName}</p>}
                  <Separator className="my-2 bg-gray-300"/>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-1 font-semibold">Item</th>
                        <th className="text-center py-1 font-semibold">Qty</th>
                        <th className="text-right py-1 font-semibold">Price</th>
                        <th className="text-right py-1 font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id}>
                          <td className="py-1">{item.name}</td>
                          <td className="text-center py-1">{item.quantity}</td>
                          <td className="text-right py-1">Rs.{item.price.toFixed(2)}</td>
                          <td className="text-right py-1">Rs.{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Separator className="my-2 bg-gray-300" />
                  <div className="text-xs space-y-1 mt-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>Rs.{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST ({(GST_RATE * 100).toFixed(0)}%):</span>
                      <span>Rs.{gstAmount.toFixed(2)}</span>
                    </div>
                    <Separator className="my-1 bg-gray-300" />
                     <div className="flex justify-between font-bold">
                      <span>TOTAL:</span>
                      <span>Rs.{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                   <Separator className="my-2 bg-gray-300" />
                   <p className="text-center text-[10px] mt-4">Thank you for your visit!</p>
                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={handleDownloadPdf}>Download PDF</Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Close
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
