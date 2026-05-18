import React from 'react';
import { Search, SlidersHorizontal, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MediaFilters = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  resolution,
  onResolutionChange,
  sort,
  onSortChange,
  categories,
  resolutions,
  sorts,
  searchPlaceholder = 'Search assets...',
  resultCount = null,
  title = 'Shape the catalog',
  description = 'Refine by keyword, category, resolution, and sort order.',
  onReset,
}) => {
  const inputClassName = 'form-surface media-search-input h-[54px] w-full rounded-[22px] px-4 py-3 pl-11 pr-4 text-sm text-black';
  const selectTriggerClassName = 'media-select-trigger h-[54px] w-full rounded-[22px] px-4 text-sm text-white';

  const renderSelect = (value, onValueChange, options, ariaLabel) => (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label={ariaLabel} className={selectTriggerClassName}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="media-select-content">
        {options.map((option) => (
          <SelectItem key={option} value={option} className="media-select-item">
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="media-panel-soft rounded-[30px] p-4 md:p-5">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3 text-white">
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-100">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-white/50">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {resultCount !== null ? (
            <div className="rounded-full border border-cyan-200/10 bg-[#0b2331]/88 px-4 py-2 text-sm text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              {resultCount} result{resultCount === 1 ? '' : 's'}
            </div>
          ) : null}
          {onReset ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onReset}
              className="rounded-full border border-cyan-200/10 bg-[#0b2331]/88 px-4 text-white/76 hover:bg-[#0f2c3d] hover:text-white"
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Reset
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.45fr_0.9fr_0.8fr_0.8fr]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45" />
          <input
            value={search}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            className={inputClassName}
          />
        </label>

        {renderSelect(category, onCategoryChange, categories, 'Filter by category')}
        {renderSelect(resolution, onResolutionChange, resolutions, 'Filter by resolution')}
        {renderSelect(sort, onSortChange, sorts, 'Sort media items')}
      </div>
    </div>
  );
};

export default MediaFilters;