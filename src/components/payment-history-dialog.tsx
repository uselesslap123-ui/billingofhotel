
"use client";

import { useMemo, useState, useRef } from "react";
import type { SettledBill, UdhariBill } from "@/app/page";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { History, Landmark, CreditCard, TrendingUp, BarChart, Download, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "./ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


interface PaymentHistoryDialogProps {
    paymentHistory: SettledBill[];
    udhariBills: UdhariBill[];
}

const formatDate = (dateString: string | Date, formatString: string) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, formatString);
}


const SettledBillCard = ({ bill }: { bill: SettledBill }) => {
    const isMobile = useIsMobile();
    const dateFormat = isMobile ? "p" : "PPp";

    return (
    <div className="p-3 rounded-lg border bg-card">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="col-span-2 sm:col-span-1">
                <p className="font-bold text-lg">{bill.table === 'Parcel' ? 'Parcel' : `Table ${bill.table}`}</p>
                <p className="text-sm text-muted-foreground">{formatDate(bill.date, dateFormat)}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 sm:text-right">
                <p className="font-bold text-lg">Rs.{bill.totalAmount.toFixed(2)}</p>
                <div className="flex items-center sm:justify-end gap-1 text-sm text-muted-foreground mt-1">
                    {bill.paymentMethod === 'Cash' ? <Landmark className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                    <span>{bill.paymentMethod}</span>
                </div>
            </div>
        </div>
        <Separator className="my-2" />
        <details>
            <summary className="text-sm font-medium cursor-pointer">View Items ({bill.items.length})</summary>
            <ScrollArea className="max-h-32 mt-2">
              <ul className="pr-4 ml-4 text-sm text-muted-foreground list-disc space-y-1">
                  {bill.items.map(item => (
                      <li key={item.id}>
                          {item.name} x {item.quantity} - Rs.{(item.price * item.quantity).toFixed(2)}
                      </li>
                  ))}
              </ul>
            </ScrollArea>
        </details>
    </div>
)};

const SummaryCard = ({ title, data }: { title: string, data: any }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                    <span>Total Income:</span>
                    <span className="font-bold">Rs.{(data.cash + data.online).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Cash:</span>
                    <span>Rs.{data.cash.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Online:</span>
                    <span>Rs.{data.online.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                    <span>Udhari Given:</span>
                    <span>Rs.{data.udhari.toFixed(2)}</span>
                </div>
            </div>
        </CardContent>
    </Card>
)

type ItemSalesReport = {
    [itemName: string]: {
        quantity: number;
        total: number;
    }
}

export function PaymentHistoryDialog({ paymentHistory, udhariBills }: PaymentHistoryDialogProps) {
    const isMobile = useIsMobile();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const reportRef = useRef<HTMLDivElement>(null);
    
    const sortedHistory = useMemo(() => {
        return [...paymentHistory].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [paymentHistory]);

    const activeUdhariBills = useMemo(() => udhariBills.filter(b => b.status === 'active'), [udhariBills]);
    const settledUdhariBills = useMemo(() => udhariBills.filter(b => b.status === 'settled'), [udhariBills]);

    
    const filteredHistory = useMemo(() => {
        if (!selectedDate) return sortedHistory;
        return sortedHistory.filter(bill => format(new Date(bill.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'));
    }, [sortedHistory, selectedDate]);
    
    const selectedDateTotal = useMemo(() => {
        if(!selectedDate) return 0;
        return filteredHistory.reduce((acc, bill) => acc + bill.totalAmount, 0);
    }, [filteredHistory, selectedDate]);


    const calculateTotals = (payments: SettledBill[], udharis: UdhariBill[]) => {
        return {
            cash: payments.filter(p => p.paymentMethod === 'Cash').reduce((acc, bill) => acc + bill.totalAmount, 0),
            online: payments.filter(p => p.paymentMethod === 'Online').reduce((acc, bill) => acc + bill.totalAmount, 0),
            udhari: udharis.reduce((acc, bill) => acc + bill.totalAmount, 0)
        }
    }
    
    const dailyData = useMemo(() => {
        const dailyPayments = paymentHistory.filter(p => p.date && isToday(new Date(p.date)));
        const dailyUdharis = activeUdhariBills.filter(u => u.date && isToday(new Date(u.date)));
        return calculateTotals(dailyPayments, dailyUdharis);
    }, [paymentHistory, activeUdhariBills]);

    const weeklyData = useMemo(() => {
        const weeklyPayments = paymentHistory.filter(p => p.date && isThisWeek(new Date(p.date), { weekStartsOn: 1 }));
        const weeklyUdharis = activeUdhariBills.filter(u => u.date && isThisWeek(new Date(u.date), { weekStartsOn: 1 }));
        return calculateTotals(weeklyPayments, weeklyUdharis);
    }, [paymentHistory, activeUdhariBills]);

    const monthlyData = useMemo(() => {
        const monthlyPayments = paymentHistory.filter(p => p.date && isThisMonth(new Date(p.date)));
        const monthlyUdharis = activeUdhariBills.filter(u => u.date && isThisMonth(new Date(u.date)));
        return calculateTotals(monthlyPayments, monthlyUdharis);
    }, [paymentHistory, activeUdhariBills]);
    
    const allTimeData = useMemo(() => {
        return calculateTotals(paymentHistory, activeUdhariBills);
    }, [paymentHistory, activeUdhariBills]);


    const downloadHisabKitab = () => {
        const input = reportRef.current;
        if (input) {
            html2canvas(input, { scale: 2, useCORS: true, logging: true }).then((canvas) => {
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                const imgHeight = pdfWidth / ratio;
                
                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
                pdf.save(`Hisab_Kitab_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
            });
        }
    }


    const itemSalesReport = useMemo(() => {
        const report: ItemSalesReport = {};
        paymentHistory.forEach(bill => {
            bill.items.forEach(item => {
                if(!report[item.name]) {
                    report[item.name] = { quantity: 0, total: 0 };
                }
                report[item.name].quantity += item.quantity;
                report[item.name].total += item.price * item.quantity;
            });
        });
        return Object.entries(report).sort(([,a], [,b]) => b.quantity - a.quantity);
    }, [paymentHistory]);

    const mostSellingItems = useMemo(() => itemSalesReport.slice(0, 5), [itemSalesReport]);
    
    const cashPayments = useMemo(() => sortedHistory.filter(p => p.paymentMethod === 'Cash'), [sortedHistory]);
    const onlinePayments = useMemo(() => sortedHistory.filter(p => p.paymentMethod === 'Online'), [sortedHistory]);

    const totalSettledUdhari = useMemo(() => settledUdhariBills.reduce((acc, bill) => acc + bill.totalAmount, 0), [settledUdhariBills]);
    const totalUdhari = useMemo(() => activeUdhariBills.reduce((acc, bill) => acc + bill.totalAmount, 0), [activeUdhariBills]);

    const TriggerButton = () => (
         <Button variant="outline" size={isMobile ? "icon" : "default"}>
            <History className={isMobile ? "h-5 w-5" : "mr-2 h-4 w-4"} />
            <span className="hidden sm:inline">View History</span>
        </Button>
    )

    return (
        <>
        <div className="fixed -left-[9999px] top-0" aria-hidden>
             <div ref={reportRef} className="w-[800px] bg-white p-8">
                {/* This is a dummy div for PDF generation content. It will be populated later */}
             </div>
        </div>
        <Dialog>
            <DialogTrigger asChild>
                {isMobile ? (
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                               <TriggerButton />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>View History</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <TriggerButton />
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md md:max-w-2xl lg:max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl pr-8">Income &amp; History</DialogTitle>
                </DialogHeader>
                 <ScrollArea className="flex-grow -mx-6 px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <SummaryCard title="Today's Summary" data={dailyData} />
                        <SummaryCard title="This Week's Summary" data={weeklyData} />
                        <SummaryCard title="This Month's Summary" data={monthlyData} />
                        <SummaryCard title="All Time Summary" data={allTimeData} />
                    </div>
                    <Tabs defaultValue="all" className="mt-4">
                        <TabsList className="h-auto flex-wrap justify-center">
                            <TabsTrigger value="all">All Payments ({sortedHistory.length})</TabsTrigger>
                            <TabsTrigger value="cash">Cash ({cashPayments.length})</TabsTrigger>
                            <TabsTrigger value="online">Online ({onlinePayments.length})</TabsTrigger>
                            <TabsTrigger value="reports"><BarChart className="mr-2 h-4 w-4" />Reports</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="all" className="mt-4">
                             {selectedDate && (
                                <div className="flex items-center justify-between bg-primary/10 p-3 rounded-lg mb-4">
                                    <div>
                                        <p className="font-bold">Showing payments for {formatDate(selectedDate, "PPP")}</p>
                                        <p className="text-sm font-bold text-primary">Total Revenue: Rs.{selectedDateTotal.toFixed(2)}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedDate(undefined)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            {filteredHistory.length === 0 ? (
                                <p className="text-center text-muted-foreground py-10">
                                    {selectedDate ? `No payments recorded on ${formatDate(selectedDate, "PPP")}.` : "No payments recorded yet."}
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {filteredHistory.map(bill => <SettledBillCard key={bill.id} bill={bill} />)}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="cash" className="mt-4">
                            {cashPayments.length === 0 ? (
                                <p className="text-center text-muted-foreground py-10">No cash payments recorded.</p>
                            ) : (
                                <div className="space-y-4">
                                    {cashPayments.map(bill => <SettledBillCard key={bill.id} bill={bill} />)}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="online" className="mt-4">
                            {onlinePayments.length === 0 ? (
                                <p className="text-center text-muted-foreground py-10">No online payments recorded.</p>
                            ) : (
                                <div className="space-y-4">
                                    {onlinePayments.map(bill => <SettledBillCard key={bill.id} bill={bill} />)}
                                </div>
                            )}
                        </TabsContent>
                        
                        <TabsContent value="reports" className="mt-4">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <h3 className="font-headline text-lg mb-2">Item-wise Sales Report</h3>
                                     {itemSalesReport.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-10">No sales data to generate report.</p>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Item</TableHead>
                                                    <TableHead className="text-right">Quantity Sold</TableHead>
                                                    <TableHead className="text-right">Total Revenue</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {itemSalesReport.map(([name, data]) => (
                                                    <TableRow key={name}>
                                                        <TableCell className="font-medium">{name}</TableCell>
                                                        <TableCell className="text-right">{data.quantity}</TableCell>
                                                        <TableCell className="text-right">Rs.{data.total.toFixed(2)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                                <div className="space-y-4">
                                <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center"><TrendingUp className="mr-2 h-5 w-5"/>Most Selling Items</CardTitle>
                                            <CardDescription>Top 5 by quantity sold</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {mostSellingItems.length > 0 ? (
                                                <ul className="space-y-2 text-sm">
                                                    {mostSellingItems.map(([name, data]) => (
                                                        <li key={name} className="flex justify-between">
                                                            <span>{name}</span>
                                                            <span className="font-bold">{data.quantity} sold</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <p className="text-sm text-muted-foreground">No items sold yet.</p>}
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Payment Totals</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2"><Landmark className="h-4 w-4 text-muted-foreground"/> Cash</div>
                                                <span className="font-bold">Rs.{allTimeData.cash.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground"/> Online</div>
                                                <span className="font-bold">Rs.{allTimeData.online.toFixed(2)}</span>
                                            </div>
                                            <Separator className="my-2" />
                                            <div className="flex justify-between items-center font-bold text-base">
                                                <span>Total</span>
                                                <span>Rs.{(allTimeData.cash + allTimeData.online).toFixed(2)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </ScrollArea>
                <div className="mt-4 pt-4 border-t flex justify-end items-center gap-2">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" className="bg-red-500/15 text-red-500 border border-red-500/30 hover:bg-red-500/25 hover:text-red-600">
                             <Download className="mr-2 h-4 w-4"/> HISAB-KITAB
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Download Hisab-Kitab</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will download a PDF file of your complete payment history, including sales summaries and all active udhari bills.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={downloadHisabKitab}>Download PDF</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}
