import { TaxonomyCategoryModule } from '../../types';
const m: TaxonomyCategoryModule = {
  category: 'PRODUCTIVITY', type: 'EDU', version: '1.0.0',
  subtopics: {
    productivity: { weight: 38, keywords: ['productivity','time management','deep work','focus','pomodoro','getting things done','gtd','second brain','building a second brain','notion','obsidian','roam research','zettelkasten','atomic habits','habit building','morning routine','evening routine','journaling'] },
    business: { weight: 38, keywords: ['business','entrepreneurship','startup','product management','marketing','growth hacking','sales','negotiation','leadership','management','strategy','business model','venture capital','fundraising','pitch deck','mba concepts'] },
    history: { weight: 40, keywords: ['history','world history','ancient history','medieval history','modern history','indian history','american history','world war','colonialism','revolution','civilization','historical event','archaeology','art history'] },
    language: { weight: 40, keywords: ['language learning','learn english','english grammar','vocabulary','english speaking','ielts','toefl','learn spanish','learn french','learn german','learn japanese','learn korean','learn hindi','pronunciation','fluency'] },
    law: { weight: 42, keywords: ['law','legal','constitution','constitutional law','criminal law','civil law','corporate law','intellectual property','contract law','jurisprudence','court system','legal analysis','law school','bar exam'] },
  },
};
export default m;
