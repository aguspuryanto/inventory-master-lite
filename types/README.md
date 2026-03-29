# Types Directory

This directory contains all TypeScript type definitions for the KasirKu ERP application.

## Structure

```
types/
├── index.ts          # Main export file - re-exports all types
├── product.ts        # Product and ProductVariant types
├── transaction.ts    # Transaction, TransactionItem, and related types
├── receipt.ts        # Receipt type for POS transactions
├── settings.ts       # PrinterSettings and StoreSettings
├── user.ts           # UserProfile, Staff, PaymentMethod types
├── bluetooth.ts      # Bluetooth device and connection types
├── common.ts         # Common utility types (API, UI, etc.)
├── bluetooth.d.ts    # Web Bluetooth API declarations
└── README.md         # This file
```

## Usage

All types can be imported from the main index file:

```typescript
import { Product, Transaction, TransactionItem } from '../types';
```

Or from individual files for better tree-shaking:

```typescript
import { Product } from '../types/product';
import { Transaction } from '../types/transaction';
```

## Type Categories

### Core Business Types
- **Product**: Product and ProductVariant interfaces
- **Transaction**: Transaction, TransactionItem, and related types
- **Receipt**: POS receipt type
- **Settings**: Application settings (printer, store, etc.)
- **User**: User management and authentication types

### Infrastructure Types
- **Bluetooth**: Web Bluetooth API integration types
- **Common**: Reusable utility types for API, UI, forms, etc.

## Type Definitions

### Product Types
```typescript
interface Product {
  id: string;
  code: string;
  name: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  category: string;
  image_url?: string;
  hasVariants?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Transaction Types
```typescript
interface Transaction {
  id: string;
  type: 'IN' | 'OUT';
  mainCategory: string;
  subCategory: string;
  amount: number;
  createdAt: string;
  description: string;
  items?: TransactionItem[];
}
```

### Bluetooth Types
```typescript
interface BluetoothDeviceInfo {
  id: string;
  name: string | null;
  connected: boolean;
  device?: any; // Web Bluetooth Device object
}
```

## Best Practices

1. **Consistent Naming**: Use PascalCase for interfaces and camelCase for properties
2. **Optional Properties**: Mark optional properties with `?` and provide defaults
3. **Union Types**: Use union types for enums and fixed values
4. **Generic Types**: Use generics for reusable API response types
5. **Documentation**: Add comments for complex type definitions

## Adding New Types

1. Create a new file in the appropriate category
2. Export the types from the file
3. Add the export to `index.ts`
4. Update this README if needed

## Type Safety

This structure ensures:
- **Type Safety**: All components have proper type definitions
- **IntelliSense**: Full autocomplete and error checking
- **Refactoring**: Safe refactoring with type checking
- **Documentation**: Types serve as documentation
- **Tree Shaking**: Only import what you need

## Dependencies

Types may depend on:
- Web Bluetooth API (for bluetooth.ts)
- DOM APIs (DataView, Date, etc.)
- React types (for component props)
- Database schema (for data models)

## Migration Notes

Previously, all types were in a single `types.ts` file. This migration:
- ✅ Improves organization and maintainability
- ✅ Enables better tree-shaking
- ✅ Makes types easier to find and modify
- ✅ Provides better code organization
- ✅ Maintains backward compatibility

All existing imports continue to work without changes.
