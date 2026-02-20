'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import { ALL_FONTS, loadAllGoogleFonts, loadFont } from '@/lib/fontLoader';

interface FontPickerProps {
  value: string;
  onChange: (font: string) => void;
}

export function FontPicker({ value, onChange }: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadAllGoogleFonts().then(() => setFontsLoaded(true));
  }, []);

  const filteredFonts = ALL_FONTS.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (font: string) => {
    await loadFont(font);
    onChange(font);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full justify-between text-xs"
          style={{ fontFamily: value }}
        >
          <span className="truncate">{value}</span>
          <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search fonts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 text-xs"
          />
        </div>
        <ScrollArea className="h-64">
          <div className="p-1">
            {filteredFonts.map((font) => (
              <button
                key={font}
                className={`w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer ${
                  value === font ? 'bg-accent font-medium' : ''
                }`}
                style={{ fontFamily: fontsLoaded ? font : undefined }}
                onClick={() => handleSelect(font)}
              >
                {font}
              </button>
            ))}
            {filteredFonts.length === 0 && (
              <p className="px-2 py-4 text-xs text-center text-muted-foreground">
                No fonts found
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
