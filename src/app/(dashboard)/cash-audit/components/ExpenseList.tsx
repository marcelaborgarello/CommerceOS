import { Expense, Provider } from '@/types';
import { ExpenseRow } from './ExpenseRow';

interface Props {
    expenses: Expense[];
    totalExpenses: number;
    providers?: Provider[];
    readOnly?: boolean;
}

export const ExpenseList = ({ expenses, totalExpenses, providers = [], readOnly = false }: Props) => {
    return (
        <div className="flex-col">
            <div className="flex-row justify-between items-center mb-4 px-2">
                <span className="text-sm text-secondary uppercase tracking-wider">Historial de Gastos</span>
                <span className="text-xl font-bold text-red">
                    Total: ${totalExpenses.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
            </div>

            <div className="flex-col gap-4">
                {expenses.length === 0 ? (
                    <div className="text-center p-8 opacity-50 italic">
                        No hay gastos registrados hoy.
                    </div>
                ) : (
                    expenses.map(expense => (
                        <ExpenseRow key={expense.id} expense={expense} providers={providers} readOnly={readOnly} />
                    ))
                )}
            </div>
        </div>
    );
};
