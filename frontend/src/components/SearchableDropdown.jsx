import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'

export default function SearchableDropdown({ options, value, onChange, placeholder, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedOption = options.find(opt => opt.value === value)

  const handleSelect = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 text-left bg-white border border-[#e3e8ee] rounded-xl text-xs flex items-center justify-between focus:outline-none focus:border-[#1a1a2e] transition"
      >
        <span className={selectedOption ? 'text-[#0d253d]' : 'text-[#64748d]'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} className={`text-[#64748d] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#e3e8ee] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Search Input */}
          <div className="p-2 border-b border-[#e3e8ee] bg-[#f9fafb]">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748d]" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-7 pr-3 py-1.5 bg-white border border-[#e3e8ee] rounded-lg text-[11px] focus:outline-none focus:border-[#533afd] transition"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-[200px] overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-[#64748d]">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-3 py-2 text-[11px] rounded-lg flex items-center justify-between transition-colors ${
                    value === option.value
                      ? 'bg-[#f5f4fe] text-[#533afd] font-semibold'
                      : 'text-[#0d253d] hover:bg-[#f1f5f9]'
                  }`}
                >
                  {option.label}
                  {value === option.value && <Check size={12} className="text-[#533afd]" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
