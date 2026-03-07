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
    'bg-primary-50 dark:bg-primary-900/30 border border-blue-200 dark:border-blue-700': color === 'primary',
    'hover-bounce': popOnHover,
  })

  return (
    <div className={classes}>
      {children}
    </div>
  )
}
