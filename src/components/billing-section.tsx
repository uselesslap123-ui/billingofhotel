

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { BillItem, UdhariBill, SettledBill } from "@/app/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, Printer, BookUser, CreditCard, Landmark, Download, X } from "lucide-react";
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Progress } from "./ui/progress";

interface BillingSectionProps {
  items: BillItem[];
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onClearBill: () => void;
  onSaveToUdhari: (udhariBill: Omit<UdhariBill, 'id' | 'date' | 'status'>) => void;
  onRecordPayment: (settledBill: Omit<SettledBill, 'id' | 'date'>) => void;
  activeTable: string;
}

const GST_RATE = 0.05; // 5%
const UPI_ID = "8530378745@axl";
const PAYEE_NAME = "Hotel Sugaran";
const PAYMENT_TIMEOUT = 90; // 90 seconds

const QRCodeDialog = ({ upiUrl, totalAmount, onConfirmPayment }: { upiUrl: string, totalAmount: number, onConfirmPayment: () => void }) => {
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [countdown, setCountdown] = useState(PAYMENT_TIMEOUT);
    const { toast } = useToast();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isQrOpen) {
            setCountdown(PAYMENT_TIMEOUT);
            timerRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                         if(timerRef.current) clearInterval(timerRef.current);
                         setIsQrOpen(false);
                         toast({
                             variant: "destructive",
                             title: "Payment Timed Out",
                             description: "The QR code expired. Please try again.",
                         });
                         return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isQrOpen, toast]);
    
    const handlePaymentConfirm = () => {
        setIsQrOpen(false);
        onConfirmPayment();
    }
    
    const handleOpenChange = (open: boolean) => {
      setIsQrOpen(open);
    }
    
    const progress = (countdown / PAYMENT_TIMEOUT) * 100;

    return (
        <Dialog open={isQrOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="w-full"><CreditCard className="mr-2 h-4 w-4" /> Pay Online</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle className="font-headline">Scan to Pay</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4">
                    <div className="p-2 bg-white rounded-lg shadow-md border">
                        <QRCode value={upiUrl} size={200} quietZone={10} />
                    </div>
                    <p className="mt-4 font-bold text-xl">Total: Rs.{totalAmount.toFixed(2)}</p>
                    <p className="text-sm mt-1 font-mono text-muted-foreground">{UPI_ID}</p>
                </div>
                 <div className="px-4 space-y-2">
                    <Progress value={progress} className="h-2 border border-black [&>div]:bg-red-500" />
                    <p className="text-center text-sm text-muted-foreground">
                        Time remaining: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                    </p>
                </div>
                <DialogFooter>
                    <Button className="w-full" onClick={handlePaymentConfirm}>Confirm Payment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export function BillingSection({ items, onUpdateQuantity, onClearBill, onSaveToUdhari, onRecordPayment, activeTable }: BillingSectionProps) {
  const [customerName, setCustomerName] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const billContentRef = useRef<HTMLDivElement>(null);
  const [isSettleDialogOpen, setIsSettleDialogOpen] = useState(false);
  const { toast } = useToast();
  const [shake, setShake] = useState(false);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  const gstAmount = useMemo(() => subtotal * GST_RATE, [subtotal]);
  const totalAmount = useMemo(() => subtotal + gstAmount, [subtotal, gstAmount]);
  
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR`;

  const handleSettleBill = () => {
    if (items.length === 0) {
      toast({
        title: "Empty Bill",
        description: `Please add items to the ${activeTable === 'Parcel' ? 'parcel' : `bill for Table ${activeTable}`} before settling.`,
        variant: "destructive",
      });
      return false;
    }
    setBillNumber(`HSB-${Date.now()}`);
    setBillDate(new Date().toLocaleString());
    setIsSettleDialogOpen(true);
    return true;
  };

  const handlePayment = (method: 'Cash' | 'Online') => {
    const settledBill: Omit<SettledBill, 'id' | 'date'> = {
      items: items,
      totalAmount: totalAmount,
      paymentMethod: method,
      table: activeTable
    };
    onRecordPayment(settledBill);
    toast({
      title: "Payment Recorded",
      description: `Bill for ${activeTable === 'Parcel' ? 'Parcel' : `Table ${activeTable}`} of Rs.${totalAmount.toFixed(2)} paid by ${method}.`,
    });
    setIsSettleDialogOpen(false);
  };

  const generatePdf = async () => {
    const input = billContentRef.current;
    if (input) {
      // Ensure the content is visible for capture
      input.style.position = 'fixed';
      input.style.left = '0';
      input.style.top = '0';
      input.style.zIndex = '9999';
      input.style.background = 'white';

      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      
      // Hide the element again
      input.style.position = '';
      input.style.left = '';
      input.style.top = '';
      input.style.zIndex = '';
      input.style.background = '';
      
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [240, 360]
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const imgHeight = pdfWidth / ratio;
      
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, imgHeight);
      const namePart = customerName.trim().replace(/\s+/g, '_') || 'bill';
      const datePart = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      pdf.save(`${namePart}_${datePart}.pdf`);
    }
  };

  const handlePrint = () => {
    const input = billContentRef.current;
    if (input) {
      const printWindow = window.open('', '_blank');
      printWindow?.document.write('<html><head><title>Print Bill</title>');
      printWindow?.document.write('<style>@media print { body { -webkit-print-color-adjust: exact; } .bill-print-container { font-family: sans-serif; } }</style>');
      printWindow?.document.write('</head><body>');
      
      const contentToPrint = input.cloneNode(true) as HTMLElement;
      contentToPrint.style.width = '100%';
      contentToPrint.style.padding = '0';
      
      printWindow?.document.body.appendChild(contentToPrint);
      printWindow?.document.close();
      printWindow?.focus();

      setTimeout(() => {
        printWindow?.print();
        printWindow?.close();
      }, 250);
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
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const udhariBill: Omit<UdhariBill, 'id' | 'date' | 'status'> = {
      customerName: customerName.trim(),
      items: items,
      totalAmount: totalAmount,
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
    <>
      <div className="absolute top-0 -left-[9999px]" aria-hidden="true">
          <div ref={billContentRef} className="bill-print-container w-[80mm] p-2 bg-white text-black text-[10px]">
              <div className="border border-black p-2">
                  <div className="text-center mb-2">
                      <h3 className="text-lg font-bold font-headline text-black">हॉटेल सुग्ररण</h3>
                      <p className="text-[8px] mt-1">Contact: 8530378745</p>
                      <p className="text-xs font-bold mt-1">Official Bill Receipt</p>
                  </div>
                  
                  <div className="border-t border-b border-dashed border-black my-2 py-1">
                      <div className="flex justify-between text-[9px]">
                          <div className="font-mono"><strong>Bill:</strong> {billNumber}</div>
                          <div><strong>Date:</strong> {billDate}</div>
                      </div>
                      <div className="flex justify-between text-[9px] mt-1">
                          <div><strong>{isParcel ? 'Type:' : 'Table:'}</strong> {activeTable}</div>
                          {customerName && <div><strong>Cust:</strong> {customerName}</div>}
                      </div>
                  </div>
                                  
                  <table className="w-full text-[10px]">
                      <thead>
                          <tr className="border-b-2 border-black">
                              <th className="text-left py-1 font-bold">Item</th>
                              <th className="text-center py-1 font-bold">Qty</th>
                              <th className="text-right py-1 font-bold">Price</th>
                              <th className="text-right py-1 font-bold">Amount</th>
                          </tr>
                      </thead>
                      <tbody>
                          {items.map(item => (
                              <tr key={item.id} className="border-b border-dashed border-gray-400">
                                  <td className="py-1 pr-1">{item.name}</td>
                                  <td className="text-center py-1">{item.quantity}</td>
                                  <td className="text-right py-1 font-mono">{item.price.toFixed(2)}</td>
                                  <td className="text-right py-1 font-mono">{(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  
                  <div className="mt-2 text-xs flex justify-end">
                      <div className="w-full space-y-1">
                          <div className="flex justify-between">
                              <span>Subtotal:</span>
                              <span className="font-medium font-mono text-right">Rs.{subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                              <span>GST ({(GST_RATE * 100).toFixed(0)}%):</span>
                              <span className="font-medium font-mono text-right">Rs.{gstAmount.toFixed(2)}</span>
                          </div>
                          <div className="border-t border-black my-1"></div>
                          <div className="flex justify-between font-bold text-sm">
                              <span>TOTAL:</span>
                              <span className="font-mono text-right">Rs.{totalAmount.toFixed(2)}</span>
                          </div>
                      </div>
                  </div>

                  <div className="flex justify-between items-end mt-4 text-[9px]">
                      <div>
                          <p>Pay Mode: ____________</p>
                      </div>
                      <div className="text-center">
                          <p className="border-t border-black px-4 pt-1">Signature</p>
                      </div>
                  </div>
                  
                  <p className="text-center text-[9px] text-gray-700 mt-4">
                      Thank you for your visit!
                  </p>
              </div>
          </div>
        </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex justify-between items-center">
            <span>{isParcel ? 'Parcel Bill' : `Table ${activeTable} Bill`}</span>
            {items.length > 0 && 
                <Button variant="ghost" size="icon" onClick={onClearBill}>
                    <Trash2 className="h-5 w-5 text-destructive/80" />
                </Button>
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <Input
                placeholder="Customer Name (for Udhari/Invoice)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={cn("text-base sm:text-sm", shake && 'animate-shake')}
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
                <div className="space-y-2 pt-4">
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
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Dialog open={isSettleDialogOpen} onOpenChange={(open) => { if(!open) { setIsSettleDialogOpen(false); setBillNumber(''); } }}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full text-base sm:text-sm" onClick={handleSettleBill} disabled={items.length === 0}>
                    <Printer className="mr-2 h-4 w-4" /> Settle Bill
                  </Button>
                </DialogTrigger>
                {billNumber && (
                   <DialogContent className="max-w-sm">
                   <DialogHeader>
                     <DialogTitle className="font-headline">Bill Preview & Payment</DialogTitle>
                   </DialogHeader>
                   <ScrollArea className="max-h-[50vh]">
                     <div className="p-1">
                       <div className="bill-print-container w-full p-2 bg-white text-black text-[10px] border border-black">
                         <div className="text-center mb-2">
                           <h3 className="text-lg font-bold font-headline text-black">हॉटेल सुग्ररण</h3>
                           <p className="text-[8px] mt-1">Contact: 8530378745</p>
                           <p className="text-xs font-bold mt-1">Official Bill Receipt</p>
                         </div>
                         <div className="border-t border-b border-dashed border-black my-2 py-1">
                           <div className="flex justify-between text-[9px]">
                             <div className="font-mono"><strong>Bill:</strong> {billNumber}</div>
                             <div><strong>Date:</strong> {billDate}</div>
                           </div>
                           <div className="flex justify-between text-[9px] mt-1">
                             <div><strong>{isParcel ? 'Type:' : 'Table:'}</strong> {activeTable}</div>
                             {customerName && <div><strong>Cust:</strong> {customerName}</div>}
                           </div>
                         </div>
                         <table className="w-full text-[10px]">
                           <thead>
                             <tr className="border-b-2 border-black">
                               <th className="text-left py-1 font-bold">Item</th>
                               <th className="text-center py-1 font-bold">Qty</th>
                               <th className="text-right py-1 font-bold">Price</th>
                               <th className="text-right py-1 font-bold">Amount</th>
                             </tr>
                           </thead>
                           <tbody>
                             {items.map(item => (
                               <tr key={item.id} className="border-b border-dashed border-gray-400">
                                 <td className="py-1 pr-1">{item.name}</td>
                                 <td className="text-center py-1">{item.quantity}</td>
                                 <td className="text-right py-1 font-mono">{item.price.toFixed(2)}</td>
                                 <td className="text-right py-1 font-mono">{(item.price * item.quantity).toFixed(2)}</td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                         <div className="mt-2 text-xs flex justify-end">
                           <div className="w-full space-y-1">
                             <div className="flex justify-between">
                               <span>Subtotal:</span>
                               <span className="font-medium font-mono text-right">Rs.{subtotal.toFixed(2)}</span>
                             </div>
                             <div className="flex justify-between">
                               <span>GST ({(GST_RATE * 100).toFixed(0)}%):</span>
                               <span className="font-medium font-mono text-right">Rs.{gstAmount.toFixed(2)}</span>
                             </div>
                             <div className="border-t border-black my-1"></div>
                             <div className="flex justify-between font-bold text-sm">
                               <span>TOTAL:</span>
                               <span className="font-mono text-right">Rs.{totalAmount.toFixed(2)}</span>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   </ScrollArea>
                   <DialogFooter className="flex-col sm:flex-col sm:space-x-0 gap-2">
                     <div className="flex gap-2 w-full">
                       <Button variant="secondary" size="sm" onClick={handlePrint} className="flex-1">Print</Button>
                       <Button variant="secondary" size="sm" onClick={generatePdf} className="flex-1">PDF</Button>
                     </div>
                     <div className="flex-grow grid grid-cols-2 gap-2 w-full">
                       <QRCodeDialog
                         upiUrl={upiUrl}
                         totalAmount={totalAmount}
                         onConfirmPayment={() => handlePayment('Online')}
                       />
                       <DialogClose asChild>
                         <Button onClick={() => handlePayment('Cash')}><Landmark className="mr-2 h-4 w-4" /> Cash</Button>
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
    </>
  );
}
