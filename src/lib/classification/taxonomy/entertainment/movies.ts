import { TaxonomyCategoryModule } from '../../types';
const m: TaxonomyCategoryModule = {
  category: 'MOVIES', type: 'ENT', version: '1.0.0',
  subtopics: {
    movies: { weight: 50, keywords: ['movie','film','cinema','official trailer','teaser','movie review','film review','movie reaction','watching','web series','series','episode','season','new episode','webseries','web show','tv show','serial','soap opera','ott','netflix','amazon prime','hotstar','disney plus','hbo max','apple tv'] },
    bollywood: { weight: 52, keywords: ['bollywood','bollywood movie','hindi film','hindi movie','new hindi movie','bollywood trailer','bollywood song','kollywood','tollywood','mollywood','tamil movie','telugu movie','malayalam movie','kannada movie','south indian film','dubbed movie'] },
    celebrities: { weight: 50, keywords: ['celebrity','celeb','gossip','exposed','drama','apology video','we broke up','beef','feud','cancelled','cancel culture','celebrity interview','red carpet','award show','paparazzi','celebrity news'] },
    comedy: { weight: 42, keywords: ['comedy','funny video','roast','roasting','stand up comedy','standup','sketch comedy','skit','parody','spoof','compilation','funny moments','try not to laugh','fail compilation','bloopers','memes compilation'] },
    food_travel: { weight: 40, keywords: ['mukbang','food review','restaurant review','street food','food challenge','eating challenge','asmr eating','travel','travel vlog','vacation','explore city','city tour','budget travel','luxury travel','solo travel','fashion','makeup tutorial','beauty','skincare routine','ootd'] },
  },
};
export default m;
