
"use client";

import { useState, useMemo, useRef } from "react";
import type { BillItem, UdhariBill, SettledBill } from "@/app/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, Printer, BookUser, CreditCard, Landmark, Download } from "lucide-react";
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

  const handlePrint = () => {
    window.print();
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
      notes: "",
    };
    onSaveToUdhari(udhariBill);
    toast({
      title: "Saved to Udhari",
      description: `Bill for ${customerName.trim()} has been saved to Udhari.`,
    });
    setCustomerName("");
  };

  const isParcel = activeTable === 'Parcel';
  
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
            className="text-base sm:text-sm"
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
                <Button size="lg" className="w-full text-base sm:text-sm" onClick={handleGenerateBill} disabled={items.length === 0}>
                  <Printer className="mr-2 h-4 w-4" /> Generate Bill
                </Button>
              </DialogTrigger>
              {billNumber && (
                <DialogContent className="sm:max-w-md flex flex-col max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle className="font-headline">Bill Preview & Payment</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="flex-grow pr-6 -mr-6">
                    <div id="bill-to-print" ref={billContentRef} className="p-4 sm:p-6 bg-white text-black rounded-lg font-sans">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold font-headline text-gray-800">हॉटेल सुग्ररण</h3>
                        <p className="text-sm text-gray-500">Official Bill Receipt</p>
                      </div>
                      <Separator className="my-4 border-dashed border-gray-400" />
                      <div className="grid grid-cols-2 gap-x-4 text-xs mb-4">
                        <div><strong>Bill No:</strong> <span className="font-mono">{billNumber}</span></div>
                        <div className="text-right"><strong>Date:</strong> {billDate}</div>
                        <div><strong>{isParcel ? 'Order:' : 'Table:'}</strong> {activeTable}</div>
                        {customerName && <div className="text-right"><strong>Customer:</strong> {customerName}</div>}
                      </div>
                      <Separator className="my-4 border-dashed border-gray-400"/>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-gray-300">
                            <th className="text-left py-2 font-semibold text-gray-600">Item</th>
                            <th className="text-center py-2 font-semibold text-gray-600">Qty</th>
                            <th className="text-right py-2 font-semibold text-gray-600">Price</th>
                            <th className="text-right py-2 font-semibold text-gray-600">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map(item => (
                            <tr key={item.id} className="border-b border-gray-200">
                              <td className="py-2">{item.name}</td>
                              <td className="text-center py-2">{item.quantity}</td>
                              <td className="text-right py-2 font-mono">Rs.{item.price.toFixed(2)}</td>
                              <td className="text-right py-2 font-mono">Rs.{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-4 text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium font-mono">Rs.{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">GST ({(GST_RATE * 100).toFixed(0)}%):</span>
                          <span className="font-medium font-mono">Rs.{gstAmount.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2 border-dashed border-gray-400" />
                        <div className="flex justify-between font-bold text-lg text-gray-800">
                          <span>TOTAL:</span>
                          <span className="font-mono">Rs.{totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      <Separator className="my-4 border-dashed border-gray-400" />
                      <div className="mt-6 flex flex-col items-center justify-center">
                          <p className="text-sm font-semibold text-gray-700">Scan QR to Pay Online</p>
                          <div className="mt-2 p-2 bg-white inline-block rounded-lg shadow-md border">
                            <QRCode 
                              value={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR`}
                              size={120}
                              quietZone={10}
                              fgColor="#000000"
                            />
                          </div>
                          <p className="text-xs mt-2 font-mono text-gray-600">UPI: {UPI_ID}</p>
                        </div>
                      <p className="text-center text-xs text-gray-500 mt-6">Thank you for your visit!</p>
                    </div>
                  </ScrollArea>
                  <DialogFooter className="pt-4 flex-wrap items-center justify-between border-t mt-auto">
                     <div className="flex gap-2 mb-2 sm:mb-0">
                       <Button variant="secondary" size="sm" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</Button>
                       <Button variant="secondary" size="sm" onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4" />PDF</Button>
                     </div>
                     <div className="flex gap-2">
                        <DialogClose asChild>
                           <Button size="sm" onClick={() => handlePayment('Cash')}><Landmark className="mr-2 h-4 w-4" /> Paid by Cash</Button>
                        </DialogClose>
                        <DialogClose asChild>
                           <Button size="sm" onClick={() => handlePayment('Online')}><CreditCard className="mr-2 h-4 w-4" /> Paid Online</Button>
                        </DialogClose>
                     </div>
                  </DialogFooter>
                </DialogContent>
              )}
            </Dialog>
            <Button variant="secondary" onClick={handleSaveToUdhari} disabled={items.length === 0} className="text-base sm:text-sm">
              <BookUser className="mr-2 h-4 w-4" /> Save to Udhari
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

    