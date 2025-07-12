"use client";

import { useState } from "react";
import { Column } from "@tanstack/react-table";
import { CrawlResult } from "../types";

interface ColumnFilterProps {
  column: Column<CrawlResult, unknown>;
  title: string;
}

export function ColumnFilter({ column, title }: ColumnFilterProps) {
  const [value, setValue] = useState<string>((column.getFilterValue() as string) ?? "");

  const handleFilter = (value: string) => {
    setValue(value);
    column.setFilterValue(value || undefined);
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-xs font-medium text-gray-700">{title}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleFilter(e.target.value)}
        placeholder={`Filter ${title.toLowerCase()}...`}
        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}

interface FiltersBarProps {
  table: any; // TanStack Table instance
}

export function FiltersBar({ table }: FiltersBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        {showFilters ? "Hide" : "Show"} Column Filters
      </button>
      
      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <ColumnFilter column={table.getColumn("url")} title="URL" />
            <ColumnFilter column={table.getColumn("title")} title="Title" />
            <ColumnFilter column={table.getColumn("html_version")} title="HTML Version" />
            <ColumnFilter column={table.getColumn("internal_links")} title="Internal Links" />
            <ColumnFilter column={table.getColumn("external_links")} title="External Links" />
            <ColumnFilter column={table.getColumn("inaccessible_links")} title="Inaccessible Links" />
          </div>
          
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => table.resetColumnFilters()}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
