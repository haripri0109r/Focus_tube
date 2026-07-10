import { TaxonomyCategoryModule } from '../../types';
const m: TaxonomyCategoryModule = {
  category: 'VLOGS', type: 'ENT', version: '1.0.0',
  subtopics: {
    vlogs: { weight: 40, keywords: ['vlog','vlogging','day in my life','day in the life','spend the day with me','come with me','my daily routine','morning routine','night routine','weekly vlog','travel vlog','life update','what i eat in a day','a day as'] },
    challenges: { weight: 55, keywords: ['challenge','24 hour challenge','last to leave','i survived','spend 24 hours','24 hours in','100 layers','eating only','challenge accepted','trying','i tried','extreme challenge','viral challenge','tiktok challenge','trend challenge'] },
    pranks: { weight: 60, keywords: ['prank','prank on','gone wrong','prank gone wrong','pranking','hidden camera prank','on strangers','social experiment prank','public prank','extreme prank'] },
    reactions: { weight: 45, keywords: ['reaction','reacting to','watching for the first time','my reaction','reaction video','couples react','react to','try not to react','blind reaction'] },
    lifestyle: { weight: 40, keywords: ['lifestyle','luxury lifestyle','morning routine lifestyle','night routine lifestyle','productive morning','productive day','productivity vlog','study with me','productive routine','haul','shopping haul','what i bought','outfit of the day','grwm','get ready with me'] },
  },
};
export default m;
