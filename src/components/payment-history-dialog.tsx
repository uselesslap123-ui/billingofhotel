
"use client";

import { useMemo } from "react";
import type { SettledBill, UdhariBill, BillItem } from "@/app/page";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { History, Landmark, CreditCard, X, TrendingUp, BarChart } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface PaymentHistoryDialogProps {
    paymentHistory: SettledBill[];
    udhariBills: UdhariBill[];
}

const SettledBillCard = ({ bill }: { bill: SettledBill }) => {
    const isMobile = useIsMobile();
    const dateFormat = isMobile ? "p" : "PPp";

    return (
    <div className="p-3 rounded-lg border bg-card">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="col-span-2 sm:col-span-1">
                <p className="font-bold text-lg">{bill.table === 'Parcel' ? 'Parcel' : `Table ${bill.table}`}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(bill.date), dateFormat)}</p>
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
    const cashPayments = useMemo(() => paymentHistory.filter(p => p.paymentMethod === 'Cash'), [paymentHistory]);
    const onlinePayments = useMemo(() => paymentHistory.filter(p => p.paymentMethod === 'Online'), [paymentHistory]);
    
    const calculateTotals = (payments: SettledBill[], udharis: UdhariBill[]) => {
        return {
            cash: payments.filter(p => p.paymentMethod === 'Cash').reduce((acc, bill) => acc + bill.totalAmount, 0),
            online: payments.filter(p => p.paymentMethod === 'Online').reduce((acc, bill) => acc + bill.totalAmount, 0),
            udhari: udharis.reduce((acc, bill) => acc + bill.totalAmount, 0)
        }
    }

    const dailyData = useMemo(() => {
        const dailyPayments = paymentHistory.filter(p => isToday(new Date(p.date)));
        const dailyUdharis = udhariBills.filter(u => isToday(new Date(u.date)));
        return calculateTotals(dailyPayments, dailyUdharis);
    }, [paymentHistory, udhariBills]);

    const weeklyData = useMemo(() => {
        const weeklyPayments = paymentHistory.filter(p => isThisWeek(new Date(p.date), { weekStartsOn: 1 }));
        const weeklyUdharis = udhariBills.filter(u => isThisWeek(new Date(u.date), { weekStartsOn: 1 }));
        return calculateTotals(weeklyPayments, weeklyUdharis);
    }, [paymentHistory, udhariBills]);

    const monthlyData = useMemo(() => {
        const monthlyPayments = paymentHistory.filter(p => isThisMonth(new Date(p.date)));
        const monthlyUdharis = udhariBills.filter(u => isThisMonth(new Date(u.date)));
        return calculateTotals(monthlyPayments, monthlyUdharis);
    }, [paymentHistory, udhariBills]);
    
    const allTimeData = useMemo(() => {
        return calculateTotals(paymentHistory, udhariBills);
    }, [paymentHistory, udhariBills]);

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

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <History className="mr-0 sm:mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">View History</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md md:max-w-2xl lg:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Income &amp; History</DialogTitle>
                     <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <SummaryCard title="Today's Summary" data={dailyData} />
                    <SummaryCard title="This Week's Summary" data={weeklyData} />
                    <SummaryCard title="This Month's Summary" data={monthlyData} />
                    <SummaryCard title="All Time Summary" data={allTimeData} />
                </div>
                <Tabs defaultValue="all" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                        <TabsTrigger value="all">All Payments ({paymentHistory.length})</TabsTrigger>
                        <TabsTrigger value="cash">Cash ({cashPayments.length})</TabsTrigger>
                        <TabsTrigger value="online">Online ({onlinePayments.length})</TabsTrigger>
                        <TabsTrigger value="reports"><BarChart className="mr-2 h-4 w-4" />Reports</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all">
                        <ScrollArea className="h-[40vh] pr-6 mt-4">
                            {paymentHistory.length === 0 ? (
                                <p className="text-center text-muted-foreground py-10">No payments recorded yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {paymentHistory.map(bill => <SettledBillCard key={bill.id} bill={bill} />)}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="cash">
                         <ScrollArea className="h-[40vh] pr-6 mt-4">
                            {cashPayments.length === 0 ? (
                                <p className="text-center text-muted-foreground py-10">No cash payments recorded.</p>
                            ) : (
                                <div className="space-y-4">
                                    {cashPayments.map(bill => <SettledBillCard key={bill.id} bill={bill} />)}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="online">
                        <ScrollArea className="h-[40vh] pr-6 mt-4">
                            {onlinePayments.length === 0 ? (
                                <p className="text-center text-muted-foreground py-10">No online payments recorded.</p>
                            ) : (
                                <div className="space-y-4">
                                    {onlinePayments.map(bill => <SettledBillCard key={bill.id} bill={bill} />)}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                    
                    <TabsContent value="reports">
                        <div className="h-[40vh] mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <h3 className="font-headline text-lg mb-2">Item-wise Sales Report</h3>
                                <ScrollArea className="h-full pr-4 -mr-4">
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
                                </ScrollArea>
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
            </DialogContent>
        </Dialog>
    );
}
