
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Plus } from "lucide-react";

interface TableLayoutProps {
  tables: string[];
  activeTable: string;
  billedTables: string[];
  onSelectTable: (table: string) => void;
  onAddTable: () => void;
}

export function TableLayout({ tables, activeTable, billedTables, onSelectTable, onAddTable }: TableLayoutProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Select Table or Parcel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 gap-3">
          {tables.map((table) => {
            const hasBill = billedTables.includes(table);
            const isActive = activeTable === table;
            const isParcel = table === 'Parcel';
            return (
              <Button
                key={table}
                variant={isActive ? "default" : hasBill ? "secondary" : "outline"}
                className={cn(
                  "h-16 text-lg font-bold transition-all duration-300 transform hover:scale-105 flex-col",
                  isActive && "ring-2 ring-offset-2 ring-primary",
                  hasBill && !isActive && "bg-accent/50 border-accent",
                  isParcel && "col-span-1 lg:col-span-1"
                )}
                onClick={() => onSelectTable(table)}
              >
                {isParcel && <Package className="h-5 w-5 mb-1" />}
                <span>{table}</span>
              </Button>
            );
          })}
           <Button
              variant="outline"
              className="h-16 text-lg font-bold transition-all duration-300 transform hover:scale-105 flex-col border-dashed"
              onClick={onAddTable}
            >
              <Plus className="h-6 w-6" />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
