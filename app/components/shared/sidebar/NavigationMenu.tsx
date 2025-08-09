import { memo } from 'react';
import type { NavigationMenuProps, NavigationItemWithTranslation } from './types';

const NavigationButton = memo(function NavigationButton({
  item,
  isActive,
  isCollapsed,
  onMouseEnter,
  onMouseLeave,
  onClick
}: {
  item: NavigationItemWithTranslation;
  isActive: boolean;
  isCollapsed: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`w-full transition-all duration-300 ease-in-out relative group ${
        isCollapsed 
          ? 'p-3 rounded-2xl' 
          : 'px-4 py-3 rounded-2xl'
      } ${
        isActive
          ? 'bg-red-burgundy text-white shadow-lg transform scale-[1.02]'
          : 'text-gray-700 hover:bg-red-burgundy hover:text-white hover:shadow-md'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
        <item.icon
          className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'} transition-colors duration-300 ${
            isActive ? 'text-white' : 'text-gray-400 group-hover:text-red-burgundy'
          }`}
        />
        {!isCollapsed && (
          <span className="font-serif font-medium text-sm">
            {item.name}
          </span>
        )}
      </div>
      
      {/* Active indicator for collapsed mode */}
      {isCollapsed && isActive && (
        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-full shadow-sm"></div>
      )}
    </button>
  );
});

const Tooltip = memo(function Tooltip({
  content,
  visible
}: {
  content: string;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 z-50">
      <div className="bg-red-burgundy text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
        {content}
        <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-red-burgundy rotate-45"></div>
      </div>
    </div>
  );
});

const NavigationMenu = memo(function NavigationMenu({
  items,
  isCollapsed,
  activeTooltip,
  onTooltipChange,
  onItemClick,
  isItemActive
}: NavigationMenuProps) {
  return (
    <nav className="flex-1 overflow-y-auto px-2 pb-4">
      <div className="space-y-1">
        {items.map((item, index) => {
          const isActive = isItemActive(item, index);
          
          const handleClick = () => onItemClick(item, index);
          const handleMouseEnter = () => isCollapsed && onTooltipChange(item.name);
          const handleMouseLeave = () => onTooltipChange(null);

          if (isCollapsed) {
            return (
              <div key={item.key} className="relative">
                <NavigationButton
                  item={item}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                  onClick={handleClick}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                />
                <Tooltip
                  content={item.name}
                  visible={activeTooltip === item.name}
                />
              </div>
            );
          }

          return (
            <NavigationButton
              key={item.key}
              item={item}
              isActive={isActive}
              isCollapsed={isCollapsed}
              onClick={handleClick}
            />
          );
        })}
      </div>
    </nav>
  );
});

export default NavigationMenu; 