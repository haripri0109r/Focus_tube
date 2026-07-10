import { TaxonomyCategoryModule } from '../../types';
const m: TaxonomyCategoryModule = {
  category: 'GAMING', type: 'ENT', version: '1.0.0',
  subtopics: {
    general: { weight: 40, keywords: ['gaming','gameplay','playthrough','let\'s play','game review','game trailer','gaming setup','pc gaming','console gaming','gaming news','esports','tournament','gaming highlights','speedrun'] },
    titles: { weight: 45, keywords: ['minecraft','roblox','fortnite','valorant','genshin impact','call of duty','warzone','apex legends','pubg','among us','fall guys','elden ring','gta','grand theft auto','fifa','nba 2k','pokemon','zelda','mario','halo','destiny','league of legends','dota','cs go','counter strike','overwatch'] },
    content: { weight: 42, keywords: ['game highlights','clutch','montage','best plays','ranked gameplay','pro player','streamer','twitch highlights','gaming fails','gaming moments','trolling in game','griefing','modded gameplay','game mods'] },
  },
};
export default m;
