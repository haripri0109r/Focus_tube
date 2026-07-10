import { TaxonomyCategoryModule } from '../../types';
const m: TaxonomyCategoryModule = {
  category: 'SCIENCE', type: 'EDU', version: '1.0.0',
  subtopics: {
    chemistry: { weight: 45, keywords: ['chemistry','organic chemistry','inorganic chemistry','physical chemistry','reaction mechanism','chemical bonding','periodic table','stoichiometry','thermochemistry','electrochemistry','spectroscopy','polymer','biochemistry','analytical chemistry'] },
    biology: { weight: 45, keywords: ['biology','cell biology','molecular biology','genetics','dna','rna','protein synthesis','evolution','ecology','microbiology','immunology','neuroscience','anatomy','physiology','botany','zoology','biotechnology','crispr','gene editing'] },
    medicine: { weight: 47, keywords: ['medicine','medical','anatomy','pharmacology','pathology','physiology medical','clinical medicine','surgery','cardiology','neurology','oncology','immunology medical','infectious disease','public health','epidemiology','biochemistry medical'] },
    research: { weight: 48, keywords: ['research','research paper','academic paper','peer reviewed','journal','literature review','methodology','hypothesis','experiment','data collection','statistical analysis','publication','arxiv','nature','science magazine'] },
  },
};
export default m;
