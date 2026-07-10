import { TaxonomyCategoryModule } from '../../types';
const m: TaxonomyCategoryModule = {
  category: 'MUSIC', type: 'ENT', version: '1.0.0',
  subtopics: {
    releases: { weight: 55, keywords: ['official music video','official video','official audio','lyrics video','lyric video','music video','mv','audio song','full song','new song','latest song','music release','album','single','ep','tracklist'] },
    genres: { weight: 50, keywords: ['pop music','hip hop','rap music','rnb','rhythm and blues','edm','electronic music','house music','techno','trance','bollywood song','hindi song','tamil song','telugu song','punjabi song','k-pop','kpop','classical music','jazz','blues','rock music','indie music','lofi','lo fi','chill music'] },
    artists: { weight: 48, keywords: ['arijit singh','shreya ghoshal','jubin nautiyal','taylor swift','drake','weeknd','billie eilish','dua lipa','bad bunny','bts','blackpink','cold play','ed sheeran','eminem','kendrick lamar','travis scott'] },
    content: { weight: 45, keywords: ['remix','cover song','acoustic version','mashup','ost','soundtrack','background music','ringtone','karaoke','ft.','feat.','prod.','live concert','live performance','music tour','album review','song reaction','music reaction'] },
  },
};
export default m;
