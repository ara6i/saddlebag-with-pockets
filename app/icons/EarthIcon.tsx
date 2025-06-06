import type { FC, PropsWithChildren } from 'react'

type SVGProps = PropsWithChildren<{ className: string }>

/**
 * Returns an SVG representation of an Earth icon with configurable styles.
 * @example
 * props => { return (<svg className={props.className} ... />) }
 * <svg ...>...</svg>
 * @param {Object} props - Properties object containing settings for the SVG icon.
 * @param {string} props.className - CSS class to apply to the SVG for styling purposes.
 * @returns {JSX.Element} An SVG element representing an Earth icon.
 * @description
 *   - The SVG stroke and fill colors are both set to "currentColor" to inherit from parent styles.
 *   - The default viewBox is set to "0 0 24 24", defining the aspect ratio and coordinate system for the SVG.
 *   - The icon's styling can be adjusted via CSS classes passed in through the `className` prop.
 */
const EarthIcon: FC<SVGProps> = (props) => {
  return (
    <svg
      stroke="currentColor"
      className={props.className}
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg">
      <g>
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm6.355-6.048v-.105c0-.922 0-1.343-.652-1.716a7.374 7.374 0 0 0-.645-.325c-.367-.167-.61-.276-.938-.756a12.014 12.014 0 0 1-.116-.172c-.345-.525-.594-.903-1.542-.753-1.865.296-2.003.624-2.085 1.178l-.013.091c-.121.81-.143 1.082.195 1.437 1.265 1.327 2.023 2.284 2.253 2.844.112.273.4 1.1.202 1.918a8.185 8.185 0 0 0 3.151-2.237c.11-.374.19-.84.19-1.404zM12 3.833c-2.317 0-4.41.966-5.896 2.516.177.123.331.296.437.534.204.457.204.928.204 1.345 0 .328 0 .64.105.865.144.308.766.44 1.315.554.197.042.399.084.583.135.506.14.898.595 1.211.96.13.151.323.374.42.43.05-.036.211-.211.29-.498.062-.22.044-.414-.045-.52-.56-.66-.529-1.93-.356-2.399.272-.739 1.122-.684 1.744-.644.232.015.45.03.614.009.622-.078.814-1.025.949-1.21.292-.4 1.186-1.003 1.74-1.375A8.138 8.138 0 0 0 12 3.833z"></path>
      </g>
    </svg>
  )
}

export default EarthIcon
