
"use client";

import { useState } from "react";
import type { MenuItem } from "@/lib/menu-items";
import { MenuSection } from "@/components/menu-section";
import { BillingSection } from "@/components/billing-section";
import { UdhariSection } from "@/components/udhari-section";
import { UtensilsCrossed } from "lucide-react";
import { TableLayout } from "@/components/table-layout";

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
};

const TOTAL_TABLES = [...Array.from({ length: 8 }, (_, i) => (i + 1).toString()), 'Parcel'];

export default function Home() {
  const [bills, setBills] = useState<Bills>({});
  const [activeTable, setActiveTable] = useState("1");
  const [udhariBills, setUdhariBills] = useState<UdhariBill[]>([]);

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

  const addToUdhari = (udhariBill: UdhariBill) => {
    setUdhariBills(prev => [...prev, udhariBill]);
    clearBill();
  };

  const settleUdhari = (udhariId: string) => {
    setUdhariBills(prev => prev.filter(bill => bill.id !== udhariId));
  }

  const billedTables = Object.keys(bills);

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
            <div className="font-headline text-muted-foreground">
              डिजिटल हॉटेल सुविधार
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-8">
             <TableLayout
              tables={TOTAL_TABLES}
              activeTable={activeTable}
              billedTables={billedTables}
              onSelectTable={setActiveTable}
            />
            <MenuSection onAddItem={addToBill} />
            <UdhariSection udhariBills={udhariBills} onSettleUdhari={settleUdhari} />
          </div>
          <div className="lg:col-span-2">
            <BillingSection
              items={bills[activeTable] || []}
              onUpdateQuantity={updateQuantity}
              onClearBill={clearBill}
              activeTable={activeTable}
              onSetActiveTable={setActiveTable}
              onAddToUdhari={addToUdhari}
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
