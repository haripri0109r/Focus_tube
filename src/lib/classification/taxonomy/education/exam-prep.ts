import { TaxonomyCategoryModule } from '../../types';
const m: TaxonomyCategoryModule = {
  category: 'EXAM_PREP', type: 'EDU', version: '1.0.0',
  subtopics: {
    upsc: { weight: 50, keywords: ['upsc','ias','ips','ifs','civil services examination','upsc prelims','upsc mains','upsc essay','general studies','gs paper','optional subject','upsc current affairs','upsc syllabus','ncert for upsc','vision ias','insights ias','forum ias'] },
    jee: { weight: 50, keywords: ['jee mains','jee advanced','iit jee','nit','bitsat','jee preparation','jee physics','jee chemistry','jee maths','jee mathematics','jee 2025','jee 2026','organic chemistry jee','mechanics jee','coordinate geometry jee','allen institute','fiitjee','resonance kota','aakash jee','physics wallah jee'] },
    neet: { weight: 50, keywords: ['neet','neet ug','neet preparation','neet 2025','neet biology','neet physics','neet chemistry','medical entrance','mbbs entrance','aiims','ncert biology neet','anatomy neet','physiology neet','biochemistry neet','aakash neet','allen neet','physics wallah neet'] },
    gate: { weight: 48, keywords: ['gate exam','gate preparation','gate cse','gate ece','gate ee','gate me','gate cs','gate 2025','gate previous year','gate mock test'] },
    gre_gmat: { weight: 45, keywords: ['gre','gre preparation','gre verbal','gre quant','gmat','gmat preparation','gmat verbal','gmat quant','gmat data insights','mba entrance','cat exam','cat preparation','xat'] },
    sat: { weight: 45, keywords: ['sat','sat preparation','sat math','sat reading','sat writing','act exam','ap exam','advanced placement'] },
  },
};
export default m;
