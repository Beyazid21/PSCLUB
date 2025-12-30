import { Button } from "@/components/ui/button";
import { Plus, Pencil, QrCode } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTables } from "@/app/actions";
import { DeleteTableButton } from "@/components/admin/delete-table-button"; // Silmə düyməsi komponenti
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export default async function TablesPage() {
  const tables = await getTables();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Masalar</h2>
          <p className="text-sm text-muted-foreground">
            Restoranınızdakı masaları idarə edin və QR kodlarını əldə edin.
          </p>
        </div>
        <Link href="/admin/tables/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Yeni Masa
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Nömrə</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>QR Kod Linki</TableHead>
              <TableHead className="text-right">Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Masa tapılmadı.
                </TableCell>
              </TableRow>
            )}
            {tables.sort((a, b) => a.number - b.number).map((table) => (
              <TableRow key={table.id}>
                <TableCell className="font-bold text-lg">
                   #{table.number}
                </TableCell>
                <TableCell>
                  {table.isActive ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Aktiv
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Deaktiv
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-500 font-mono">
                  /menu/{table.id}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {/* QR Kod Düyməsi (Gələcəkdə çap və ya görüntüləmə üçün) */}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/tables/${table.id}/qr`}>
                      <QrCode className="h-4 w-4 mr-1" />
                      QR
                    </Link>
                  </Button>

                  {/* Redaktə Düyməsi */}
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/tables/${table.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Redaktə
                    </Link>
                  </Button>

                  {/* Silmə Düyməsi */}
                  <DeleteTableButton tableId={table.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}