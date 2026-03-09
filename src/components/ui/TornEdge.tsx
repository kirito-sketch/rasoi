interface Props {
  fill?: string
  className?: string
}

export function TornEdge({ fill = '#F5EDD8', className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 400 24"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full block ${className}`}
      style={{ marginTop: '-1px', display: 'block' }}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M0,8 L8,2 L16,10 L24,4 L34,14 L42,6 L52,12 L60,3 L70,11 L80,5 L88,13 L98,7 L106,15 L116,8 L124,2 L134,10 L142,5 L152,13 L160,7 L170,14 L178,4 L188,11 L196,6 L206,14 L214,8 L224,3 L232,11 L242,6 L250,13 L260,7 L268,15 L278,8 L286,3 L296,11 L304,5 L314,13 L322,7 L332,14 L340,4 L350,12 L358,6 L368,14 L376,8 L384,13 L392,5 L400,10 L400,24 L0,24 Z"
        fill={fill}
      />
    </svg>
  )
}
