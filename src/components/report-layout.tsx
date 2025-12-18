
import { format } from 'date-fns';

interface ReportLayoutProps {
  title: string;
  generatedOn: Date;
  children: React.ReactNode;
}

export function ReportLayout({ title, generatedOn, children }: ReportLayoutProps) {
  return (
    <div className="bg-white text-gray-800 p-10 font-sans w-[1000px]">
      <header className="mb-8 border-b-2 border-gray-300 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">हॉटेल सुग्ररण</h1>
        <div className="flex justify-between items-end mt-2">
            <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>
            <p className="text-sm text-gray-500">
                Generated on: {format(generatedOn, "PPPp")}
            </p>
        </div>
      </header>
      
      <main>
        {children}
      </main>

      <footer className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Hotel Suvidha. All rights reserved.</p>
        <p>This is a computer-generated report.</p>
      </footer>
    </div>
  );
}
