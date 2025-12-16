
"use client";

import { useState } from "react";
import type { UdhariBill } from "@/app/page";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import { NotebookText, NotebookPen, MessageSquareText, FilePenLine } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
    DialogClose,
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
    notepad: string;
    onNotepadChange: (value: string) => void;
    onUpdateUdhariNotes: (udhariId: string, notes: string) => void;
}

const UdhariBillNotepad = ({ bill, onSave }: { bill: UdhariBill, onSave: (notes: string) => void }) => {
    const [notes, setNotes] = useState(bill.notes || "");
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Notes for {bill.customerName}</DialogTitle>
            </DialogHeader>
            <Textarea
                placeholder="Add notes for this udhari bill..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button onClick={() => onSave(notes)}>Save Notes</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

const UdhariBillCard = ({ bill, onAddToBill, activeTable, onUpdateUdhariNotes }: { bill: UdhariBill, onAddToBill?: (udhariBill: UdhariBill) => void, activeTable?: string, onUpdateUdhariNotes: (udhariId: string, notes: string) => void }) => (
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
        <div className="flex justify-between items-center">
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
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant={bill.notes ? "secondary" : "ghost"} size="sm" className="gap-2">
                        {bill.notes ? <MessageSquareText className="h-4 w-4" /> : <FilePenLine className="h-4 w-4" />}
                        Notes
                    </Button>
                </DialogTrigger>
                <UdhariBillNotepad bill={bill} onSave={(notes) => onUpdateUdhariNotes(bill.id, notes)} />
            </Dialog>
        </div>
    </div>
);


export function UdhariDialog({ udhariBills, settledUdhariBills, onAddToBill, activeTable, notepad, onNotepadChange, onUpdateUdhariNotes }: UdhariDialogProps) {

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
                        <span>Udhari (Credit) List & Notepad</span>
                    </DialogTitle>
                </DialogHeader>
                 <Tabs defaultValue="active" className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="active">Active ({udhariBills.length})</TabsTrigger>
                        <TabsTrigger value="settled">Settled ({settledUdhariBills.length})</TabsTrigger>
                        <TabsTrigger value="notepad"><NotebookPen className="mr-2 h-4 w-4" />Notepad</TabsTrigger>
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
                                        <UdhariBillCard key={bill.id} bill={bill} onAddToBill={onAddToBill} activeTable={activeTable} onUpdateUdhariNotes={onUpdateUdhariNotes} />
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
                                        <UdhariBillCard key={bill.id} bill={bill} onUpdateUdhariNotes={onUpdateUdhariNotes} />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                     <TabsContent value="notepad">
                        <div className="h-[60vh] flex flex-col p-1">
                             <Textarea 
                                placeholder="Jot down notes, reminders, or anything else..."
                                className="flex-grow w-full rounded-md border border-input bg-transparent px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={notepad}
                                onChange={(e) => onNotepadChange(e.target.value)}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
