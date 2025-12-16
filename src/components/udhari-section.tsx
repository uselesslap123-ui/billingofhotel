
"use client";

import type { UdhariBill } from "@/app/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';
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
} from "@/components/ui/alert-dialog"

interface UdhariSectionProps {
    udhariBills: UdhariBill[];
    onSettleUdhari: (udhariId: string) => void;
}

export function UdhariSection({ udhariBills, onSettleUdhari }: UdhariSectionProps) {

    const totalUdhari = udhariBills.reduce((acc, bill) => acc + bill.totalAmount, 0);

    if (udhariBills.length === 0) {
        return null;
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="font-headline text-xl">Udhari (Credit) List</CardTitle>
                <div className="text-lg font-bold">Total: Rs.{totalUdhari.toFixed(2)}</div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-72">
                    {udhariBills.length === 0 ? (
                        <p className="text-center text-muted-foreground py-10">No Udhari bills yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {udhariBills.map(bill => (
                                <div key={bill.id} className="p-3 rounded-lg border bg-card">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-lg">{bill.customerName}</p>
                                            <p className="text-sm text-muted-foreground">{format(new Date(bill.date), "PPpp")}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">Rs.{bill.totalAmount.toFixed(2)}</p>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="mt-1">Settle</Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will settle the udhari of Rs.{bill.totalAmount.toFixed(2)} for {bill.customerName}. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => onSettleUdhari(bill.id)}>
                                                            Confirm & Settle
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
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
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
