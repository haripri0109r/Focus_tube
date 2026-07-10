import { TaxonomyCategoryModule } from '../../types';
const m: TaxonomyCategoryModule = {
  category: 'FINANCE', type: 'EDU', version: '1.0.0',
  subtopics: {
    investing: { weight: 45, keywords: ['investing','investment','stock market','stocks','equities','mutual fund','etf','index fund','portfolio','diversification','asset allocation','rebalancing','long term investing','value investing','growth investing','dividend investing'] },
    trading: { weight: 42, keywords: ['trading','day trading','swing trading','technical analysis','fundamental analysis','candlestick chart','support resistance','moving average','rsi','macd','bollinger bands','options trading','futures trading','forex'] },
    personal_finance: { weight: 44, keywords: ['personal finance','budgeting','saving','emergency fund','financial planning','retirement planning','401k','ira','tax planning','income tax','estate planning','insurance','financial independence','fire movement'] },
    economics: { weight: 44, keywords: ['economics','microeconomics','macroeconomics','gdp','inflation','interest rate','monetary policy','fiscal policy','supply demand','market equilibrium','economic growth','recession','central bank','rbi','fed'] },
    crypto: { weight: 40, keywords: ['cryptocurrency','bitcoin','ethereum','blockchain','defi','decentralized finance','web3','nft','crypto tutorial','smart contract','solidity','dao'] },
  },
};
export default m;
