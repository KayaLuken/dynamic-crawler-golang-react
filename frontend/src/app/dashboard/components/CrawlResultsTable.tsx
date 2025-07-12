"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

import { CrawlResult } from "../types";
import { useCrawlHistory } from "../hooks/useCrawlHistory";
import { LoadingTableSkeleton } from "./LoadingComponents";
import { FiltersBar } from "./ColumnFilters";

const columnHelper = createColumnHelper<CrawlResult>();

export function CrawlResultsTable() {
  const { data, loading, error, refetch } = useCrawlHistory();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(() => [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => info.getValue(),
      size: 80,
    }),
    columnHelper.accessor("url", {
      header: "URL",
      cell: (info) => (
        <div className="max-w-xs truncate" title={info.getValue()}>
          <a 
            href={info.getValue()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {info.getValue()}
          </a>
        </div>
      ),
      size: 200,
    }),
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => (
        <div className="max-w-xs truncate" title={info.getValue()}>
          {info.getValue()}
        </div>
      ),
      size: 200,
    }),
    columnHelper.accessor("html_version", {
      header: "HTML Version",
      cell: (info) => (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">
          {info.getValue()}
        </span>
      ),
      size: 120,
    }),
    columnHelper.accessor("internal_links", {
      header: "Internal Links",
      cell: (info) => (
        <div className="text-center text-green-600 font-medium">
          {info.getValue()}
        </div>
      ),
      size: 120,
    }),
    columnHelper.accessor("external_links", {
      header: "External Links",
      cell: (info) => (
        <div className="text-center text-blue-600 font-medium">
          {info.getValue()}
        </div>
      ),
      size: 120,
    }),
    columnHelper.accessor("inaccessible_links", {
      header: "Inaccessible Links",
      cell: (info) => (
        <div className="text-center text-red-600 font-medium">
          {info.getValue()}
        </div>
      ),
      size: 140,
    }),
    columnHelper.accessor("has_login_form", {
      header: "Login Form",
      cell: (info) => (
        <div className="text-center">
          {info.getValue() ? (
            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
              Yes
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
              No
            </span>
          )}
        </div>
      ),
      size: 100,
    }),
    columnHelper.accessor("headings", {
      header: "Headings",
      cell: (info) => {
        const headings = info.getValue();
        const total = Object.values(headings).reduce((sum, count) => sum + count, 0);
        return (
          <div className="text-center">
            <span className="font-medium">{total}</span>
            <div className="text-xs text-gray-500">
              H1:{headings.h1} H2:{headings.h2} H3:{headings.h3}
            </div>
          </div>
        );
      },
      size: 120,
    }),
    columnHelper.accessor("crawled_at", {
      header: "Crawled At",
      cell: (info) => (
        <div className="text-sm text-gray-600">
          {format(new Date(info.getValue()), "MMM dd, yyyy HH:mm")}
        </div>
      ),
      size: 150,
    }),
  ], []);

  const table = useReactTable({
    data: data?.history || [],
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return <LoadingTableSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with search and stats */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search all columns..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
        <div className="text-sm text-gray-600">
          Total: {data?.count || 0} results
        </div>
      </div>

      {/* Filters */}
      <FiltersBar table={table} />

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-1">
                      <span>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      {header.column.getIsSorted() === "asc" && <ArrowUp className="h-4 w-4" />}
                      {header.column.getIsSorted() === "desc" && <ArrowDown className="h-4 w-4" />}
                      {!header.column.getIsSorted() && <ArrowUpDown className="h-4 w-4 opacity-50" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} results
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
