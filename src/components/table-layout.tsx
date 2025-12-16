
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
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

interface TableLayoutProps {
  tables: string[];
  activeTable: string;
  billedTables: string[];
  onSelectTable: (table: string) => void;
  onAddTable: () => void;
  onDeleteTable: (table: string) => void;
}

const VISIBLE_TABLE_LIMIT = 9;

export function TableLayout({ tables, activeTable, billedTables, onSelectTable, onAddTable, onDeleteTable }: TableLayoutProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleTables = showAll ? tables : tables.slice(0, VISIBLE_TABLE_LIMIT);
  const hasMoreTables = tables.length > VISIBLE_TABLE_LIMIT;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Select Table or Parcel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 gap-3">
          {visibleTables.map((table) => {
            const hasBill = billedTables.includes(table);
            const isActive = activeTable === table;
            const isParcel = table === 'Parcel';
            return (
              <div key={table} className="relative group/table">
                <Button
                  variant={isActive ? "default" : hasBill ? "secondary" : "outline"}
                  className={cn(
                    "h-16 w-full text-lg font-bold transition-all duration-300 transform hover:scale-105 flex-col",
                    isActive && "ring-2 ring-offset-2 ring-primary",
                    hasBill && !isActive && "bg-accent/50 border-accent",
                    isParcel && "col-span-1 lg:col-span-1"
                  )}
                  onClick={() => onSelectTable(table)}
                >
                  {isParcel ? <Package className="h-5 w-5 mb-1" /> : null}
                  <span>{table}</span>
                </Button>
                {!isParcel && (
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover/table:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Table {table}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete Table {table} and any active bill associated with it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteTable(table)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                )}
              </div>
            );
          })}
           <Button
              variant="outline"
              className="h-16 text-lg font-bold transition-all duration-300 transform hover:scale-105 flex-col border-dashed"
              onClick={onAddTable}
            >
              <Plus className="h-6 w-6" />
            </Button>
             {hasMoreTables && (
              <Button
                variant="outline"
                className="h-16 text-lg font-bold transition-all duration-300 transform hover:scale-105 flex-col"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                <span className="text-xs mt-1">{showAll ? 'Show Less' : `+${tables.length - VISIBLE_TABLE_LIMIT} more`}</span>
              </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

    