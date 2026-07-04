// Template loader utility for loading local template files
// Using direct imports for Vite compatibility

import developerPortfolio from '../templates/portfolio/developer.json'
import studentPortfolio from '../templates/portfolio/student.json'
import creativePortfolio from '../templates/portfolio/creative.json'
import professionalPortfolio from '../templates/portfolio/professional.json'
import minimalPortfolio from '../templates/portfolio/minimal.json'

import atsResume from '../templates/resume/ats.json'
import modernResume from '../templates/resume/modern.json'
import softwareEngineerResume from '../templates/resume/software-engineer.json'
import studentResume from '../templates/resume/student.json'
import professionalResume from '../templates/resume/professional.json'
import creativeResume from '../templates/resume/creative.json'

const portfolioTemplates = {
  developer: developerPortfolio,
  student: studentPortfolio,
  creative: creativePortfolio,
  professional: professionalPortfolio,
  minimal: minimalPortfolio
}

const resumeTemplates = {
  ats: atsResume,
  modern: modernResume,
  'software-engineer': softwareEngineerResume,
  student: studentResume,
  professional: professionalResume,
  creative: creativeResume
}

export function loadPortfolioTemplate(templateId) {
  return portfolioTemplates[templateId] || null
}

export function loadResumeTemplate(templateId) {
  return resumeTemplates[templateId] || null
}

export function getAllPortfolioTemplates() {
  return Object.keys(portfolioTemplates).map(id => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1).replace('-', ' '),
    category: 'portfolio'
  }))
}

export function getAllResumeTemplates() {
  return Object.keys(resumeTemplates).map(id => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1).replace('-', ' '),
    category: 'resume'
  }))
}
