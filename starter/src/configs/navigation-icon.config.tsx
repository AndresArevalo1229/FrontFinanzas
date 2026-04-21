import {
    PiHouseLineDuotone,
    PiBuildingsDuotone,
    PiWalletDuotone,
    PiCreditCardDuotone,
    PiTagDuotone,
    PiArrowsClockwiseDuotone,
    PiSwapDuotone,
    PiPiggyBankDuotone,
    PiTargetDuotone,
    PiChartBarDuotone,
    PiChartDonutDuotone,
    PiChartLineUpDuotone,
} from 'react-icons/pi'
import type { JSX } from 'react'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <PiHouseLineDuotone />,
    workspaces: <PiBuildingsDuotone />,
    finance: <PiWalletDuotone />,
    accounts: <PiCreditCardDuotone />,
    categories: <PiTagDuotone />,
    transactions: <PiArrowsClockwiseDuotone />,
    transfers: <PiSwapDuotone />,
    budgets: <PiPiggyBankDuotone />,
    goals: <PiTargetDuotone />,
    reports: <PiChartBarDuotone />,
    reportByCategory: <PiChartDonutDuotone />,
    reportCashflow: <PiChartLineUpDuotone />,
}

export default navigationIcon
