import type { FC } from 'react'
import { Fragment } from 'react'
import * as locations from '~/utils/locations'

type SelectDataCenterProps = {
  onSelect: (data_center: string) => void
  dataCenter: string | undefined
}
/**
 * Renders a select dropdown for choosing a data center based on region.
 * @example
 * dataCenterSelect({
 *   onSelect: handleSelection,
 *   dataCenter: 'RegionName'
 * })
 * // Returns a JSX select component with available data centers
 * @param {function} onSelect - Callback function to handle selection changes.
 * @param {string} dataCenter - Default selected data center name or placeholder if undefined.
 * @returns {JSX.Element} A React component representing a dropdown selection list for data centers.
 * @description
 *   - Uses the `Array.from` method to extract region information.
 *   - Applies styling classes for responsive design and theme adaptability.
 *   - Loads data centers dynamically based on the selected region.
 *   - Includes an option for cases where no specific data center is preselected.
 */
export const SelectDataCenter: FC<SelectDataCenterProps> = ({
  onSelect,
  dataCenter
}) => {
  const regions = Array.from(locations.Regions)

  const dataCenterDefaultValue = dataCenter
    ? dataCenter
    : 'Select your Data Center'

  const dataCentersFromRegion = (region_id: string) => {
    return locations.DataCentersOfRegion(region_id)
  }
  return (
    <select
      key={'data_center_select'}
      name="data_center"
      autoComplete="data_center"
      placeholder={'Select your Data Center'}
      className="focus:ring-blue-500 focus:border-blue-500 relative block w-full rounded-sm bg-transparent focus:z-10 sm:text-sm border-gray-300 dark:border-gray-400 dark:text-gray-100 dark:bg-gray-600"
      defaultValue={dataCenterDefaultValue}
      onChange={(event) => {
        onSelect(event.target.value)
      }}>
      {!dataCenter && (
        <option disabled hidden>
          {dataCenterDefaultValue}
        </option>
      )}
      {regions.map((value, index, array) => {
        return (
          <Fragment key={`${index}_${value[0]}`}>
            <option disabled key={value[0]}>
              {value[1][1]} Data Centers
            </option>
            {dataCentersFromRegion(value[0]).map((value) => {
              return <option key={value.name}>{value.name}</option>
            })}
          </Fragment>
        )
      })}
    </select>
  )
}
