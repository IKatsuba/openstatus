"use client";

import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Table as TTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { z } from "zod";

import { selectMonitorTagSchema } from "@openstatus/db/src/schema";
import type { MonitorTag } from "@openstatus/db/src/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@openstatus/ui";

import { DataTableFloatingActions } from "./data-table-floating-actions";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tags?: MonitorTag[];
  defaultColumnFilters?: ColumnFiltersState;
  defaultPagination?: PaginationState;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  tags,
  defaultColumnFilters = [],
  defaultPagination = { pageIndex: 0, pageSize: 10 },
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(defaultColumnFilters);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      public: false, // default is true
      id: false, // we hide the id column
    });

  const [pagination, setPagination] =
    React.useState<PaginationState>(defaultPagination);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      columnVisibility,
      pagination,
    },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    // TODO: check if we can optimize it - because it gets bigger and bigger with every new filter
    // getFacetedUniqueValues: getFacetedUniqueValues(),
    // REMINDER: We cannot use the default getFacetedUniqueValues as it doesnt support Array of Objects
    getFacetedUniqueValues: (_table: TTable<TData>, columnId: string) => () => {
      const map = new Map();
      if (columnId === "tags") {
        if (tags) {
          for (const tag of tags) {
            const tagsNumber = data.reduce((prev, curr) => {
              const values = z
                .object({ tags: z.array(selectMonitorTagSchema) })
                .safeParse(curr);
              if (!values.success) return prev;
              if (values.data.tags?.find((t) => t.name === tag.name))
                return prev + 1;
              return prev;
            }, 0);
            map.set(tag.name, tagsNumber);
          }
        }
      }
      if (columnId === "public") {
        const values = table
          .getCoreRowModel()
          .flatRows.map((row) => row.getValue(columnId)) as boolean[];
        const publicValue = values.filter((v) => v === true).length;
        map.set(true, publicValue);
        map.set(false, values.length - publicValue);
      }
      return map;
    },
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} tags={tags} />
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    // FIXME: className="[&:has(svg)]:w-4" takes the svg of the button > checkbox  into account
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <DataTableFloatingActions table={table} tags={tags} />
    </div>
  );
}
