export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'QR' | 'DEBITO' | 'CREDITO';

export interface Sale {
  id: string;
  amount: number;
  date: string; // ISO string
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  commission?: number; // Only for QR, debit, credit
  description?: string;
  isCredit?: boolean;
}

export type ExpenseCategory = 'Negocio' | 'Compras/Fletes' | 'Personal' | 'Pagos/Inversiones' | 'Otros';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  // Generic Transaction often doesn't need more
}

export interface Expense extends Transaction {
  category: ExpenseCategory;
  providerId?: string;
  providerName?: string;
}

export interface CashRegisterRecord {
  date: string; // YYYY-MM-DD
  sales: Sale[];
  income: {
    startCash: number;
    startDigital: number;
    others: Transaction[];
  };
  expenses: {
    commissions: number;
    others: Expense[];
  };
  audit: {
    realCash: number | "";
    realDigital: number | "";
    notes?: string;
    closed: boolean;
    closeDate?: string;
  };
  lastUpdated?: number; // Timestamp for conflict handling
}

export const DATA_KEY = "arqueo_data_v1";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'QR', label: 'QR' },
  { value: 'DEBITO', label: 'Débito' },
  { value: 'CREDITO', label: 'Crédito' },
];

export const METHODS_WITH_COMMISSION: PaymentMethod[] = ['QR', 'DEBITO', 'CREDITO'];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Negocio', 'Compras/Fletes', 'Pagos/Inversiones', 'Personal', 'Otros'];

// Organization Types
export interface OrganizationSettings {
  features?: {
    stock?: boolean;           // Products module
    supplies?: boolean;        // Supplies/Materials module (Insumos)
    wastage?: boolean;         // Wastage tracking (Mermas)
    reserves?: boolean;        // Financial reserves/savings
    commitments?: boolean;     // Payment commitments
    providers?: boolean;       // Providers/Suppliers
    reports?: boolean;         // Reports and analytics
    history?: boolean;         // Audit history
  };
  terminology?: {
    product?: string;
  };
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: string;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  settings?: OrganizationSettings | null;
  themePrimary?: string;
  themeSecondary?: string;
  themeAccent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  productType?: string;
  stock?: number;
  minStock?: number;
  unit: string; // unidad -> unit
  wholesaleCost: number; // costoBulto
  wholesaleQuantity: number; // cantidadBulto
  unitCost: number; // costoUnitario
  margin: number; // margen
  suggestedPrice: number; // precioSugerido
  finalPrice: number; // precioFinal
  isOnSale?: boolean; // esOferta
  lastCost?: number | null;
  lastPrice?: number | null;
  organizationId?: string | null;
  updatedAt: Date;
}

// Supply Types
export interface Supply {
  id: string;
  name: string; // nombre -> name
  stock: number;
  minStock: number;
  unit: string; // unidad
  unitCost: number; // costoUnitario
  lastCost?: number | null;
  providerId?: string | null;
  provider?: Provider | null; // proveedor -> provider
  organizationId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Provider Types
export interface Provider {
  id: string;
  name: string;
  category?: string | null;
  phone?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  organizationId?: string | null;
}

// Commitment Types
export type CommitmentStatus = 'PENDING' | 'PAID'; // PENDIENTE -> PENDING

export interface Commitment {
  id: string;
  description: string;
  amount: number;
  dueDate: Date | string; // fechaVencimiento
  paymentDate?: Date | string | null; // fechaPago
  status: CommitmentStatus;
  notes?: string | null; // observaciones
  providerId?: string | null;
  provider?: Provider | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  organizationId?: string | null;
}

// Reservation Types
// Financial Reserve Types
export type ReserveType = 'CASH' | 'BANK'; // EFECTIVO -> CASH (Aligning with English DB)

export interface FinancialReserveTransaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  type: ReserveType;
  createdAt: Date;
  organizationId?: string | null;
}

// Crate/Empties Types
export interface CrateTransaction {
  id: string;
  date: Date;
  description: string;
  quantity: number;
  remainingStock: number;
  amount: number;
  createdAt: Date;
  organizationId?: string | null;
}

// Wastage Types
export interface WastageRecord {
  id: string;
  productId?: string;
  productName: string;
  quantity: number;
  costPerUnit: number;
  reason: string;
  date: Date;
  organizationId?: string | null;
}

// CashAudit (formerly Arqueo)
export interface CashAudit {
  id: string;
  date: string;
  createdAt: Date;
  data: CashRegisterRecord;
  totalSales: number;
  difference: number;
  reportUrl?: string | null;
  notes?: string | null;
  organizationId?: string | null;
}

// CashSession Data Structure (for JSON field)
export interface CashSessionData {
  sales: Sale[];
  income: {
    startCash: number;
    startDigital: number;
    others: Transaction[];
  };
  expenses: {
    commissions: number;
    others: Expense[];
  };
}

// CashSession Type
export interface CashSession {
  id: string;
  date: string;
  data: CashSessionData | null;
  startCash: number;
  startDigital: number;
  endCash?: number | null;
  endDigital?: number | null;
  difference?: number | null;
  notes?: string | null;
  status: string;
  closeDate?: Date | null;
  reportUrl?: string | null;
  updatedAt: Date;
  organizationId?: string | null;
}

// Provider Expense (for history tracking)
export interface ProviderExpense extends Expense {
  date: string;
  status: 'Open' | 'Closed';
}

// HistoricalPrice Types
export interface HistoricalPrice {
  id: number;
  productId: string;
  cost: number;
  price: number;
  date: Date;
}

// HistoryView Types
export interface CashAuditData {
  sales: SaleDetail[];
  income: Income;
  expenses: Expenses;
  audit: Audit;
}

export interface SaleDetail {
  id: string;
  time: string;
  amount: number;
  paymentMethod: string;
  commission: number;
  description?: string;
  isCredit: boolean;
}

export interface Income {
  startCash: number;
  startDigital: number;
  others: OtherIncome[];
}

export interface OtherIncome {
  id: string;
  description: string;
  amount: number;
}

export interface Expenses {
  commissions: number;
  others: OtherExpense[];
}

export interface OtherExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  providerName?: string;
}

export interface Audit {
  realCash: number;
  realDigital: number;
  notes?: string;
}

export interface TypedCashAudit extends Omit<CashAudit, 'data'> {
  data: CashAuditData;
}

export interface HistoryFilters {
  selectedMonth: number;
  selectedYear: number;
  selectedWeekday: number | null;
  searchTerm: string;
  view: 'list' | 'charts';
}

export interface HistoryStats {
  totalSales: number;
  totalNetSales: number;
  accumulatedDifference: number;
  daysWorked: number;
}

export interface EditArqueoState {
  id: string;
  date: string;
  notes: string;
}