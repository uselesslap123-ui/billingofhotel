"use client";

import { useState } from "react";
import type { MenuItem } from "@/lib/menu-items";
import { menuItems } from "@/lib/menu-items";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import type { BillItem } from "@/app/page";
import Image from "next/image";

interface MenuSectionProps {
  onAddItem: (item: MenuItem) => void;
  billItems: BillItem[];
}

export function MenuSection({ onAddItem, billItems }: MenuSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMenuItems.map((item) => {
            const currentItemInBill = billItems.find(billItem => billItem.id === item.id);
            const quantity = currentItemInBill ? currentItemInBill.quantity : 0;
            return (
            <Card key={item.id} className="flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative w-full aspect-[3/2]">
                    <Image 
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        data-ai-hint={item.imageHint}
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                 <CardTitle className="text-base font-medium mb-2">{item.name}</CardTitle>
                <p className="text-lg font-semibold">
                  Rs.{item.price.toFixed(2)}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
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
      </div>
    </section>
  );
}
