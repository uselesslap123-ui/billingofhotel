
"use client";

import { useMemo } from "react";
import type { Bills, BillItem } from "@/app/page";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ClipboardList } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";

interface CurrentBillsDialogProps {
    bills: Bills;
}

const GST_RATE = 0.05;

const BillCard = ({ table, items }: { table: string, items: BillItem[] }) => {
    const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.price * item.quantity, 0), [items]);
    const gstAmount = subtotal * GST_RATE;
    const totalAmount = subtotal + gstAmount;

    return (
        <Card>
            <CardHeader className="flex-row justify-between items-center pb-2">
                <CardTitle className="text-lg font-bold">{table === 'Parcel' ? 'Parcel' : `Table ${table}`}</CardTitle>
                <CardDescription className="text-lg font-bold">Rs.{totalAmount.toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent>
                <Separator className="mb-2" />
                <ul className="text-sm text-muted-foreground space-y-1">
                    {items.map(item => (
                        <li key={item.id} className="flex justify-between">
                            <span>{item.name} x {item.quantity}</span>
                            <span>Rs.{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

export function CurrentBillsDialog({ bills }: CurrentBillsDialogProps) {
    const activeBillEntries = Object.entries(bills).filter(([, items]) => items.length > 0);
    
    const totalActiveAmount = useMemo(() => {
        return activeBillEntries.reduce((total, [, billItems]) => {
            const items = Array.isArray(billItems) ? billItems : [];
            const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            const gstAmount = subtotal * GST_RATE;
            return total + subtotal + gstAmount;
        }, 0);
    }, [activeBillEntries]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <ClipboardList className="mr-0 sm:mr-2 h-4 w-4" /> 
                    <span className="hidden sm:inline">Current Bills ({activeBillEntries.length})</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl">Current Active Bills</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                     <Card className="mb-4">
                        <CardHeader>
                            <CardTitle className="flex justify-between">
                                <span>Total Active Amount:</span>
                                <span>Rs.{totalActiveAmount.toFixed(2)}</span>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <ScrollArea className="h-[60vh] pr-4">
                        {activeBillEntries.length === 0 ? (
                            <p className="text-center text-muted-foreground py-10">No active bills at the moment.</p>
                        ) : (
                            <div className="space-y-4">
                                {activeBillEntries.map(([table, items]) => (
                                     <BillCard key={table} table={table} items={Array.isArray(items) ? items : []} />
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
