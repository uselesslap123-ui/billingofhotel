
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
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
  status: 'active' | 'settled';
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

const INITIAL_TABLES = [...Array.from({ length: 8 }, (_, i) => (i + 1).toString()), 'Parcel'];


export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTable, setActiveTable] = useState("1");
  const [bills, setBills] = useState<Bills>({});
  const [udhariBills, setUdhariBills] = useState<UdhariBill[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<SettledBill[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tables, setTables] = useState<string[]>(INITIAL_TABLES);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("menu");

  useEffect(() => {
    try {
      const storedBills = localStorage.getItem("bills");
      if (storedBills) setBills(JSON.parse(storedBills));

      const storedUdhari = localStorage.getItem("udhariBills");
      if (storedUdhari) setUdhariBills(JSON.parse(storedUdhari));
      
      const storedHistory = localStorage.getItem("paymentHistory");
      if (storedHistory) setPaymentHistory(JSON.parse(storedHistory));

      const storedNotes = localStorage.getItem("notes");
      if (storedNotes) setNotes(JSON.parse(storedNotes));
      
      const storedTables = localStorage.getItem("tables");
      if (storedTables) setTables(JSON.parse(storedTables));

    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      // If parsing fails, reset to defaults
      localStorage.removeItem("bills");
      localStorage.removeItem("udhariBills");
      localStorage.removeItem("paymentHistory");
      localStorage.removeItem("notes");
      localStorage.removeItem("tables");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if(isLoaded) localStorage.setItem("bills", JSON.stringify(bills));
  }, [bills, isLoaded]);

  useEffect(() => {
    if(isLoaded) localStorage.setItem("udhariBills", JSON.stringify(udhariBills));
  }, [udhariBills, isLoaded]);
  
  useEffect(() => {
    if(isLoaded) localStorage.setItem("paymentHistory", JSON.stringify(paymentHistory));
  }, [paymentHistory, isLoaded]);

  useEffect(() => {
    if(isLoaded) localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes, isLoaded]);

  useEffect(() => {
    if(isLoaded) localStorage.setItem("tables", JSON.stringify(tables));
  }, [tables, isLoaded]);

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
      return newTables;
    });
  };

  const handleDeleteTable = (tableToDelete: string) => {
    setTables(prevTables => {
      const newTables = prevTables.filter(t => t !== tableToDelete);
      if (activeTable === tableToDelete) {
        setActiveTable(newTables[0] || '1');
      }
      return newTables;
    });

    setBills(prevBills => {
      const newBills = { ...prevBills };
      delete newBills[tableToDelete];
      return newBills;
    });
  };

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

    setUdhariBills(prev => prev.map(b => b.id === udhariBill.id ? {...b, status: 'settled'} : b));
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
      const newBills = { ...prevBills };
      delete newBills[activeTable];
      return newBills;
    });
  }

  const saveToUdhari = (udhariBill: Omit<UdhariBill, 'id' | 'date'>) => {
    setUdhariBills(prev => [...prev, {
      ...udhariBill,
      id: `U-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'active'
    }]);
    clearBill();
  }
  
  const settleUdhari = (udhariId: string) => {
    setUdhariBills(prev => prev.map(b => b.id === udhariId ? {...b, status: 'settled'} : b));
  }

  const updateUdhariNotes = (udhariId: string, notes: string) => {
    setUdhariBills(prev => prev.map(b => b.id === udhariId ? {...b, notes} : b));
  }

  const addNewNote = () => {
    setNotes(prev => [...prev, { id: `N-${Date.now()}`, content: "", date: new Date().toISOString() }]);
  };

  const updateNote = (noteId: string, content: string) => {
    setNotes(prev => prev.map(n => n.id === noteId ? {...n, content} : n));
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const recordPayment = (settledBill: Omit<SettledBill, 'id' | 'date'>) => {
    setPaymentHistory(prev => [...prev, {
      ...settledBill,
      id: `S-${Date.now()}`,
      date: new Date().toISOString()
    }]);
    clearBill();
  }

  const billedTables = Object.keys(bills).filter(table => bills[table]?.length > 0);
  const currentBillItems = bills[activeTable] || [];

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
  
  const mainContent = isMobile ? (
     <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <TabsContent value="menu" className="flex-grow mt-0">
          <div className="space-y-4">
             <TableLayout
              tables={tables}
              activeTable={activeTable}
              billedTables={billedTables}
              onSelectTable={setActiveTable}
              onAddTable={handleAddTable}
              onDeleteTable={handleDeleteTable}
            />
            <MenuSection onAddItem={addToBill} billItems={currentBillItems} />
          </div>
        </TabsContent>
        <TabsContent value="bill" className="flex-grow mt-0">
           <BillingSection
              items={currentBillItems}
              onUpdateQuantity={updateQuantity}
              onClearBill={clearBill}
              onSaveToUdhari={saveToUdhari}
              onRecordPayment={recordPayment}
              activeTable={activeTable}
            />
        </TabsContent>
        <TabsList className="grid w-full grid-cols-2 h-14 rounded-none">
          <TabsTrigger value="menu" className="text-base h-full rounded-none">Menu</TabsTrigger>
          <TabsTrigger value="bill" className="text-base h-full rounded-none relative">
            Current Bill
             {currentBillItems.length > 0 && 
                <Badge variant="destructive" className="absolute top-1 right-2 h-5 w-5 justify-center p-0">{currentBillItems.length}</Badge>
            }
            </TabsTrigger>
        </TabsList>
      </Tabs>
  ) : (
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
          <MenuSection onAddItem={addToBill} billItems={currentBillItems} />
        </div>
        <div className="lg:col-span-2">
          <div className="sticky top-20">
            <BillingSection
              items={currentBillItems}
              onUpdateQuantity={updateQuantity}
              onClearBill={clearBill}
              onSaveToUdhari={saveToUdhari}
              onRecordPayment={recordPayment}
              activeTable={activeTable}
            />
          </div>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
                  udhariBills={udhariBills.filter(b => b.status === 'active')} 
                  settledUdhariBills={udhariBills.filter(b => b.status === 'settled')}
                  onAddToBill={addUdhariToBill} 
                  activeTable={activeTable} 
                  notes={notes}
                  onAddNewNote={addNewNote}
                  onUpdateNote={updateNote}
                  onDeleteNote={deleteNote}
                  onUpdateUdhariNotes={updateUdhariNotes}
               />
               <PaymentHistoryDialog paymentHistory={paymentHistory} udhariBills={udhariBills.filter(b => b.status === 'active')} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow flex flex-col">
        {mainContent}
      </main>

      {!isMobile && (
        <footer className="container mx-auto px-4 sm:px-6 lg:p-8 py-4 border-t mt-auto">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Hotel Suvidha. All rights reserved.
          </p>
        </footer>
      )}
    </div>
  );
}
