import React from 'react'
import PortfolioEditor from '../../components/PortfolioEditor'

export default function DragBuilder({ portfolio }){
  return <PortfolioEditor portfolioId={portfolio.id} />
}
