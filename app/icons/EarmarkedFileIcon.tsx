import type { FC, PropsWithChildren } from 'react'

type SVGProps = PropsWithChildren<{ className: string }>

/**
 * Renders an SVG icon representing an earmarked file.
 * @example
 * EarmarkedFileIcon({ className: "icon-class" })
 * // Returns an SVG component for display.
 * @param {Object} props - Props containing styling information for the SVG element.
 * @param {string} props.className - A string representing the CSS class for styling the SVG.
 * @returns {JSX.Element} A JSX element rendering a file icon.
 * @description
 *   - The SVG uses "currentColor" for both stroke and fill, inheriting from the surrounding text.
 *   - The default SVG dimensions are set to "1em" for scalable sizing.
 *   - The function does not manage any user interactions or states.
 */
const EarmarkedFileIcon: FC<SVGProps> = (props) => {
  return (
    <svg
      className={props.className}
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 16 16"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zm.5 10v-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-2.5.5a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1zm-3 0a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-1z"></path>
    </svg>
  )
}

export default EarmarkedFileIcon
