import { TrashIcon } from '@heroicons/react/outline'
import { useState } from 'react'
import { ContentContainer, PageWrapper, Title } from '~/components/Common'
import { RadioButtons } from '~/components/Common/RadioButtons'
import { InputWithLabel } from '~/components/form/InputWithLabel'
import { SubmitButton } from '~/components/form/SubmitButton'
import { getItemNameById } from '~/utils/items'
import Modal from '../../form/Modal'
import ItemSelect from '~/components/form/select/ItemSelect'

const MAX_HOURS = 24 * 30

/**
 * Renders a component for managing seller undercut and sales alerts.
 * @example
 * ({
 *   sellerId: 'exampleSellerId',
 *   homeServer: 'exampleHomeServer'
 * })
 * JSX.Element
 * @param {string} sellerId - The ID of the seller.
 * @param {string} homeServer - The name of the home server.
 * @returns {JSX.Element} A React component for rendering undercut and sales alerts.
 * @description
 *   - Initializes state to track seller and item alert preferences.
 *   - Generates JSON data strings used for alerts configuration.
 *   - Provides interactive UI elements for users to customize alert criteria.
 *   - Handles copying JSON data to clipboard via a button click.
 */
const Results = ({
  sellerId,
  homeServer
}: {
  sellerId: string
  homeServer: string
}) => {
  const [info, setInfo] = useState<{
    addIds: Array<string>
    removeIds: Array<string>
    sellerIds: Array<string>
    hqOnly: boolean
    ignoreDataAfterHours: number
    ignoreStackSize: number
  }>({
    addIds: [],
    removeIds: [],
    sellerIds: [sellerId],
    hqOnly: false,
    ignoreDataAfterHours: MAX_HOURS,
    ignoreStackSize: 9999
  })

  const [modal, setModal] = useState<{
    form: 'addIds' | 'removeIds' | 'sellerIds'
    open: boolean
  }>({ form: 'removeIds', open: false })
  const jsonData = `{
  "retainer_names": [${info.sellerIds.map((id) => `"${id}"`).join(',')}],
  "server": "${homeServer}",
  "add_ids": [${info.addIds.join(',')}],
  "ignore_ids": [${info.removeIds.join(',')}],
  "hq_only": ${info.hqOnly.toString()},
  "ignore_data_after_hours": ${info.ignoreDataAfterHours},
  "ignore_undercuts_with_quantity_over": ${info.ignoreStackSize}
}`
  const salesAlertJson = `{
  "retainer_names": [${info.sellerIds.map((id) => `"${id}"`).join(',')}],
  "server": "${homeServer}",
  "item_ids": []
}`

  const isAddModal = modal.form === 'addIds'
  const isSellerModal = modal.form === 'sellerIds'

  return (
    <PageWrapper>
      <ContentContainer>
        <>
          <div className="flex flex-col my-2 gap-2">
            <Title title="Input for undercut alerts" />
            <UndercutDescription />
            <p className="text-gray-900 dark:text-gray-100"></p>
            <RadioButtons
              title="I want to be alerted on"
              name="alert-type"
              radioOptions={[
                { label: 'All items', value: 'removeIds' },
                { label: 'Selected items', value: 'addIds' }
              ]}
              onChange={(value) => {
                if (value !== 'addIds' && value !== 'removeIds') return
                setModal({ form: value, open: false })
                setInfo({
                  ...info,
                  addIds: [],
                  removeIds: value === 'addIds' ? ['-1'] : []
                })
              }}
              defaultChecked={modal.form}
            />

            <div className={`mt-1 flex rounded-md shadow-sm max-w-fit`}>
              <button
                className="w-full py-2 px-4 text-sm bg-gray-100 border-gray-300 rounded text-left dark:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
                aria-label="Choose filters"
                type="button"
                onClick={() => {
                  setModal({ ...modal, open: true })
                }}>
                {isAddModal ? 'Alert on these items' : 'Filter out these items'}
              </button>
            </div>
            <div className="mt-1 flex rounded-md shadow-sm max-w-fit">
              <button
                className="w-full py-2 px-4 text-sm bg-gray-100 border-gray-300 rounded text-left dark:bg-gray-600 dark:text-gray-200 dark:border-gray-600"
                aria-label="Add all Retainers"
                type="button"
                onClick={() => {
                  setModal({ form: 'sellerIds', open: true })
                }}>
                Add all Retainers
              </button>
            </div>
            <div className="flex justify-center mt-2 items-center max-w-fit dark:text-gray-300">
              <label htmlFor="hq-only">High Quality Only</label>
              <input
                className="ml-2 rounded p-1"
                id="hq-only"
                type="checkbox"
                checked={info.hqOnly}
                onChange={() =>
                  setInfo((state) => ({ ...state, hqOnly: !state.hqOnly }))
                }
              />
            </div>
            <div className="max-w-sm">
              <InputWithLabel
                type="number"
                labelTitle="Stop alerting after:"
                inputTag={'Hours'}
                toolTip="Don't alert me after data is this many hours old"
                min={1}
                step={1}
                max={MAX_HOURS}
                value={info.ignoreDataAfterHours}
                onChange={(e) => {
                  setInfo((state) => ({
                    ...state,
                    ignoreDataAfterHours: Math.min(
                      parseInt(e.target.value, 10),
                      MAX_HOURS
                    )
                  }))
                }}
              />
            </div>
            <div className="max-w-sm mb-2">
              <InputWithLabel
                type="number"
                labelTitle="Ignore stacks larger than this:"
                inputTag={'Stack Size'}
                toolTip="Don't alert me when undercut by large stacks at cheap prices."
                min={1}
                step={1}
                max={9999}
                value={info.ignoreStackSize}
                onChange={(e) => {
                  setInfo((state) => ({
                    ...state,
                    ignoreStackSize: parseInt(e.target.value, 10)
                  }))
                }}
              />
            </div>

            <pre className="overflow-x-scroll bg-slate-700 text-gray-200 p-4 rounded dark:bg-slate-900">
              <code>{jsonData}</code>
            </pre>
            <div className="max-w-fit my-2">
              <SubmitButton
                title="Copy to clipboard"
                type="button"
                disabled={isAddModal && info.addIds.length === 0}
                onClick={async () => {
                  if (
                    typeof window !== 'undefined' &&
                    typeof document !== 'undefined'
                  ) {
                    if (!window.isSecureContext) {
                      alert('Unable to copy.')
                      return
                    }
                    await navigator.clipboard.writeText(jsonData)
                    alert('Copied to clipboard!')
                  }
                }}
              />
            </div>

            <Title title="Input for Sales Alerts" />
            <SalesAlertDescription />
            <pre className="overflow-x-scroll bg-slate-700 text-gray-200 p-4 rounded dark:bg-slate-900">
              <code>{salesAlertJson}</code>
            </pre>
            <div className="max-w-fit my-2">
              <SubmitButton
                title="Copy to clipboard"
                type="button"
                disabled={isAddModal && info.addIds.length === 0}
                onClick={async () => {
                  if (
                    typeof window !== 'undefined' &&
                    typeof document !== 'undefined'
                  ) {
                    if (!window.isSecureContext) {
                      alert('Unable to copy.')
                      return
                    }
                    await navigator.clipboard.writeText(salesAlertJson)
                    alert('Copied to clipboard!')
                  }
                }}
              />
            </div>
          </div>
          {modal.open && (
            <Modal
              title={
                isAddModal
                  ? 'Include Items'
                  : isSellerModal
                  ? 'Add Retainers'
                  : 'Ignore Items'
              }
              onClose={() => {
                setModal({ ...modal, open: false })
              }}>
              <div>
                <p className="text-sm text-grey-500 my-1 dark:text-gray-200">
                  {isAddModal
                    ? 'Please search for items that you would like to include in your alert.'
                    : isSellerModal
                    ? 'Please enter all your other retainer names or IDs.'
                    : 'Please search for items that you do not wish to be included in your undercut alerts.'}
                </p>
                {isSellerModal ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Enter seller ID"
                      className="rounded p-2"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          setInfo({
                            ...info,
                            sellerIds: [
                              ...info.sellerIds,
                              e.currentTarget.value
                            ]
                          })
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                    <ul className="first-child:mt-0 last-child:mb-0 mt-2 px-4">
                      {info.sellerIds.map((id, index) => (
                        <li
                          key={`${id}-${index}`}
                          className="flex items-center justify-between my-1 px-2 py-1 gap:3 dark:text-gray-200">
                          <p className="text-ellipsis">{id}</p>
                          <button
                            className="rounded p-1 border-gray-300 min-w-fit"
                            type="button"
                            onClick={() => {
                              setInfo({
                                ...info,
                                sellerIds: info.sellerIds.filter(
                                  (item) => item !== id
                                )
                              })
                            }}
                            aria-label="Delete">
                            <TrashIcon
                              className={`h-4 w-4 text-gray-500 mx-auto dark:text-gray-300`}
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <ItemSelect
                    onSelectChange={(selected) => {
                      if (!selected) {
                        return
                      }
                      setInfo({
                        ...info,
                        [modal.form]: [...info[modal.form], selected.id]
                      })
                    }}
                    tooltip={
                      isAddModal
                        ? 'Add specific items to your undercut alerts.'
                        : 'Ignore specific items from the alerts.'
                    }
                  />
                )}
                {!isSellerModal && (
                  <ul className="first-child:mt-0 last-child:mb-0 mt-2 px-4">
                    {info[modal.form].map((id, index) => (
                      <li
                        key={`${id}-${index}`}
                        className="flex items-center justify-between my-1 px-2 py-1 gap:3 dark:text-gray-200">
                        <p className="text-ellipsis">{getItemNameById(id)}</p>
                        <button
                          className="rounded p-1 border-gray-300 min-w-fit"
                          type="button"
                          onClick={() => {
                            setInfo({
                              ...info,
                              [modal.form]: info[modal.form].filter(
                                (item) => item !== id
                              )
                            })
                          }}
                          aria-label="Delete">
                          <TrashIcon
                            className={`h-4 w-4 text-gray-500 mx-auto dark:text-gray-300`}
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Modal>
          )}
        </>
      </ContentContainer>
    </PageWrapper>
  )
}

export default Results

// TODO: rework both these into 1 component to prevent redundant code
/**
 * Returns a JSX snippet for displaying information about using discord bot commands for undercut alerts.
 * @example
 * generateJSXSnippet()
 * <p className=...
 * @returns {JSX.Element} A JSX paragraph element with informational text and clickable links.
 * @description
 *   - The function creates hyperlink elements that open in a new tab with `target="_blank"`.
 *   - Rel attributes like `noreferrer` are used for security and privacy reasons.
 */
export const UndercutDescription = () => (
  <p className="italic text-sm text-grey-500 mb-1 dark:text-gray-300">
    Copy this to your clipboard and use it in our{' '}
    <a
      className="underline"
      href="https://discord.gg/saddlebag-exchange-973380473281724476"
      target="_blank"
      rel="noreferrer">
      discord server
    </a>{' '}
    for the bot slash command '/ff undercut' to activate or update{' '}
    <a
      className="underline"
      href="https://github.com/ff14-advanced-market-search/saddlebag-with-pockets/wiki/Undercut-Alerts---Alpha-version"
      target="_blank"
      rel="noreferrer">
      patreon undercut alerts.
    </a>
  </p>
)

/**
 * Renders a paragraph element with instructions for using Sales Alerts.
 * @example
 * renderSalesAlertInstructions()
 * Returns a JSX paragraph element with embedded links.
 * @returns {JSX.Element} A JSX fragment with a formatted paragraph and links.
 * @description
 *   - Displays instructions within styled paragraph tags.
 *   - Includes links to a Discord server and GitHub for additional resources.
 *   - Informs how to use a specific bot slash command in Discord.
 */
export const SalesAlertDescription = () => (
  <p className="italic text-sm text-grey-500 mb-1 dark:text-gray-300">
    To use Sales Alerts copy this to your clipboard and use it in our{' '}
    <a
      className="underline"
      href="https://discord.gg/saddlebag-exchange-973380473281724476"
      target="_blank"
      rel="noreferrer">
      discord server
    </a>{' '}
    for the bot slash command '/ff sale-register' to activate{' '}
    <a
      className="underline"
      href="https://github.com/ff14-advanced-market-search/saddlebag-with-pockets/wiki/Allagan-Tools-Inventory-Analysis#sale-and-undercut-alert-json-data"
      target="_blank"
      rel="noreferrer">
      patreon sale alerts.
    </a>
  </p>
)
