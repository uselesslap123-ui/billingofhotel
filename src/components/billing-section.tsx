
"use client";

import { useState, useMemo, useRef } from "react";
import type { BillItem, UdhariBill, SettledBill } from "@/app/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, Printer, BookUser, CreditCard, Landmark } from "lucide-react";
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
import { QRCode } from "react-qrcode-logo";

interface BillingSectionProps {
  items: BillItem[];
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onClearBill: () => void;
  onSaveToUdhari: (udhariBill: UdhariBill) => void;
  onRecordPayment: (settledBill: SettledBill) => void;
  activeTable: string;
}

const GST_RATE = 0.05; // 5%
const UPI_ID = "8530378745@axl";
const PAYEE_NAME = "Hotel Sugaran";

export function BillingSection({ items, onUpdateQuantity, onClearBill, onSaveToUdhari, onRecordPayment, activeTable }: BillingSectionProps) {
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
        description: `Please add items to the ${activeTable === 'Parcel' ? 'parcel' : `bill for Table ${activeTable}`} before generating.`,
        variant: "destructive",
      });
      return false;
    }
    setBillNumber(`HSB-${Date.now()}`);
    setBillDate(new Date().toLocaleString());
    return true;
  };

  const handlePayment = (method: 'Cash' | 'Online') => {
    const settledBill: SettledBill = {
      id: `SETTLED-${Date.now()}`,
      items: items,
      totalAmount: totalAmount,
      date: new Date().toISOString(),
      paymentMethod: method,
      table: activeTable
    };
    onRecordPayment(settledBill);
    toast({
      title: "Payment Recorded",
      description: `Bill for ${activeTable === 'Parcel' ? 'Parcel' : `Table ${activeTable}`} of Rs.${totalAmount.toFixed(2)} paid by ${method}.`,
    });
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

  const handleSaveToUdhari = () => {
    if (items.length === 0) {
      toast({
        title: "Empty Bill",
        description: "Cannot save an empty bill to Udhari.",
        variant: "destructive",
      });
      return;
    }
    if (!customerName.trim()) {
      toast({
        title: "Customer Name Required",
        description: "Please enter a customer name for the Udhari bill.",
        variant: "destructive",
      });
      return;
    }

    const udhariBill: UdhariBill = {
      id: `UDHARI-${Date.now()}`,
      customerName: customerName.trim(),
      items: items,
      totalAmount: totalAmount,
      date: new Date().toISOString(),
    };
    onSaveToUdhari(udhariBill);
    toast({
      title: "Saved to Udhari",
      description: `Bill for ${customerName.trim()} has been saved to Udhari.`,
    });
    setCustomerName("");
  };

  const isParcel = activeTable === 'Parcel';
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR`;
  
  const logoSvg = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" rx="20" fill="white"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="PT Sans, sans-serif" font-size="60" font-weight="bold" fill="#008080">S</text></svg>`;
  const logoDataUri = `data:image/svg+xml;base64,${btoa(logoSvg)}`;


  return (
    <Card className="sticky top-20 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex justify-between items-center">
          <span>{isParcel ? 'Parcel Bill' : `Table ${activeTable} Bill`}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Customer Name (for Udhari/Invoice)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <ScrollArea className="h-64 pr-4">
            <div className="space-y-3">
              {items.length === 0 && (
                <p className="text-center text-muted-foreground py-10">
                  No items added for {isParcel ? 'this parcel' : `Table ${activeTable}`}.
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
          <div className="grid grid-cols-2 gap-2">
            <Dialog onOpenChange={(open) => !open && setBillNumber('')}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full" onClick={handleGenerateBill} disabled={items.length === 0}>
                  <Printer className="mr-2 h-4 w-4" /> Generate Bill
                </Button>
              </DialogTrigger>
              {billNumber && (
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-headline">Bill Preview & Payment</DialogTitle>
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
                    <div className="flex justify-between text-xs mb-2">
                      <p><strong>{isParcel ? 'Order Type:' : 'Table No:'}</strong> {activeTable}</p>
                      {customerName && <p><strong>Customer:</strong> {customerName}</p>}
                    </div>
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
                     <div className="mt-4 flex flex-col items-center">
                        <p className="text-sm font-semibold">Scan to Pay</p>
                        <div className="mt-2 p-2 bg-white inline-block rounded-lg shadow-inner">
                          <QRCode 
                            value={upiUrl} 
                            size={128} 
                            quietZone={10}
                            qrStyle="dots"
                            eyeRadius={10}
                            logoImage={logoDataUri}
                            logoWidth={30}
                            logoHeight={30}
                            logoPadding={5}
                            logoPaddingStyle="circle"
                            fgColor="#004d4d"
                          />
                        </div>
                        <p className="text-xs mt-2">UPI ID: {UPI_ID}</p>
                      </div>
                     <p className="text-center text-[10px] mt-4">Thank you for your visit!</p>
                  </div>
                  <DialogFooter className="sm:justify-between">
                     <Button variant="secondary" onClick={handleDownloadPdf}>Download PDF</Button>
                     <div className="flex gap-2">
                        <DialogClose asChild>
                           <Button onClick={() => handlePayment('Cash')}><Landmark className="mr-2 h-4 w-4" /> Paid by Cash</Button>
                        </DialogClose>
                        <DialogClose asChild>
                           <Button onClick={() => handlePayment('Online')}><CreditCard className="mr-2 h-4 w-4" /> Paid Online</Button>
                        </DialogClose>
                     </div>
                  </DialogFooter>
                </DialogContent>
              )}
            </Dialog>
            <Button variant="secondary" onClick={handleSaveToUdhari} disabled={items.length === 0}>
              <BookUser className="mr-2 h-4 w-4" /> Save to Udhari
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

    

    

    