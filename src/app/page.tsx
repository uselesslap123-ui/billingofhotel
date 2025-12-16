
"use client";

import { useState, useEffect } from "react";
import type { MenuItem } from "@/lib/menu-items";
import { MenuSection } from "@/components/menu-section";
import { BillingSection } from "@/components/billing-section";
import { UdhariDialog } from "@/components/udhari-dialog";
import { PaymentHistoryDialog } from "@/components/payment-history-dialog";
import { UtensilsCrossed } from "lucide-react";
import { TableLayout } from "@/components/table-layout";
import { CurrentBillsDialog } from "@/components/current-bills-dialog";
import Image from "next/image";

export type BillItem = MenuItem & { quantity: number };

export type Bills = {
  [table: string]: BillItem[];
};

export type UdhariBill = {
  id: string;
  customerName: string;
  items: BillItem[];
  totalAmount: number;
  date: string;
  notes?: string;
};

export type SettledBill = {
  id: string;
  items: BillItem[];
  totalAmount: number;
  date: string;
  paymentMethod: "Cash" | "Online";
  table: string;
};

export type Note = {
  id: string;
  content: string;
  date: string;
};


const TOTAL_TABLES = [...Array.from({ length: 8 }, (_, i) => (i + 1).toString()), 'Parcel'];

export default function Home() {
  const [bills, setBills] = useState<Bills>({});
  const [activeTable, setActiveTable] = useState("1");
  const [udhariBills, setUdhariBills] = useState<UdhariBill[]>([]);
  const [settledUdhariBills, setSettledUdhariBills] = useState<UdhariBill[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<SettledBill[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedBills = localStorage.getItem('bills');
      const savedUdhariBills = localStorage.getItem('udhariBills');
      const savedSettledUdhariBills = localStorage.getItem('settledUdhariBills');
      const savedPaymentHistory = localStorage.getItem('paymentHistory');
      const savedNotes = localStorage.getItem('notes');

      if (savedBills) setBills(JSON.parse(savedBills));
      if (savedUdhariBills) setUdhariBills(prev => [...prev, ...JSON.parse(savedUdhariBills)]);
      if (savedSettledUdhariBills) setSettledUdhariBills(prev => [...prev, ...JSON.parse(savedSettledUdhariBills)]);
      if (savedPaymentHistory) setPaymentHistory(prev => [...prev, ...JSON.parse(savedPaymentHistory)]);
      if (savedNotes) setNotes(JSON.parse(savedNotes));

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('bills', JSON.stringify(bills));
      } catch (error) {
        console.error("Failed to save bills to localStorage", error);
      }
    }
  }, [bills, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('udhariBills', JSON.stringify(udhariBills));
      } catch (error) {
        console.error("Failed to save udhariBills to localStorage", error);
      }
    }
  }, [udhariBills, isLoaded]);
  
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('settledUdhariBills', JSON.stringify(settledUdhariBills));
      } catch (error) {
        console.error("Failed to save settledUdhariBills to localStorage", error);
      }
    }
  }, [settledUdhariBills, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));
      } catch (error) {
        console.error("Failed to save paymentHistory to localStorage", error);
      }
    }
  }, [paymentHistory, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('notes', JSON.stringify(notes));
      } catch (error) {
        console.error("Failed to save notes to localStorage", error);
      }
    }
  }, [notes, isLoaded]);


  const addToBill = (item: MenuItem) => {
    setBills((prevBills) => {
      const tableBill = prevBills[activeTable] || [];
      const existingItem = tableBill.find((i) => i.id === item.id);

      let newTableBill;
      if (existingItem) {
        newTableBill = tableBill.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newTableBill = [...tableBill, { ...item, quantity: 1 }];
      }

      return { ...prevBills, [activeTable]: newTableBill };
    });
  };

  const addUdhariToBill = (udhariBill: UdhariBill) => {
    setBills((prevBills) => {
      const tableBill = prevBills[activeTable] || [];
      const newTableBill = [...tableBill];

      udhariBill.items.forEach(udhariItem => {
        const existingItem = newTableBill.find(i => i.id === udhariItem.id);
        if (existingItem) {
          existingItem.quantity += udhariItem.quantity;
        } else {
          newTableBill.push(udhariItem);
        }
      });

      return { ...prevBills, [activeTable]: newTableBill };
    });
    // Settle the udhari bill after adding it
    settleUdhari(udhariBill.id);
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    setBills((prevBills) => {
      const tableBill = prevBills[activeTable] || [];
      let newTableBill;

      if (quantity <= 0) {
        newTableBill = tableBill.filter((i) => i.id !== itemId);
      } else {
        newTableBill = tableBill.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        );
      }
      
      const newBills = { ...prevBills, [activeTable]: newTableBill };
      if(newTableBill.length === 0) {
        delete newBills[activeTable];
      }

      return newBills;
    });
  };

  const clearBill = () => {
     setBills((prevBills) => {
        const newBills = {...prevBills};
        delete newBills[activeTable];
        return newBills;
     });
  }

  const saveToUdhari = (udhariBill: UdhariBill) => {
    setUdhariBills(prev => [...prev, udhariBill]);
    clearBill();
  }

  const settleUdhari = (udhariId: string) => {
    const billToSettle = udhariBills.find(bill => bill.id === udhariId);
    if(billToSettle) {
        setSettledUdhariBills(prev => [billToSettle, ...prev]);
        setUdhariBills(prev => prev.filter(bill => bill.id !== udhariId));
    }
  }
  
  const updateUdhariNotes = (udhariId: string, notes: string) => {
    setUdhariBills(prev => prev.map(bill => bill.id === udhariId ? { ...bill, notes } : bill));
  };

  const addNewNote = () => {
    const newNote: Note = {
      id: `NOTE-${Date.now()}`,
      content: "",
      date: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = (noteId: string, content: string) => {
    setNotes(prev => prev.map(note => note.id === noteId ? { ...note, content } : note));
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };


  const recordPayment = (settledBill: SettledBill) => {
    setPaymentHistory(prev => [settledBill, ...prev]);
    clearBill();
  }

  const billedTables = Array.from(Object.keys(bills));
  
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <UtensilsCrossed className="h-12 w-12 text-primary animate-pulse" />
    </div>;
  }


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
                  notes={notes}
                  onAddNewNote={addNewNote}
                  onUpdateNote={updateNote}
                  onDeleteNote={deleteNote}
                  onUpdateUdhariNotes={updateUdhariNotes}
               />
               <PaymentHistoryDialog paymentHistory={paymentHistory} udhariBills={udhariBills} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-8">
             <div className="relative overflow-hidden bg-primary/10 py-2 rounded-lg -mb-4">
                <span className="animate-marquee text-lg font-semibold text-primary px-4 whitespace-nowrap">अस्सल घरगुती चवीचा खजिना. हॉटेल सुग्रण मध्ये आपले स्वागत आहे! 😋 अस्सल घरगुती चवीचा खजिना. हॉटेल सुग्रण मध्ये आपले स्वागत आहे! 😋 अस्सल घरगुती चवीचा खजिना. हॉटेल सुग्रण मध्ये आपले स्वागत आहे! 😋</span>
             </div>
             <TableLayout
              tables={TOTAL_TABLES}
              activeTable={activeTable}
              billedTables={billedTables}
              onSelectTable={setActiveTable}
            />
            <MenuSection onAddItem={addToBill} billItems={bills[activeTable] || []} />
          </div>
          <div className="lg:col-span-2">
            <BillingSection
              items={bills[activeTable] || []}
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

