import type {
  FilterFn,
  SortingFn,
  ColumnFiltersState
} from '@tanstack/table-core'
import {
  createColumnHelper,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  sortingFns
} from '@tanstack/table-core'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flexRender, useReactTable } from '@tanstack/react-table'
import type { ResponseType } from '~/requests/FFXIV/FullScan'
import type { RankingInfo } from '@tanstack/match-sorter-utils'
import { compareItems, rankItem } from '@tanstack/match-sorter-utils'
import {
  ChevronDoubleRightIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/solid'
import { classNames } from '~/utils'
import UniversalisBadgedLink from '~/components/utilities/UniversalisBadgedLink'
import ItemDataLink from '~/components/utilities/ItemDataLink'
import FinalFantasyBadgedLink from '~/components/utilities/FinalFantasyBagdedLink'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import withScrolling from 'react-dnd-scrolling'
import Preview from './Preview'
import DraggableHeader from './DraggableHeader'
import { getOrderedColumns } from './getOrderedColumns'
import { SubmitButton } from '~/components/form/SubmitButton'
import { setFFScanOrder } from '~/redux/reducers/userSlice'
import { useDispatch } from 'react-redux'
import { defaultSortOrder } from '~/redux/localStorage/ffScanOrderHelpers'
import { useTypedSelector } from '~/redux/useTypedSelector'
import DateCell from './DateCell'
import MobileTable from '~/components/WoWResults/FullScan/MobileTable'
import CSVButton from '~/components/utilities/CSVButton'
import DebouncedInput from '~/components/Common/DebouncedInput'

type ResultTableProps = {
  rows: Array<ResponseType>
}

const ScrollingComponent = withScrolling('div')

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }

  interface FilterMeta {
    itemRank: RankingInfo
  }
}

const cvsFileList: Array<{ title: string; value: keyof ResponseType }> = [
  { title: 'Item Id', value: 'item_id' },
  { title: 'Item Name', value: 'real_name' },
  { title: 'Profit Amount', value: 'profit_amount' },
  { title: 'Avg Price Per Unit', value: 'avg_ppu' },
  { title: 'Home Price', value: 'home_server_price' },
  { title: 'Home Updated', value: 'home_update_time' },
  { title: 'Lowest Price', value: 'ppu' },
  { title: 'Profit %', value: 'profit_raw_percent' },
  { title: 'Return on Investment %', value: 'ROI' },
  { title: 'Average Sales Per Hour', value: 'sale_rates' },
  { title: 'Lowest Price Server', value: 'server' },
  { title: 'Lowest Price Stack Size', value: 'stack_size' },
  { title: 'Lowest Price Last Update Time', value: 'update_time' },
  { title: 'Universalis Link', value: 'url' },
  { title: 'NPC Vendor Info', value: 'npc_vendor_info' },
  { title: 'Region Weekly Median NQ', value: 'regionWeeklyMedianNQ' },
  { title: 'Region Weekly Average NQ', value: 'regionWeeklyAverageNQ' },
  {
    title: 'Region Weekly Sales Amount NQ',
    value: 'regionWeeklySalesAmountNQ'
  },
  {
    title: 'Region Weekly Quantity Sold NQ',
    value: 'regionWeeklyQuantitySoldNQ'
  },
  { title: 'Region Weekly Median HQ', value: 'regionWeeklyMedianHQ' },
  { title: 'Region Weekly Average HQ', value: 'regionWeeklyAverageHQ' },
  {
    title: 'Region Weekly Sales Amount HQ',
    value: 'regionWeeklySalesAmountHQ'
  },
  {
    title: 'Region Weekly Quantity Sold HQ',
    value: 'regionWeeklyQuantitySoldHQ'
  }
]

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })
  return itemRank.passed
}

export const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0

  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      rowB.columnFiltersMeta[columnId]?.itemRank!
    )
  }
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir
}

const isLastInTable = (
  columnId: string,
  columnOrder: Array<String>
): boolean => {
  const columnIndex = columnOrder.findIndex((col) => col === columnId)
  return columnIndex === columnOrder.length - 1
}

/**
 * Generates and manages a responsive table with filter, sort, and drag functionalities.
 * @example
 * ({ rows }: ResultTableProps)
 * <ResponsiveTableComponent />
 * @param {ResultTableProps} rows - The data rows to populate the table.
 * @returns {JSX.Element} A component displaying a filterable, sortable, and draggable table.
 * @description
 *   - Integrates a custom column helper to format each column with specific headers and cell values.
 *   - Employs react-table for advanced table management, including filtering and sorting.
 *   - Utilizes device-specific touch or HTML5 drag-and-drop backends based on user environment.
 *   - Implements side effects such as smooth scrolling and column order reset functionality.
 */
const Results = ({ rows }: ResultTableProps) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const touchBackendRef = useRef(false)
  const sortOrder = useTypedSelector((state) => state.user.ffScanSortOrder)
  const darkMode = useTypedSelector((state) => state.user.darkmode)
  const tableRef = useRef<HTMLTableElement>(null)

  const columnHelper = createColumnHelper<ResponseType>()
  const columns = [
    columnHelper.accessor('real_name', {
      header: 'Item Name',
      cell: ({ getValue }) => (
        <span className={`font-bold dark:font-medium select-all`}>
          {getValue()}
        </span>
      ),
      footer: (props) => props.column.id
    }),
    columnHelper.accessor('profit_amount', {
      header: 'Profit Amount',
      cell: (info) =>
        info.getValue() === 99999999999 ? '∞' : info.getValue().toLocaleString()
    }),
    columnHelper.accessor('avg_ppu', {
      header: 'Average Price Per Unit',
      cell: (info) => info.getValue().toLocaleString()
    }),
    columnHelper.accessor('home_server_price', {
      header: 'Home Server Price',
      cell: (info) =>
        !info.getValue() ? 'No Listing' : info.getValue().toLocaleString()
    }),
    columnHelper.accessor('home_update_time', {
      header: 'Home Server Info Last Updated At',
      cell: (info) => (
        <DateCell
          date={parseInt(info.getValue())}
          fixRight={isLastInTable('home_update_time', sortOrder)}
        />
      )
    }),
    columnHelper.accessor('ppu', {
      header: 'Lowest Price Per Unit',
      cell: (info) => info.getValue().toLocaleString()
    }),

    columnHelper.accessor('profit_raw_percent', {
      header: 'Profit Percentage',
      cell: (info) =>
        info.getValue() === 99999999999 ? '∞' : info.getValue().toLocaleString()
    }),

    columnHelper.accessor('sale_rates', {
      header: 'Average Sales Per Hour',
      cell: (info) => info.getValue().toLocaleString()
    }),
    columnHelper.accessor('server', {
      header: 'Lowest Price Server',
      cell: (info) => info.getValue().toLocaleString()
    }),
    columnHelper.accessor('stack_size', {
      header: 'Lowest Price Stack Size',
      cell: (info) => info.getValue().toLocaleString()
    }),
    columnHelper.accessor('update_time', {
      header: 'Lowest Price Last Update Time',
      cell: (info) => (
        <DateCell
          date={parseInt(info.getValue())}
          fixRight={isLastInTable('update_time', sortOrder)}
        />
      )
    }),
    columnHelper.accessor('ROI', {
      header: 'Return on Investment',
      cell: (info) => info.getValue().toLocaleString()
    }),
    columnHelper.accessor('url', {
      header: 'Universalis Link',
      cell: (info) => <UniversalisBadgedLink link={info.getValue()} />
    }),
    columnHelper.accessor('npc_vendor_info', {
      header: 'NPC Vendor Info',
      cell: (info) => {
        const value = info.getValue()
        if (!value) return null
        return <FinalFantasyBadgedLink link={value} />
      }
    }),
    columnHelper.accessor('item_id', {
      header: 'Item Data',
      cell: (info) => (
        <ItemDataLink link={`/queries/item-data/${info.getValue()}`} />
      )
    }),
    columnHelper.accessor('regionWeeklyMedianNQ', {
      header: 'Region Weekly Median NQ',
      cell: (info) => info.getValue().toLocaleString()
    }),
    columnHelper.accessor('regionWeeklyAverageNQ', {
      header: 'Region Weekly Average NQ',
      cell: (info) => info.getValue().toLocaleString()
    }),
    columnHelper.accessor('regionWeeklySalesAmountNQ', {
      header: 'Region Weekly Sales Amount NQ',
      cell: (info) => info.getValue().toLocaleString()
    }),
    columnHelper.accessor('regionWeeklyQuantitySoldNQ', {
      header: 'Region Weekly Quantity Sold NQ',
      cell: (info) => info.getValue().toLocaleString()
    }),
    columnHelper.accessor('regionWeeklyMedianHQ', {
      header: 'Region Weekly Median HQ',
      cell: (info) => info.getValue().toLocaleString()
    }),
    columnHelper.accessor('regionWeeklyAverageHQ', {
      header: 'Region Weekly Average HQ',
      cell: (info) => info.getValue().toLocaleString()
    }),
    columnHelper.accessor('regionWeeklySalesAmountHQ', {
      header: 'Region Weekly Sales Amount HQ',
      cell: (info) => info.getValue().toLocaleString()
    }),
    columnHelper.accessor('regionWeeklyQuantitySoldHQ', {
      header: 'Region Weekly Quantity Sold HQ',
      cell: (info) => info.getValue().toLocaleString()
    })
  ]

  const mobileColumns = columns.map((item) => ({
    columnId: item?.accessorKey,
    header: item.header,
    accessor: item.cell
  }))

  const table = useReactTable({
    // @ts-ignore
    data: rows,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      columnFilters,
      globalFilter,
      columnOrder: sortOrder
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getColumnCanGlobalFilter: () => true,
    debugTable: true,
    debugHeaders: true,
    debugColumns: false
  })

  const defaultSorting = useMemo(
    () => [
      {
        id: 'profit_amount',
        desc: true
      }
    ],
    []
  )

  const mobileColumnList = [
    { columnId: 'real_name', header: 'Item Name' },
    { columnId: 'profit_amount', header: 'Profit Amount' }
  ]

  const mobileSelectOptions = [
    'profit_amount',
    'avg_ppu',
    'home_server_price',
    'ppu',
    'profit_raw_percent',
    'sale_rates',
    'stack_size',
    'ROI'
  ]

  useEffect(() => {
    table.setSorting(defaultSorting)
  }, [table, defaultSorting])

  const dispatch = useDispatch()

  const handleReorder = useCallback(
    (item: any, newIndex: number) => {
      const newOrder = getOrderedColumns(item.index, newIndex, sortOrder)

      if (!newOrder) {
        return
      }

      dispatch(setFFScanOrder(newOrder))
    },
    [sortOrder, dispatch]
  )

  useEffect(() => {
    // check which drag to use
    if (window) {
      if ('ontouchstart' in window) {
        touchBackendRef.current = true
      }
    }

    // Scroll on first load
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const handleColumnReset = () => dispatch(setFFScanOrder(defaultSortOrder))

  return (
    <>
      <div
        key={`${touchBackendRef.current}`}
        className={`hidden sm:flex flex-col mt-0`}>
        <div className="py-2 sm:py-5">
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="rounded-lg bg-blue-600 p-2 shadow-lg sm:p-3">
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex w-0 flex-1 items-center">
                  <span className="flex rounded-lg bg-blue-800 p-2">
                    <ChevronDoubleRightIcon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </span>
                  <p className="ml-3 truncate font-medium text-white flex flex-1 flex-col">
                    <span className="md:hidden">This is a wide table!</span>
                    <span className="md:hidden">
                      Drag a column name to move it!
                    </span>
                    <span className="hidden md:inline">
                      Heads up, this table is pretty wide. You'll probably need
                      to scroll horizontally (left & right).
                    </span>
                    <span className="hidden md:inline">
                      Click a column name to sort by that column. Drag a column
                      name to move it!
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full my-2 flex justify-between">
          <div className="flex flex-wrap gap-y-3">
            <SubmitButton
              onClick={handleColumnReset}
              title={'Reset table columns'}
              type="button"
            />
            <CSVButton
              data={rows}
              columns={cvsFileList}
              filename="saddlebag-fullscan.csv"
            />
          </div>

          <DebouncedInput
            onDebouncedChange={(value) => {
              setGlobalFilter(value)
            }}
            className={'h-10 ml-3 p-2 rounded-md'}
            placeholder={'Search...'}
          />
        </div>

        <DndProvider
          backend={touchBackendRef.current ? TouchBackend : HTML5Backend}>
          <ScrollingComponent>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-scroll shadow ring-1 ring-black ring-opacity-5 md:rounded-lg max-h-[calc(100vh-120px)]">
                  <table
                    ref={tableRef}
                    className="min-w-full relavtive divide-y divide-gray-300 mt-2 bg-gray-50 dark:bg-gray-600 dark:divide-gray-600">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header, i) => (
                            <DraggableHeader
                              scope={`col`}
                              reorder={handleReorder}
                              key={header.id}
                              column={header}
                              index={i}
                              darkMode={darkMode}
                              onClick={header.column.getToggleSortingHandler()}
                              className={classNames(
                                header.column.getCanSort()
                                  ? 'cursor-pointer'
                                  : '',
                                `px-3 py-3.5 text-left bg-gray-50 dark:bg-gray-600 text-sm font-semibold text-gray-900 dark:text-gray-100 sticky top-0 z-10`
                              )}>
                              <div
                                className={`group inline-flex  min-w-[100px]`}>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                                <div
                                  className={classNames(
                                    header.column.getIsSorted()
                                      ? 'bg-gray-200 dark:bg-gray-500'
                                      : '',
                                    ` ml-1 flex flex-0 p-1 justify-center items-center`
                                  )}>
                                  {{
                                    asc: (
                                      <span
                                        className={`text-gray-900 group-hover:bg-gray-300 dark:bg-gray-700 dark:group-hover:bg-gray-500 dark:text-gray-300 dark:group-hover:text-gray-100`}>
                                        <ChevronUpIcon className={`h-4 w-4`} />
                                      </span>
                                    ),
                                    desc: (
                                      <span
                                        className={`text-gray-900 group-hover:bg-gray-300 dark:bg-gray-700 dark:group-hover:bg-gray-500 dark:text-gray-300 dark:group-hover:text-gray-100`}>
                                        <ChevronDownIcon
                                          className={`h-4 w-4`}
                                        />
                                      </span>
                                    )
                                  }[header.column.getIsSorted() as string] ?? (
                                    <span
                                      className={`invisible flex-none rounded text-gray-400 group-hover:visible group-focus:visible`}>
                                      <ChevronDownIcon className={`h-4 w-4`} />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </DraggableHeader>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:bg-slate-800 dark:divide-gray-500">
                      {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="whitespace-nowrap px-2 py-2 text-sm text-gray-900 dark:text-gray-100">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-0 ">
                  <p
                    className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300`}>
                    {`${rows.length} results found`}
                  </p>
                </div>
              </div>
            </div>
          </ScrollingComponent>
          <Preview />
        </DndProvider>
      </div>
      <div className="flex sm:hidden mt-4">
        <CSVButton
          data={rows}
          columns={cvsFileList}
          filename="saddlebag-fullscan.csv"
        />
      </div>
      <MobileTable
        data={rows}
        sortingOrder={defaultSorting}
        columnList={mobileColumnList}
        rowLabels={mobileColumns}
        columnSelectOptions={mobileSelectOptions}
      />
    </>
  )
}

export default Results
