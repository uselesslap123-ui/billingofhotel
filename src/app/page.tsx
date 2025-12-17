
"use client";

import { useState } from "react";
import { collection, doc, writeBatch, deleteDoc, addDoc, updateDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useFirestore, useCollection } from "@/firebase";

import type { MenuItem } from "@/lib/menu-items";
import { MenuSection } from "@/components/menu-section";
import { BillingSection } from "@/components/billing-section";
import { UdhariDialog } from "@/components/udhari-dialog";
import { PaymentHistoryDialog } from "@/components/payment-history-dialog";
import { UtensilsCrossed } from "lucide-react";
import { TableLayout } from "@/components/table-layout";
import { CurrentBillsDialog } from "@/components/current-bills-dialog";
import { FirebaseProvider } from "@/firebase/client-provider";

export type BillItem = MenuItem & { quantity: number };

export type Bill = {
  id: string;
  items: BillItem[];
};
export type Bills = {
  [table: string]: Bill;
};

export type UdhariBill = {
  id: string;
  customerName: string;
  items: BillItem[];
  totalAmount: number;
  date: any;
  notes?: string;
  status: 'active' | 'settled';
};

export type SettledBill = {
  id: string;
  items: BillItem[];
  totalAmount: number;
  date: any;
  paymentMethod: "Cash" | "Online";
  table: string;
};

export type Note = {
  id: string;
  content: string;
  date: any;
};

const INITIAL_TABLES = [...Array.from({ length: 8 }, (_, i) => (i + 1).toString()), 'Parcel'];

function HomePage() {
  const firestore = useFirestore();
  const [activeTable, setActiveTable] = useState("1");
  const [tables, setTables] = useState<string[]>(INITIAL_TABLES);

  const { data: udhariBillsData, loading: loadingUdhari } = useCollection<UdhariBill>(
    firestore ? query(collection(firestore, "udhariBills"), orderBy("date", "desc")) : null
  );
  const { data: settledBillsData, loading: loadingSettled } = useCollection<SettledBill>(
    firestore ? query(collection(firestore, "settledBills"), orderBy("date", "desc")) : null
  );
  const { data: notesData, loading: loadingNotes } = useCollection<Note>(
     firestore ? query(collection(firestore, "notes"), orderBy("date", "desc")) : null
  );
  const { data: billsData, loading: loadingBills } = useCollection<Bill>(
    firestore ? collection(firestore, 'bills') : null
  );

  const bills: Bills = (billsData || []).reduce((acc: Bills, bill: Bill) => {
    acc[bill.id] = bill;
    return acc;
  }, {});
  
  const udhariBills = (udhariBillsData || []).filter(b => b.status === 'active');
  const settledUdhariBills = (udhariBillsData || []).filter(b => b.status === 'settled');


  const isLoaded = !loadingUdhari && !loadingSettled && !loadingNotes && !loadingBills && firestore;

  const handleAddTable = () => {
    setTables(prevTables => {
      const numericTables = prevTables
        .map(t => parseInt(t, 10))
        .filter(t => !isNaN(t));
      
      const nextTableNumber = numericTables.length > 0 ? Math.max(...numericTables) + 1 : 1;
      
      const newTables = [...prevTables];
      const parcelIndex = newTables.indexOf('Parcel');

      if (parcelIndex > -1) {
        newTables.splice(parcelIndex, 0, nextTableNumber.toString());
      } else {
        newTables.push(nextTableNumber.toString());
      }
      // Note: We are not saving tables to Firestore as it's part of local UI state for now.
      return newTables;
    });
  };

  const handleDeleteTable = async (tableToDelete: string) => {
    setTables(prevTables => {
      const newTables = prevTables.filter(t => t !== tableToDelete);
      if (activeTable === tableToDelete) {
        setActiveTable(newTables[0] || '1');
      }
      return newTables;
    });

    if (firestore && bills[tableToDelete]) {
      await deleteDoc(doc(firestore, "bills", tableToDelete));
    }
  };

  const addToBill = async (item: MenuItem) => {
    if (!firestore) return;

    const tableBill = bills[activeTable]?.items || [];
    const billDocRef = doc(firestore, "bills", activeTable);
    const existingItem = tableBill.find((i) => i.id === item.id);

    let newTableBill;
    if (existingItem) {
      newTableBill = tableBill.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newTableBill = [...tableBill, { ...item, quantity: 1 }];
    }
    
    await writeBatch(firestore).set(billDocRef, { items: newTableBill }, { merge: true }).commit();
  };

  const addUdhariToBill = async (udhariBill: UdhariBill) => {
    if(!firestore) return;

    const tableBillItems = bills[activeTable]?.items || [];
    const newTableBill = [...tableBillItems];

    udhariBill.items.forEach(udhariItem => {
      const existingItem = newTableBill.find(i => i.id === udhariItem.id);
      if (existingItem) {
        existingItem.quantity += udhariItem.quantity;
      } else {
        newTableBill.push(udhariItem);
      }
    });
    
    const batch = writeBatch(firestore);
    const billDocRef = doc(firestore, "bills", activeTable);
    batch.set(billDocRef, { items: newTableBill }, { merge: true });

    const udhariDocRef = doc(firestore, "udhariBills", udhariBill.id);
    batch.update(udhariDocRef, { status: 'settled' });

    await batch.commit();
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!firestore) return;
    const tableBill = bills[activeTable]?.items || [];
    const billDocRef = doc(firestore, "bills", activeTable);
    
    let newTableBill;
    if (quantity <= 0) {
      newTableBill = tableBill.filter((i) => i.id !== itemId);
    } else {
      newTableBill = tableBill.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      );
    }
    
    if (newTableBill.length === 0) {
       await deleteDoc(billDocRef);
    } else {
       await writeBatch(firestore).set(billDocRef, { items: newTableBill }, { merge: true }).commit();
    }
  };

  const clearBill = async () => {
     if(firestore && bills[activeTable]) {
       await deleteDoc(doc(firestore, "bills", activeTable));
     }
  }

  const saveToUdhari = async (udhariBill: Omit<UdhariBill, 'id' | 'date' | 'status'>) => {
    if (!firestore) return;
    await addDoc(collection(firestore, "udhariBills"), {
        ...udhariBill,
        date: serverTimestamp(),
        status: 'active'
    });
    await clearBill();
  }

  const settleUdhari = async (udhariId: string) => {
    if (!firestore) return;
    const udhariDocRef = doc(firestore, "udhariBills", udhariId);
    await updateDoc(udhariDocRef, { status: 'settled' });
  }
  
  const updateUdhariNotes = async (udhariId: string, notes: string) => {
     if (!firestore) return;
     const udhariDocRef = doc(firestore, "udhariBills", udhariId);
     await updateDoc(udhariDocRef, { notes });
  };

  const addNewNote = async () => {
    if (!firestore) return;
    await addDoc(collection(firestore, "notes"), {
      content: "",
      date: serverTimestamp(),
    });
  };

  const updateNote = async (noteId: string, content: string) => {
    if (!firestore) return;
    await updateDoc(doc(firestore, "notes", noteId), { content });
  };

  const deleteNote = async (noteId: string) => {
     if (!firestore) return;
     await deleteDoc(doc(firestore, "notes", noteId));
  };


  const recordPayment = async (settledBill: Omit<SettledBill, 'id' | 'date'>) => {
    if (!firestore) return;
    await addDoc(collection(firestore, "settledBills"), {
      ...settledBill,
      date: serverTimestamp()
    });
    await clearBill();
  }

  const billedTables = Object.keys(bills);
  
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <UtensilsCrossed className="h-12 w-12 text-primary animate-pulse" />
    </div>;
  }

  const MarqueeText = () => (
    <span className="text-lg font-semibold text-primary px-4 whitespace-nowrap">
      🍽️ हॉटेल सुग्ररण – 🥗🍗 Veg–Non-Veg जेवण, 🏡 घरगुती चव आणि 🤝 विश्वासाची ओळख ❤️&nbsp;
    </span>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <UtensilsCrossed className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold font-headline text-foreground">
                हॉटेल सुग्ररण
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
               <CurrentBillsDialog bills={bills} />
               <UdhariDialog 
                  udhariBills={udhariBills} 
                  settledUdhariBills={settledUdhariBills}
                  onAddToBill={addUdhariToBill} 
                  activeTable={activeTable} 
                  notes={notesData || []}
                  onAddNewNote={addNewNote}
                  onUpdateNote={updateNote}
                  onDeleteNote={deleteNote}
                  onUpdateUdhariNotes={updateUdhariNotes}
               />
               <PaymentHistoryDialog paymentHistory={settledBillsData || []} udhariBills={udhariBills} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-8">
             <div className="relative overflow-hidden bg-primary/10 py-2 rounded-lg -mb-4">
                <div className="animate-marquee flex">
                  <MarqueeText />
                  <MarqueeText />
                </div>
             </div>
             <TableLayout
              tables={tables}
              activeTable={activeTable}
              billedTables={billedTables}
              onSelectTable={setActiveTable}
              onAddTable={handleAddTable}
              onDeleteTable={handleDeleteTable}
            />
            <MenuSection onAddItem={addToBill} billItems={bills[activeTable]?.items || []} />
          </div>
          <div className="lg:col-span-2">
            <BillingSection
              items={bills[activeTable]?.items || []}
              onUpdateQuantity={updateQuantity}
              onClearBill={clearBill}
              onSaveToUdhari={saveToUdhari}
              onRecordPayment={recordPayment}
              activeTable={activeTable}
            />
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t mt-8">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Hotel Suvidha. All rights reserved.
        </p>
      </footer>
    </div>
  );
}


export default function Home() {
  return (
    <FirebaseProvider>
      <HomePage />
    </FirebaseProvider>
  );
}
