
"use client";

import type { UdhariBill } from "@/app/page";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';
import { NotebookText } from "lucide-react";
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


interface UdhariDialogProps {
    udhariBills: UdhariBill[];
    settledUdhariBills: UdhariBill[];
    onAddToBill: (udhariBill: UdhariBill) => void;
    activeTable: string;
}

const UdhariBillCard = ({ bill, onAddToBill, activeTable }: { bill: UdhariBill, onAddToBill?: (udhariBill: UdhariBill) => void, activeTable?: string }) => (
    <div className="p-3 rounded-lg border bg-card">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-lg">{bill.customerName}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(bill.date), "PPpp")}</p>
            </div>
            <div className="text-right">
                <p className="font-bold text-lg">Rs.{bill.totalAmount.toFixed(2)}</p>
                {onAddToBill && activeTable && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="mt-1">Add to Bill</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will add the udhari of Rs.{bill.totalAmount.toFixed(2)} for {bill.customerName} to the current bill for {activeTable === 'Parcel' ? 'the parcel' : `Table ${activeTable}`} and settle this udhari.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onAddToBill(bill)}>
                                    Confirm & Add to Bill
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
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


export function UdhariDialog({ udhariBills, settledUdhariBills, onAddToBill, activeTable }: UdhariDialogProps) {

    const totalUdhari = udhariBills.reduce((acc, bill) => acc + bill.totalAmount, 0);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <NotebookText className="mr-0 sm:mr-2 h-4 w-4" /> 
                    <span className="hidden sm:inline">View Udhari ({udhariBills.length})</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-headline text-2xl flex justify-between items-center pr-8">
                        <span>Udhari (Credit) List</span>
                    </DialogTitle>
                </DialogHeader>
                 <Tabs defaultValue="active" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="active">Active ({udhariBills.length})</TabsTrigger>
                        <TabsTrigger value="settled">Settled ({settledUdhariBills.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="active">
                         <div className="flex justify-between items-center pr-6 my-2">
                            <span className="text-lg font-bold">Total Due:</span>
                            <span className="text-lg font-bold">Rs.{totalUdhari.toFixed(2)}</span>
                        </div>
                        <ScrollArea className="h-[55vh] pr-6">
                            {udhariBills.length === 0 ? (
                                <p className="text-center text-muted-foreground py-10">No active Udhari bills.</p>
                            ) : (
                                <div className="space-y-4">
                                    {udhariBills.map(bill => (
                                        <UdhariBillCard key={bill.id} bill={bill} onAddToBill={onAddToBill} activeTable={activeTable} />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="settled">
                        <ScrollArea className="h-[60vh] pr-6">
                            {settledUdhariBills.length === 0 ? (
                                <p className="text-center text-muted-foreground py-10">No settled Udhari bills yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {settledUdhariBills.map(bill => (
                                        <UdhariBillCard key={bill.id} bill={bill} />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
