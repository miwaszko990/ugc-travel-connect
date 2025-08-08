'use client';

import { Fragment, memo } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { FieldError } from 'react-hook-form';
import { UserRole } from '@/app/lib/types';

export interface RoleOption {
  id: UserRole;
  name: string;
}

interface RoleSelectorProps {
  label: string;
  placeholder: string;
  options: RoleOption[];
  value: RoleOption | null;
  onChange: (role: RoleOption) => void;
  error?: FieldError;
}

export const RoleSelector = memo(function RoleSelector({ 
  label, 
  placeholder, 
  options, 
  value, 
  onChange, 
  error 
}: RoleSelectorProps) {
  return (
    <div className="form-control">
      <label className="label py-1">
        <span className="label-text text-neutral font-medium text-sm">{label}</span>
      </label>
      <div className="relative">
        <Listbox value={value} onChange={onChange}>
          <div className="relative">
            <Listbox.Button 
              className={`relative h-12 w-full flex items-center justify-between px-4 rounded-xl font-medium ${
                error 
                  ? 'bg-white border-2 border-red-500' 
                  : 'bg-[#F4F4F5] border-0'
              } focus:bg-white focus:outline-none focus:border-2 focus:border-red-burgundy text-left`}
            >
              {({ open }) => (
                <>
                  <span className={`block truncate text-sm ${!value ? 'text-gray-400' : 'text-gray-700'}`}>
                    {value ? value.name : placeholder}
                  </span>
                  <ChevronDownIcon 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                      open ? 'transform rotate-180' : ''
                    }`} 
                    aria-hidden="true" 
                  />
                </>
              )}
            </Listbox.Button>
            
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-md max-h-56 rounded-xl py-1 text-sm overflow-auto focus:outline-none ring-1 ring-black ring-opacity-5">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.id}
                    value={option}
                    className={({ active }) =>
                      `cursor-default select-none relative py-2 px-4 ${
                        active ? 'bg-red-burgundy/5 text-red-burgundy' : 'text-gray-700'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {option.name}
                      </span>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>
      {error && (
        <label className="label py-0.5">
          <span className="label-text-alt text-error text-xs">{error.message}</span>
        </label>
      )}
    </div>
  );
}); 