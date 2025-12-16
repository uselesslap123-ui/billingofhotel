import type { MenuItem } from "@/lib/menu-items";
import { menuItems } from "@/lib/menu-items";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface MenuSectionProps {
  onAddItem: (item: MenuItem) => void;
}

export function MenuSection({ onAddItem }: MenuSectionProps) {
  return (
    <section aria-labelledby="menu-heading">
      <div className="bg-card p-4 rounded-lg shadow-sm">
        <h2 id="menu-heading" className="text-xl font-bold font-headline mb-4">
          Menu
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {menuItems.map((item) => (
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
                  <Plus className="mr-2 h-4 w-4" /> Add to Bill
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
