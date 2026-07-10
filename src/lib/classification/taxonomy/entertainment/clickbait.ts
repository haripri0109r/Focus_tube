import { TaxonomyCategoryModule } from '../../types';
const m: TaxonomyCategoryModule = {
  category: 'CLICKBAIT', type: 'ENT', version: '1.0.0',
  subtopics: {
    clickbait_phrases: {
      weight: 60,
      keywords: [
        'omg','shocking','you won\'t believe','insane','impossible','gone wrong',
        'must watch','watch till end','don\'t skip','wait for it','last to leave',
        'i can\'t believe','emotional','actually happened','real story','exposing',
        'exposed','truth revealed','secret revealed','they said it was impossible',
        'police called','ambulance called','gone viral','breaking news alert',
        'urgent','warning','immediately','must see','jaw dropping',
        '100 dollars','1000 dollars','$1 vs $10000','$1 vs $1000000',
        'buying','i spent','i wasted','extreme','worlds biggest','world record attempt',
        'unbelievable','mindblowing','mind blowing',
      ],
    },
    sensational: {
      weight: 55,
      keywords: [
        'i survived','surviving','24 hours in jail','24 hours in','spending 24 hours',
        'living for 24 hours','i lived as','being homeless','becoming',
        'quit my job','quit school','dropped out','best in the world',
        'never been done','nobody has ever','first time ever','changed my life',
      ],
    },
  },
};
export default m;
