import { TaxonomyCategoryModule } from '../../types';
const m: TaxonomyCategoryModule = {
  category: 'SPORTS', type: 'ENT', version: '1.0.0',
  subtopics: {
    cricket: { weight: 45, keywords: ['cricket','ipl','india vs','match highlights','cricket highlights','test match','odi','t20','world cup cricket','bcci','cricket news','cricket reaction','sixes','wickets','batting highlights','bowling highlights'] },
    football: { weight: 45, keywords: ['football','soccer','premier league','la liga','serie a','bundesliga','champions league','world cup football','messi','ronaldo','goal highlights','football highlights','transfer news','football reaction'] },
    sports_general: { weight: 42, keywords: ['sports highlights','nba highlights','nfl highlights','formula 1','f1 race','tennis','wimbledon','olympics','gold medal','world record','athlete','fitness','gym workout','workout motivation'] },
  },
};
export default m;
