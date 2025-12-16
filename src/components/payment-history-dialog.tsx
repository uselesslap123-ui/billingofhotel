
"use client";

import { useMemo } from "react";
import type { SettledBill } from "@/app/page";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';
import { History, Landmark, CreditCard } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface PaymentHistoryDialogProps {
    paymentHistory: SettledBill[];
}

const SettledBillCard = ({ bill }: { bill: SettledBill }) => (
    <div className="p-3 rounded-lg border bg-card">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-lg">{bill.table === 'Parcel' ? 'Parcel' : `Table ${bill.table}`}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(bill.date), "PPpp")}</p>
            </div>
            <div className="text-right">
                <p className="font-bold text-lg">Rs.{bill.totalAmount.toFixed(2)}</p>
                <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground mt-1">
                    {bill.paymentMethod === 'Cash' ? <Landmark className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                    <span>{bill.paymentMethod}</span>
                </div>
            </div>
        </div>
        <Separator className="my-2" />
        <details>
            <summary className="text-sm font-medium cursor-pointer">View Items ({bill.items.length})</summary>
            <ul className="mt-2 ml-4 text-sm text-muted-foreground list-disc space-y-1">
                {bill.items.map(item => (
                    <li key={item.id}>
                        {item.name} x {item.quantity} - Rs.{(item.price * item.quantity).toFixed(2)}
                    </li>
                ))}
            </ul>
        </details>
    </div>
);

export function PaymentHistoryDialog({ paymentHistory }: PaymentHistoryDialogProps) {
    const cashPayments = useMemo(() => paymentHistory.filter(p => p.paymentMethod === 'Cash'), [paymentHistory]);
    const onlinePayments = useMemo(() => paymentHistory.filter(p => p.paymentMethod === 'Online'), [paymentHistory]);
    
    const totalCash = useMemo(() => cashPayments.reduce((acc, bill) => acc + bill.totalAmount, 0), [cashPayments]);
    const totalOnline = useMemo(() => onlinePayments.reduce((acc, bill) => acc + bill.totalAmount, 0), [onlinePayments]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <History className="mr-2 h-4 w-4" /> View History
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Payment History</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="all" className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All ({paymentHistory.length})</TabsTrigger>
                        <TabsTrigger value="cash">Cash ({cashPayments.length})</TabsTrigger>
                        <TabsTrigger value="online">Online ({onlinePayments.length})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all">
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Total Collection: Rs.{(totalCash + totalOnline).toFixed(2)}</CardTitle>
                            </CardHeader>
                        </Card>
                        <ScrollArea className="h-[50vh] pr-6 mt-4">
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
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Total Cash Collection: Rs.{totalCash.toFixed(2)}</CardTitle>
                            </CardHeader>
                        </Card>
                         <ScrollArea className="h-[50vh] pr-6 mt-4">
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
                        <Card className="mt-4">
                             <CardHeader>
                                <CardTitle>Total Online Collection: Rs.{totalOnline.toFixed(2)}</CardTitle>
                            </CardHeader>
                        </Card>
                        <ScrollArea className="h-[50vh] pr-6 mt-4">
                            {onlinePayments.length === 0 ? (
                                <p className="text-center text-muted-foreground py-10">No online payments recorded.</p>
                            ) : (
                                <div className="space-y-4">
                                    {onlinePayments.map(bill => <SettledBillCard key={bill.id} bill={bill} />)}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
