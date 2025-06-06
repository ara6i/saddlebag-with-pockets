import type { FC, PropsWithChildren } from 'react'

type SVGProps = PropsWithChildren<{ className: string }>

/**
 * Renders an SVG component representing the Discord icon.
 *
 * @example
 * <DiscordIcon className="my-discord-icon" />
 * Returns an SVG representing the Discord icon.
 *
 * @param {object} props - Properties to customize the SVG element.
 * @param {string} props.className - CSS class for styling the SVG.
 * @returns {JSX.Element} SVG element representing the Discord icon.
 *
 * @description
 *   - The SVG component is styled to fit within a 1em x 1em box and scales with its container's font size.
 *   - The `fill` and `stroke` of the SVG use the current text color (`currentColor`).
 *   - The SVG paths create the Discord logo with details defined by a single clip path for the entire icon.
 */
const DiscordIcon: FC<SVGProps> = (props) => {
  return (
    <svg
      className={props.className}
      viewBox="0 0 416 480"
      height={`1em`}
      width={`1em`}
      stroke="currentColor"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_4_16)">
        <path d="M416 50.52C415.874 37.3633 410.567 24.7866 401.229 15.5167C391.892 6.24683 379.277 1.03097 366.12 1L49.64 0C36.4962 0.00260223 23.8898 5.21689 14.5845 14.4997C5.2792 23.7825 0.0344145 36.3763 0 49.52V376C0 403.3 22.28 424 49.64 424H320L307 380L416 480V50.52ZM276.65 313.81C276.65 313.81 267.93 303.42 260.65 294.49C292.39 285.55 304.5 266 304.5 266C295.782 271.783 286.44 276.563 276.65 280.25C265.346 284.943 253.577 288.426 241.54 290.64C220.799 294.45 199.531 294.368 178.82 290.4C166.637 288.138 154.714 284.653 143.23 280C137.155 277.673 131.248 274.93 125.55 271.79C124.82 271.31 124.1 271.07 123.37 270.58C122.88 270.34 122.64 270.1 122.37 270.1C118.01 267.68 115.59 265.99 115.59 265.99C115.59 265.99 127.21 285.08 157.97 294.25C150.7 303.43 141.74 314.06 141.74 314.06C88.23 312.37 67.89 277.59 67.89 277.59C67.89 200.53 102.76 137.97 102.76 137.97C137.63 112.12 170.56 112.85 170.56 112.85L172.98 115.75C129.39 128.07 109.54 147.15 109.54 147.15C109.54 147.15 114.86 144.25 123.82 140.38C149.73 129.03 170.32 126.13 178.82 125.17C180.177 124.888 181.555 124.724 182.94 124.68C199.166 122.575 215.586 122.413 231.85 124.2C257.388 127.134 282.128 134.923 304.74 147.15C304.74 147.15 285.61 129 244.44 116.7L247.83 112.84C247.83 112.84 281 112.11 315.64 138C315.64 138 350.51 200.56 350.51 277.62C350.51 277.34 330.16 312.12 276.65 313.81V313.81Z" />
        <path d="M164.05 202C150.25 202 139.35 213.84 139.35 228.57C139.35 243.3 150.49 255.14 164.05 255.14C177.85 255.14 188.75 243.31 188.75 228.57C189 213.81 177.85 202 164.05 202ZM252.43 202C238.63 202 227.73 213.84 227.73 228.57C227.73 243.3 238.87 255.14 252.43 255.14C266.24 255.14 277.13 243.31 277.13 228.57C277.13 213.83 266 202 252.43 202Z" />
      </g>
      <defs>
        <clipPath id="clip0_4_16">
          <rect width="416" height="480" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default DiscordIcon
