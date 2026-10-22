import type { HTMLAttributes, ReactNode } from 'react'
import { useCard } from './useCard'
import { useCardSection } from './useCardSection'

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  as?: 'article' | 'section' | 'div'
  padding?: 'none' | 'small' | 'medium' | 'large'
}

export function Card({ as: Element = 'div', padding = 'medium', className = '', children, ...props }: CardProps) {
  const cardClassName = useCard({ padding, className })
  return <Element className={cardClassName} {...props}>{children}</Element>
}

export function CardHeader({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  const sectionClassName = useCardSection('header', className)
  return <div className={sectionClassName} {...props} />
}

export function CardBody({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  const sectionClassName = useCardSection('body', className)
  return <div className={sectionClassName} {...props} />
}

export function CardFooter({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  const sectionClassName = useCardSection('footer', className)
  return <div className={sectionClassName} {...props} />
}
