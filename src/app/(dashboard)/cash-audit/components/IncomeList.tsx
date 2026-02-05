import { Transaction } from '@/types';
import { IncomeRow } from './IncomeRow';

interface Props {
    income: Transaction[];
    readOnly?: boolean;
}

export const IncomeList = ({ income, readOnly = false }: Props) => {
    return (
        <div className="flex-col gap-2 mb-4">
            {income.map(item => (
                <IncomeRow key={item.id} income={item} readOnly={readOnly} />
            ))}
        </div>
    );
};
