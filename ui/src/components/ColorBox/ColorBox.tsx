import classNames from 'classnames';

export function ColorBox({
  children,
  popOnHover = true,
  color = 'primary',
}: {
  children: React.ReactNode;
  popOnHover?: boolean;
  color?: 'primary',
}) {
  const classes = classNames('rounded-md w-full', {
    'bg-primary-50 border border-blue-200': color === 'primary',
    'hover-bounce': popOnHover,
  })

  return (
    <div className={classes}>
      {children}
    </div>
  )
}
