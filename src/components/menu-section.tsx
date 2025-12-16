
"use client";

import { useState, useMemo } from "react";
import type { MenuItem } from "@/lib/menu-items";
import { menuItems } from "@/lib/menu-items";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import type { BillItem } from "@/app/page";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MenuSectionProps {
  onAddItem: (item: MenuItem) => void;
  billItems: BillItem[];
}

export function MenuSection({ onAddItem, billItems }: MenuSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const categorizedMenuItems = useMemo(() => {
    const categories = menuItems.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        acc[category].push(item);
      }
      return acc;
    }, {} as Record<string, MenuItem[]>);

    // Filter out categories that are empty after search
    return Object.keys(categories)
      .filter(key => categories[key].length > 0)
      .reduce((obj, key) => {
        obj[key] = categories[key];
        return obj;
      }, {} as Record<string, MenuItem[]>);
  }, [searchTerm]);

  const defaultActiveCategories = useMemo(() => Object.keys(categorizedMenuItems), [categorizedMenuItems]);

  return (
    <section aria-labelledby="menu-heading">
      <div className="bg-card p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 id="menu-heading" className="text-xl font-bold font-headline">
            Menu
          </h2>
          <Input
            placeholder="Search menu..."
            className="max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Accordion type="multiple" defaultValue={defaultActiveCategories} className="w-full">
          {Object.entries(categorizedMenuItems).map(([category, items]) => (
            <AccordionItem value={category} key={category}>
              <AccordionTrigger className="text-lg font-semibold">{category}</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pt-4">
                  {items.map((item) => {
                    const currentItemInBill = billItems.find(billItem => billItem.id === item.id);
                    const quantity = currentItemInBill ? currentItemInBill.quantity : 0;
                    return (
                    <Card key={item.id} className="flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      <CardHeader className="flex-row items-start justify-between pb-2">
                         <CardTitle className="text-base font-medium">{item.name}</CardTitle>
                        <div className="text-3xl">{item.icon}</div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-lg font-semibold">
                          Rs.{item.price.toFixed(2)}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full" onClick={() => onAddItem(item)} variant="outline">
                          <Plus className="mr-2 h-4 w-4" /> 
                          <span>Add to Bill</span>
                           {quantity > 0 && (
                            <span className="ml-auto bg-primary/10 text-primary font-bold text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {quantity}
                            </span>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  )})}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
         {Object.keys(categorizedMenuItems).length === 0 && (
            <p className="text-center text-muted-foreground py-10">
                No menu items found for "{searchTerm}".
            </p>
        )}
      </div>
    </section>
  );
}
