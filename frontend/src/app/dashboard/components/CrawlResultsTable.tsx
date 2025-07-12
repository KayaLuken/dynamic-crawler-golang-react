"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Trash2, RefreshCw } from "lucide-react";

import { CrawlResult } from "../types";
import { useCrawlHistory } from "../hooks/useCrawlHistory";
import { LoadingTableSkeleton } from "./LoadingComponents";
import { FiltersBar } from "./ColumnFilters";

const columnHelper = createColumnHelper<CrawlResult>();

export function CrawlResultsTable() {
  const router = useRouter();
  const { data, loading, error, refetch } = useCrawlHistory();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);

  // Bulk action handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data?.history?.map(item => item.id) || []);
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedRows(newSelection);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;
    
    setIsPerformingBulkAction(true);
    try {
      const idsToDelete = Array.from(selectedRows);
      const response = await fetch('http://localhost:8080/crawl/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: idsToDelete }),
      });

      if (response.ok) {
        setSelectedRows(new Set());
        refetch();
      } else {
        console.error('Failed to delete selected items');
      }
    } catch (error) {
      console.error('Error deleting items:', error);
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  const handleBulkRerun = async () => {
    if (selectedRows.size === 0) return;
    
    setIsPerformingBulkAction(true);
    try {
      const idsToRerun = Array.from(selectedRows);
      const response = await fetch('http://localhost:8080/crawl/bulk/rerun', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: idsToRerun }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Re-run completed: ${result.success_count} successful, ${result.failed_count} failed`);
        setSelectedRows(new Set());
        refetch();
      } else {
        console.error('Failed to re-run analysis for selected items');
      }
    } catch (error) {
      console.error('Error re-running analysis:', error);
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      header: () => (
        <input
          type="checkbox"
          checked={data?.history && data.history.length > 0 && selectedRows.size === data.history.length}
          ref={(input) => {
            if (input) {
              input.indeterminate = selectedRows.size > 0 && selectedRows.size < (data?.history?.length || 0);
            }
          }}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedRows.has(row.original.id)}
          onChange={(e) => handleSelectRow(row.original.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      size: 50,
    }),
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
  ], [data?.history, selectedRows, handleSelectAll, handleSelectRow]);

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
      <div className="mb-6 space-y-4">
        {/* Search and refresh row */}
        <div className="flex justify-between items-center">
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
        
        {/* Bulk actions row */}
        {selectedRows.size > 0 && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedRows.size} item{selectedRows.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkRerun}
                  disabled={isPerformingBulkAction}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={16} className={isPerformingBulkAction ? "animate-spin" : ""} />
                  <span>Re-run Analysis</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isPerformingBulkAction}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  <span>Delete Selected</span>
                </button>
              </div>
            </div>
            <button
              onClick={() => setSelectedRows(new Set())}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>
        )}
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
              <tr 
                key={row.id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/dashboard/${row.original.id}`)}
              >
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
